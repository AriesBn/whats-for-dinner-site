package com.dinner.whatsfordinner.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val AppetizingColorScheme = lightColorScheme(
    primary = PrimaryTomato,
    onPrimary = OnPrimaryWhite,
    primaryContainer = PrimaryTomatoSoft,
    secondary = SecondaryHoney,
    onSecondary = OnSecondaryDark,
    secondaryContainer = SecondaryHoneySoft,
    tertiary = AccentOlive,
    onTertiary = OnSecondaryDark,
    tertiaryContainer = AccentOliveSoft,
    surface = SurfaceWhite,
    onSurface = OnSurfaceText,
    surfaceVariant = SurfaceMuted,
    onSurfaceVariant = OnSurfaceTextSecondary,
    background = BackgroundCream,
    onBackground = OnSurfaceText,
    error = ErrorRed,
    onError = OnPrimaryWhite,
    outline = BorderColor,
    outlineVariant = DividerColor,
)

@Composable
fun WhatsfordinnerTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current
    SideEffect {
        val window = (view.context as Activity).window
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = true
            isAppearanceLightNavigationBars = true
        }
    }

    MaterialTheme(
        colorScheme = AppetizingColorScheme,
        typography = Typography,
        content = content
    )
}
