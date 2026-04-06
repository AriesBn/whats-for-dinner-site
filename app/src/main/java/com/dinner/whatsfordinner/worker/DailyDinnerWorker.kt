package com.dinner.whatsfordinner.worker

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.dinner.whatsfordinner.DinnerApplication
import com.dinner.whatsfordinner.MainActivity
import com.dinner.whatsfordinner.R
import com.dinner.whatsfordinner.data.local.AppDatabase
import com.dinner.whatsfordinner.data.photo.PhotoManager
import java.util.Calendar
import java.util.concurrent.TimeUnit

class DailyDinnerWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    companion object {
        const val WORK_NAME = "daily_dinner_notification"
        private const val CHANNEL_ID = "daily_dinner_channel"
    }

    override suspend fun doWork(): Result {
        val database = AppDatabase.getDatabase(applicationContext)
        val dishDao = database.dishDao()
        val photoManager = PhotoManager(applicationContext)

        val randomDish = dishDao.getRandomDish()
        if (randomDish == null) {
            return Result.success()
        }

        showNotification(applicationContext, randomDish.name, randomDish.photoUri, photoManager)
        return Result.success()
    }

    private fun showNotification(
        context: Context,
        dishName: String,
        photoUri: String?,
        photoManager: PhotoManager
    ) {
        ensureChannelExists(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val largeIcon = if (!photoUri.isNullOrEmpty()) {
            val file = photoManager.getPhotoFile(photoUri)
            if (file.exists()) BitmapFactory.decodeFile(file.absolutePath) else null
        } else null

        val notificationStyle = NotificationCompat.BigTextStyle()
            .bigText(context.getString(R.string.notification_body_format, dishName))

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_default_dish)
            .setContentTitle(context.getString(R.string.notification_title))
            .setContentText(context.getString(R.string.notification_body_format, dishName))
            .setStyle(notificationStyle)
            .setLargeIcon(largeIcon)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt() % 1000, notification)
    }

    private fun ensureChannelExists(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channelName = context.getString(R.string.app_name)
            val channel = NotificationChannel(
                CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Helper class for scheduling the worker from outside Hilt DI.
     */
    class Scheduler(private val workManager: WorkManager) {

        fun scheduleWorker(hour: Int, minute: Int) {
            val now = Calendar.getInstance()
            val targetTime = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                if (before(now)) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val initialDelay = targetTime.timeInMillis - now.timeInMillis

            val workRequest = PeriodicWorkRequestBuilder<DailyDinnerWorker>(
                24, TimeUnit.HOURS
            )
                .setInitialDelay(initialDelay, TimeUnit.MILLISECONDS)
                .build()

            workManager.enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.REPLACE,
                workRequest
            )
        }

        fun cancelWorker() {
            workManager.cancelUniqueWork(WORK_NAME)
        }
    }
}
