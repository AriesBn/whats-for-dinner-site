package com.dinner.whatsfordinner.worker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.WorkManager

/**
 * Reschedules notifications on device boot. Since DataStore (Kotlin coroutines)
 * cannot be accessed synchronously in a BroadcastReceiver, we use a simple
 * SharedPreferences mirror maintained by the app for this purpose.
 */
class BootReceiver : BroadcastReceiver() {
    companion object {
        private const val PREFS = "notification_boot_prefs"
        private const val KEY_ENABLED = "enabled"
        private const val KEY_HOUR = "hour"
        private const val KEY_MINUTE = "minute"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        val bootPrefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val enabled = bootPrefs.getBoolean(KEY_ENABLED, true)
        if (!enabled) return

        val hour = bootPrefs.getInt(KEY_HOUR, 17)
        val minute = bootPrefs.getInt(KEY_MINUTE, 0)

        val workManager = WorkManager.getInstance(context)
        val scheduler = DailyDinnerWorker.Scheduler(workManager)
        scheduler.scheduleWorker(hour, minute)
        MidnightSelectionResetScheduler.scheduleNext(context)
    }
}
