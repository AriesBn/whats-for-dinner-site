package com.dinner.whatsfordinner.ui.screens

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.dinner.whatsfordinner.R
import com.dinner.whatsfordinner.data.local.entity.CategoryEntity
import com.dinner.whatsfordinner.data.local.entity.DishEntity
import com.dinner.whatsfordinner.ui.components.DishCardWithDeleteAndAdd
import com.dinner.whatsfordinner.ui.theme.BackgroundCream
import com.dinner.whatsfordinner.ui.theme.BackgroundWarm
import com.dinner.whatsfordinner.ui.theme.OnPrimaryWhite
import com.dinner.whatsfordinner.ui.theme.OnSurfaceTextSecondary
import com.dinner.whatsfordinner.ui.theme.PrimaryTomato
import com.dinner.whatsfordinner.ui.theme.PrimaryTomatoDeep
import com.dinner.whatsfordinner.ui.theme.SurfaceWhite
import com.dinner.whatsfordinner.ui.theme.foodMoodPaletteFor
import com.dinner.whatsfordinner.ui.viewmodels.DishListViewModel
import kotlinx.coroutines.launch

@Composable
fun DishListScreen(
    modifier: Modifier = Modifier,
    viewModel: DishListViewModel = hiltViewModel()
) {
    val categoriesWithDishes by viewModel.categoriesWithDishes.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val selectedDishes = viewModel.selectedDishes.collectAsState().value
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    fun handleToggleDish(dishId: Int) {
        val wasSelected = selectedDishes.contains(dishId)
        viewModel.toggleDishSelection(dishId)
        if (!wasSelected) {
            coroutineScope.launch {
                snackbarHostState.showSnackbar("已加入今晚菜单")
            }
        }
    }

    Scaffold(
        modifier = modifier,
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                if (selectedCategory != null) {
                    val categoryWithDishes = categoriesWithDishes.find { it.category.id == selectedCategory }
                    CategoryDetailView(
                        category = categoryWithDishes?.category,
                        dishes = categoryWithDishes?.dishes ?: emptyList(),
                        selectedDishes = selectedDishes,
                        onBack = { viewModel.goBack() },
                        onToggleDish = { dishId -> handleToggleDish(dishId) }
                    )
                } else {
                    CategoryGridView(
                        categories = categoriesWithDishes.map { it.category },
                        dishesCountByCategory = categoriesWithDishes.associate { it.category.id to it.dishes.size },
                        onSelectCategory = { viewModel.selectCategory(it) }
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryGridView(
    categories: List<CategoryEntity>,
    dishesCountByCategory: Map<Int, Int>,
    onSelectCategory: (Int) -> Unit
) {
    if (categories.isEmpty()) {
        EmptyCategoriesState()
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(colors = listOf(BackgroundWarm, BackgroundCream)))
    ) {
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(categories) { category ->
                CategoryCard(
                    category = category,
                    dishCount = dishesCountByCategory[category.id] ?: 0,
                    onClick = { onSelectCategory(category.id) }
                )
            }
        }
    }
}

@Composable
private fun CategoryCard(
    category: CategoryEntity,
    dishCount: Int,
    onClick: () -> Unit
) {
    val palette = foodMoodPaletteFor(category.name)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.92f)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(26.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(palette.cardBrush())
                .padding(18.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = category.name.take(1),
                style = MaterialTheme.typography.displayLarge.copy(
                    fontSize = MaterialTheme.typography.displayLarge.fontSize * 0.9f,
                    color = palette.accentStrong
                )
            )

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = category.name,
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = palette.accentStrong
                    )
                )
                Text(
                    text = when (category.name) {
                        "荤菜" -> "想吃点扎实又满足的"
                        "素菜" -> "来点清爽解腻的"
                        "汤" -> "喝一口热乎的"
                        else -> "补上主食和幸福感"
                    },
                    style = MaterialTheme.typography.bodySmall.copy(color = OnSurfaceTextSecondary)
                )
                Card(
                    shape = RoundedCornerShape(999.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite.copy(alpha = 0.88f))
                ) {
                    Text(
                        text = "${dishCount} 道可选",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = palette.accentStrong,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyCategoriesState() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(colors = listOf(BackgroundWarm, BackgroundCream))),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = "\uD83C\uDF72", style = MaterialTheme.typography.displayLarge)
            Text(
                text = stringResource(R.string.empty_dishes),
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
                color = OnSurfaceTextSecondary,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
private fun CategoryDetailView(
    category: CategoryEntity?,
    dishes: List<DishEntity>,
    selectedDishes: Set<Int>,
    onBack: () -> Unit,
    onToggleDish: (Int) -> Unit
) {
    val palette = foodMoodPaletteFor(category?.name ?: "")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(colors = listOf(BackgroundWarm, BackgroundCream)))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceWhite.copy(alpha = 0.9f))
                .padding(horizontal = 8.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack, modifier = Modifier.padding(start = 4.dp)) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "返回",
                    tint = palette.accentStrong
                )
            }
            Column {
                Text(
                    text = category?.name ?: "",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = palette.accentStrong
                )
                Text(
                    text = if (dishes.isEmpty()) "还没有上桌的菜" else "挑一挑，组合今晚的菜单",
                    style = MaterialTheme.typography.bodySmall,
                    color = OnSurfaceTextSecondary
                )
            }
        }

        if (dishes.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 80.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(R.string.empty_category),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 18.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(dishes, key = { it.id }) { dish ->
                    DishCardWithDeleteAndAdd(
                        dish = dish,
                        isSelected = dish.id in selectedDishes,
                        onToggleAdd = { onToggleDish(dish.id) }
                    )
                }
            }
        }
    }
}
