package com.dinner.whatsfordinner.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Picker : Screen("picker")
    object Settings : Screen("settings")
    object AddDish : Screen("add_dish")
}
