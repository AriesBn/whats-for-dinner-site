package com.dinner.whatsfordinner.ui.theme

import org.junit.Assert.assertEquals
import org.junit.Test

class FoodMoodPaletteTest {

    @Test
    fun `uses warm protein palette for meat dishes`() {
        assertEquals(AppetiteTone.Protein, appetiteToneForCategory("荤菜"))
    }

    @Test
    fun `uses fresh garden palette for vegetable dishes`() {
        assertEquals(AppetiteTone.Garden, appetiteToneForCategory("素菜"))
    }

    @Test
    fun `uses cozy broth palette for soup dishes`() {
        assertEquals(AppetiteTone.Broth, appetiteToneForCategory("汤"))
    }

    @Test
    fun `falls back to harvest palette for unknown categories`() {
        assertEquals(AppetiteTone.Harvest, appetiteToneForCategory("小吃"))
    }
}
