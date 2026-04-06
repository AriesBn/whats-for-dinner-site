package com.dinner.whatsfordinner.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dinner.whatsfordinner.data.prefs.NotificationPrefs
import com.dinner.whatsfordinner.data.prefs.NotificationPrefsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val prefsRepository: NotificationPrefsRepository
) : ViewModel() {

    private var _prefs = NotificationPrefs()
    val prefs: NotificationPrefs get() = _prefs

    init {
        observePrefs()
    }

    private fun observePrefs() {
        viewModelScope.launch {
            prefsRepository.preferences.collect { newPrefs ->
                _prefs = newPrefs
            }
        }
    }

    fun updateEnabled(enabled: Boolean) {
        viewModelScope.launch {
            prefsRepository.updateEnabled(enabled)
        }
    }

    fun updateTime(hour: Int, minute: Int) {
        viewModelScope.launch {
            prefsRepository.updateTime(hour, minute)
        }
    }
}
