package com.dinner.whatsfordinner.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

enum class AppetiteTone {
    Protein,
    Garden,
    Broth,
    Harvest
}

data class FoodMoodPalette(
    val accent: Color,
    val accentStrong: Color,
    val surface: Color,
    val surfaceDeep: Color,
    val textOnAccent: Color = OnPrimaryWhite
) {
    fun cardBrush(): Brush = Brush.linearGradient(colors = listOf(surface, surfaceDeep))
}

fun appetiteToneForCategory(categoryName: String): AppetiteTone {
    return when (categoryName.trim()) {
        "荤菜" -> AppetiteTone.Protein
        "素菜" -> AppetiteTone.Garden
        "汤" -> AppetiteTone.Broth
        else -> AppetiteTone.Harvest
    }
}

fun foodMoodPaletteFor(categoryName: String): FoodMoodPalette {
    return when (appetiteToneForCategory(categoryName)) {
        AppetiteTone.Protein -> FoodMoodPalette(
            accent = ProteinAccent,
            accentStrong = PrimaryTomatoDeep,
            surface = ProteinSurface,
            surfaceDeep = Color(0xFFFFF4EC)
        )

        AppetiteTone.Garden -> FoodMoodPalette(
            accent = GardenAccent,
            accentStrong = Color(0xFF537A38),
            surface = GardenSurface,
            surfaceDeep = Color(0xFFF8FCEB)
        )

        AppetiteTone.Broth -> FoodMoodPalette(
            accent = BrothAccent,
            accentStrong = Color(0xFF9E6525),
            surface = BrothSurface,
            surfaceDeep = Color(0xFFFFF5DB)
        )

        AppetiteTone.Harvest -> FoodMoodPalette(
            accent = HarvestAccent,
            accentStrong = Color(0xFF96532A),
            surface = HarvestSurface,
            surfaceDeep = Color(0xFFFFF5EC)
        )
    }
}
