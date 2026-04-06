package com.dinner.whatsfordinner

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.dinner.whatsfordinner.navigation.Screen

class MainScreenState(initialScreen: Screen = Screen.Home) {
    var currentScreen by mutableStateOf(initialScreen)
        private set

    fun navigateTo(screen: Screen) {
        currentScreen = screen
    }

    fun confirmDishSelection() {
        currentScreen = Screen.Home
    }
}
