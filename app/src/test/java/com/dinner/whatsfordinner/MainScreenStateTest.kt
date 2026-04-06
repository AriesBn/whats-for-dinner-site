package com.dinner.whatsfordinner

import com.dinner.whatsfordinner.navigation.Screen
import org.junit.Assert.assertEquals
import org.junit.Test

class MainScreenStateTest {

    @Test
    fun `confirming selection from picker returns to home tab`() {
        val state = MainScreenState(initialScreen = Screen.Picker)

        state.confirmDishSelection()

        assertEquals(Screen.Home, state.currentScreen)
    }
}
