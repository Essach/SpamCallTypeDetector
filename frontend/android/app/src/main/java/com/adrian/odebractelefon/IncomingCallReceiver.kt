package com.adrian.odebractelefon

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.telephony.TelephonyManager
import android.util.Log
import com.facebook.react.HeadlessJsTaskService

/**
 * Nasłuchuje zmian stanu telefonu.
 * Gdy wykryje stan RINGING (dzwoni przychodzące połączenie),
 * odpala Headless JS Task, który wywoła Twoje API i pokaże powiadomienie.
 */
class IncomingCallReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        Log.d("CallDetector", "onReceive wywolany, action=${intent.action}")

        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

        Log.d("CallDetector", "state=$state, number=$incomingNumber")

        if (state == TelephonyManager.EXTRA_STATE_RINGING && !incomingNumber.isNullOrEmpty()) {
            Log.d("CallDetector", "Uruchamiam headless task dla numeru $incomingNumber")
            val serviceIntent = Intent(context, IncomingCallHeadlessTaskService::class.java)
            val bundle = Bundle()
            bundle.putString("phoneNumber", incomingNumber)
            serviceIntent.putExtras(bundle)

            // Uruchomienie serwisu jako foreground (wymagane od Androida 8+ dla usług w tle,
            // gdy appka nie jest aktywnie na pierwszym planie)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            HeadlessJsTaskService.acquireWakeLockNow(context)
        }
    }
}