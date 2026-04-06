package com.dinner.whatsfordinner.data.prefs

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "notification_prefs")

data class NotificationPrefs(
    val enabled: Boolean = true,
    val hour: Int = 17,
    val minute: Int = 0
)

@Singleton
class NotificationPrefsRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val BOOT_PREFS = "notification_boot_prefs"
        private const val KEY_ENABLED = "enabled"
        private const val KEY_HOUR = "hour"
        private const val KEY_MINUTE = "minute"

        private val DataKeys = object {
            val ENABLED = booleanPreferencesKey("notification_enabled")
            val HOUR = intPreferencesKey("notification_hour")
            val MINUTE = intPreferencesKey("notification_minute")
        }
    }

    val preferences: Flow<NotificationPrefs> = context.dataStore.data.map { prefs ->
        NotificationPrefs(
            enabled = prefs[DataKeys.ENABLED] ?: true,
            hour = prefs[DataKeys.HOUR] ?: 17,
            minute = prefs[DataKeys.MINUTE] ?: 0
        )
    }

    suspend fun updateEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[DataKeys.ENABLED] = enabled
        }
        // Mirror to SharedPreferences for BootReceiver
        context.getSharedPreferences(BOOT_PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean(KEY_ENABLED, enabled)
            .apply()
    }

    suspend fun updateTime(hour: Int, minute: Int) {
        context.dataStore.edit { prefs ->
            prefs[DataKeys.HOUR] = hour
            prefs[DataKeys.MINUTE] = minute
        }
        // Mirror to SharedPreferences for BootReceiver
        context.getSharedPreferences(BOOT_PREFS, Context.MODE_PRIVATE).edit()
            .putInt(KEY_HOUR, hour)
            .putInt(KEY_MINUTE, minute)
            .apply()
    }
}
