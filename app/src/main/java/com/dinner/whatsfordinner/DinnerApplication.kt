package com.dinner.whatsfordinner

import android.app.Application
import android.content.Context
import androidx.work.WorkManager
import com.dinner.whatsfordinner.worker.DailyDinnerWorker
import com.dinner.whatsfordinner.worker.MidnightSelectionResetScheduler
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class DinnerApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
        scheduleNotificationsIfNeeded()
        MidnightSelectionResetScheduler.scheduleNext(this)
    }

    private fun scheduleNotificationsIfNeeded() {
        val workManager = WorkManager.getInstance(this)
        val scheduler = DailyDinnerWorker.Scheduler(workManager)

        // Read boot prefs to check if notifications were ever configured
        val bootPrefs = getSharedPreferences("notification_boot_prefs", Context.MODE_PRIVATE)
        val wasEnabled = bootPrefs.getBoolean("enabled", false)

        // If notifications were previously enabled, reschedule
        if (wasEnabled) {
            val hour = bootPrefs.getInt("hour", 17)
            val minute = bootPrefs.getInt("minute", 0)
            scheduler.scheduleWorker(hour, minute)
        }
    }

    companion object {
        lateinit var instance: DinnerApplication
            private set
    }
}
