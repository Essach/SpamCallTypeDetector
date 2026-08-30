package com.adrian.odebractelefon

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import okhttp3.Call as OkCall
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

private const val CHANNEL_ID = "spam_check_results"
private const val TAG = "CallScreening"

// USTAW SWOJ PRAWDZIWY ADRES BACKENDU Z VERCEL:
private const val BASE_URL = "https://twoj-projekt.vercel.app"

class CallScreeningServiceImpl : CallScreeningService() {

    private val client = OkHttpClient()

    override fun onScreenCall(callDetails: Call.Details) {
        val rawNumber = callDetails.handle?.schemeSpecificPart
        Log.d(TAG, "onScreenCall wywolany, numer=$rawNumber")

        if (rawNumber.isNullOrEmpty()) return

        val response = CallResponse.Builder()
            .setDisallowCall(false)
            .setRejectCall(false)
            .build()

        respondToCall(callDetails, response)

        checkNumberAndNotify(rawNumber)
    }

    private fun checkNumberAndNotify(phoneNumber: String) {
        val json = JSONObject()
        json.put("phoneNumber", phoneNumber)

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = json.toString().toRequestBody(mediaType)

        val request = Request.Builder()
            .url("$BASE_URL/api/analyze-phone")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: OkCall, e: IOException) {
                Log.e(TAG, "Blad zapytania do backendu", e)

                val isConnectivityIssue = e is UnknownHostException || e is SocketTimeoutException

                if (isConnectivityIssue) {
                    showNotification(
                        phoneNumber,
                        "Brak internetu",
                        "Nie sprawdzono numeru. Kliknij po polaczeniu z siecia, zeby sprawdzic teraz."
                    )
                } else {
                    showNotification(
                        phoneNumber,
                        "Blad sprawdzania numeru",
                        "Cos poszlo nie tak. Kliknij, zeby sprobowac ponownie."
                    )
                }
            }

            override fun onResponse(call: OkCall, response: Response) {
                try {
                    val responseBody = response.body?.string()
                    Log.d(TAG, "HTTP status: ${response.code}, body: $responseBody")

                    if (responseBody == null) {
                        showNotification(
                            phoneNumber,
                            "Brak odpowiedzi",
                            "Serwer nie zwrocil danych. Kliknij, zeby sprobowac ponownie."
                        )
                        return
                    }

                    val data = JSONObject(responseBody)

                    if (!data.optBoolean("success", false)) {
                        showNotification(
                            phoneNumber,
                            "Brak danych",
                            "Nie udalo sie przeanalizowac numeru. Kliknij, zeby sprobowac ponownie."
                        )
                        return
                    }

                    val spamAnalysis = data.getJSONObject("spamAnalysis")
                    val recommendation = spamAnalysis.getJSONObject("recommendation")
                    val confidence = spamAnalysis.getInt("confidence")
                    val verdict = recommendation.getString("verdict")
                    val message = recommendation.getString("message")

                    showNotification(phoneNumber, "$verdict ($confidence%)", message)
                } catch (e: Exception) {
                    Log.e(TAG, "Blad przetwarzania odpowiedzi", e)
                    showNotification(
                        phoneNumber,
                        "Blad przetwarzania",
                        "Kliknij, zeby sprobowac ponownie."
                    )
                }
            }
        })
    }

    private fun showNotification(phoneNumber: String, title: String, body: String) {
        createChannelIfNeeded()

        val deepLinkUri = Uri.parse("odebractelefon://result?phone=$phoneNumber")
        val intent = Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
            setPackage(packageName)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            phoneNumber.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("$title \u2014 $phoneNumber")
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_menu_call)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(phoneNumber.hashCode(), notification)
    }

    private fun createChannelIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)
            if (manager.getNotificationChannel(CHANNEL_ID) == null) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Wyniki analizy numerow",
                    NotificationManager.IMPORTANCE_HIGH
                )
                manager.createNotificationChannel(channel)
            }
        }
    }
}