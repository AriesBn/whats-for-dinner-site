package com.dinner.whatsfordinner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import com.dinner.whatsfordinner.navigation.Screen
import com.dinner.whatsfordinner.ui.screens.AddDishScreen
import com.dinner.whatsfordinner.ui.screens.DishListScreen
import com.dinner.whatsfordinner.ui.screens.RandomPickerScreen
import com.dinner.whatsfordinner.ui.screens.SettingsScreen
import com.dinner.whatsfordinner.ui.theme.BackgroundCream
import com.dinner.whatsfordinner.ui.theme.SurfaceWhite
import com.dinner.whatsfordinner.ui.theme.WhatsfordinnerTheme
import com.dinner.whatsfordinner.ui.viewmodels.DishListViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WhatsfordinnerTheme {
                MainScreen()
            }
        }
    }
}

data class BottomNavItem(
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val screen: Screen
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val screenState = remember { MainScreenState() }
    var showAddDish by remember { mutableStateOf(false) }

    val navItems = listOf(
        BottomNavItem(
            title = stringResource(R.string.nav_home),
            selectedIcon = Icons.Filled.Home,
            unselectedIcon = Icons.Outlined.Home,
            screen = Screen.Home
        ),
        BottomNavItem(
            title = stringResource(R.string.nav_picker),
            selectedIcon = Icons.Filled.Restaurant,
            unselectedIcon = Icons.Outlined.Restaurant,
            screen = Screen.Picker
        ),
        BottomNavItem(
            title = stringResource(R.string.nav_settings),
            selectedIcon = Icons.Filled.Settings,
            unselectedIcon = Icons.Outlined.Settings,
            screen = Screen.Settings
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.app_name)) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = BackgroundCream,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = {
            NavigationBar(containerColor = SurfaceWhite) {
                navItems.forEach { item ->
                    NavigationBarItem(
                        selected = screenState.currentScreen == item.screen,
                        onClick = { screenState.navigateTo(item.screen) },
                        icon = {
                            Icon(
                                imageVector = if (screenState.currentScreen == item.screen) item.selectedIcon else item.unselectedIcon,
                                contentDescription = item.title
                            )
                        },
                        label = { Text(item.title) }
                    )
                }
            }
        },
        floatingActionButton = {
            if (screenState.currentScreen == Screen.Home) {
                FloatingActionButton(
                    onClick = { showAddDish = true },
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    Icon(Icons.Filled.Add, contentDescription = stringResource(R.string.add_dish))
                }
            }
        }
    ) { paddingValues ->
        when (screenState.currentScreen) {
            Screen.Home -> {
                val dishVm = hiltViewModel<DishListViewModel>()
                DishListScreen(
                    modifier = Modifier.padding(paddingValues),
                    viewModel = dishVm
                )
            }
            Screen.Picker -> {
                val dishVm = hiltViewModel<DishListViewModel>()
                val selectedIds = dishVm.selectedDishes.collectAsState()
                val dishesByCat = dishVm.dishesByCategory.collectAsState()
                val allDishes = dishesByCat.value.values.flatten()
                val selectedDishList = allDishes.filter { it.id in selectedIds.value }
                RandomPickerScreen(
                    modifier = Modifier.padding(paddingValues),
                    selectedDishes = selectedDishList,
                    onRemoveDish = { dishVm.toggleDishSelection(it) }
                )
            }
            Screen.Settings -> SettingsScreen()
            else -> DishListScreen(modifier = Modifier.padding(paddingValues))
        }
    }

    if (showAddDish) {
        AddDishScreen(
            onDismiss = { showAddDish = false },
            onSuccess = { showAddDish = false }
        )
    }
}
