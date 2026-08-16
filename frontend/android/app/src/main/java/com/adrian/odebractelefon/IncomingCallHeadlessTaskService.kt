package com.adrian.odebractelefon

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

private const val CHANNEL_ID = "call_check_channel"
private const val NOTIFICATION_ID = 1001

/**
 * Uruchamia zarejestrowany w JS task "IncomingCallCheck"
 * (patrz: index.js -> AppRegistry.registerHeadlessTask)
 */
class IncomingCallHeadlessTaskService : HeadlessJsTaskService() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Wymagane od Androida 8+ (API 26): serwis wystartowany przez
        // startForegroundService() MUSI wywolac startForeground() w ciagu 5 sekund,
        // inaczej system go zabija z ForegroundServiceDidNotStartInTimeException.
        createNotificationChannelIfNeeded()

        val notification = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("Sprawdzanie numeru...")
            .setContentText("Analizuje przychodzace polaczenie")
            .setSmallIcon(android.R.drawable.ic_menu_call)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        return super.onStartCommand(intent, flags, startId)
    }

    private fun createNotificationChannelIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)
            val existing = manager.getNotificationChannel(CHANNEL_ID)
            if (existing == null) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Sprawdzanie polaczen",
                    NotificationManager.IMPORTANCE_LOW
                )
                manager.createNotificationChannel(channel)
            }
        }
    }

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        val extras = intent.extras
        return if (extras != null) {
            HeadlessJsTaskConfig(
                "IncomingCallCheck",
                Arguments.fromBundle(extras),
                15000,
                true
            )
        } else {
            null
        }
    }
}