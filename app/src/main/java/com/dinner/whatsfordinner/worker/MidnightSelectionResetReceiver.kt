package com.dinner.whatsfordinner.worker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.dinner.whatsfordinner.data.prefs.SelectedDishesRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Calendar

class MidnightSelectionResetReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_RESET_SELECTIONS) return

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                SelectedDishesRepository(context).clearSelectedDishes()
                MidnightSelectionResetScheduler.scheduleNext(context)
            } finally {
                pendingResult.finish()
            }
        }
    }

    companion object {
        const val ACTION_RESET_SELECTIONS = "com.dinner.whatsfordinner.action.RESET_SELECTIONS"
    }
}

object MidnightSelectionResetScheduler {
    private const val REQUEST_CODE = 1001

    fun scheduleNext(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val triggerAtMillis = nextMidnightMillis()
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            Intent(context, MidnightSelectionResetReceiver::class.java).apply {
                action = MidnightSelectionResetReceiver.ACTION_RESET_SELECTIONS
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        when {
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager.canScheduleExactAlarms() -> {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M -> {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }
            else -> {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }
        }
    }

    internal fun nextMidnightMillis(now: Calendar = Calendar.getInstance()): Long {
        val target = now.clone() as Calendar
        target.add(Calendar.DAY_OF_YEAR, 1)
        target.set(Calendar.HOUR_OF_DAY, 0)
        target.set(Calendar.MINUTE, 0)
        target.set(Calendar.SECOND, 0)
        target.set(Calendar.MILLISECOND, 0)
        return target.timeInMillis
    }
}
