package com.dinner.whatsfordinner.ui.screens

import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.dinner.whatsfordinner.R
import com.dinner.whatsfordinner.data.local.entity.DishEntity
import com.dinner.whatsfordinner.ui.theme.BackgroundCream
import com.dinner.whatsfordinner.ui.theme.BackgroundWarm
import com.dinner.whatsfordinner.ui.theme.OnPrimaryWhite
import com.dinner.whatsfordinner.ui.theme.OnSurfaceText
import com.dinner.whatsfordinner.ui.theme.OnSurfaceTextSecondary
import com.dinner.whatsfordinner.ui.theme.PrimaryTomato
import com.dinner.whatsfordinner.ui.theme.PrimaryTomatoDeep
import java.io.File

@Composable
fun RandomPickerScreen(
    modifier: Modifier = Modifier,
    selectedDishes: List<DishEntity>,
    onRemoveDish: (Int) -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(colors = listOf(BackgroundWarm, BackgroundCream)))
            .padding(horizontal = 16.dp, vertical = 18.dp)
    ) {
        if (selectedDishes.isEmpty()) {
            EmptySelectedDishesState()
        } else {
            AnimatedVisibility(
                visible = true,
                enter = fadeIn() + slideInVertically(initialOffsetY = { it / 5 })
            ) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(top = 12.dp, bottom = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(selectedDishes, key = { it.id }) { dish ->
                        SelectedDishCard(
                            dish = dish,
                            onRemove = { onRemoveDish(dish.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptySelectedDishesState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Image(
                painter = painterResource(R.drawable.ic_default_dish),
                contentDescription = null,
                modifier = Modifier.size(92.dp),
                contentScale = ContentScale.Fit
            )

            Text(
                text = "今晚还没有备选菜",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
                color = OnSurfaceText,
                modifier = Modifier.padding(top = 18.dp)
            )

            Text(
                text = "先去首页挑几道想吃的，这里就会变成今晚的候选菜单。",
                style = MaterialTheme.typography.bodyLarge,
                color = OnSurfaceTextSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 10.dp, start = 24.dp, end = 24.dp)
            )
        }
    }
}

@Composable
private fun SelectedDishCard(
    dish: DishEntity,
    onRemove: () -> Unit
) {
    val context = LocalContext.current
    val displayUri = run {
        if (dish.photoUri.isEmpty()) {
            null
        } else if (dish.photoUri.startsWith("file://", ignoreCase = true)) {
            Uri.parse(dish.photoUri)
        } else {
            val file = File(context.filesDir, dish.photoUri)
            if (file.exists()) Uri.fromFile(file) else null
        }
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFCF8)),
        elevation = CardDefaults.cardElevation(defaultElevation = 10.dp)
    ) {
        Box {
            Column {
                if (displayUri != null) {
                    AsyncImage(
                        model = displayUri,
                        contentDescription = dish.name,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(128.dp),
                        contentScale = ContentScale.Crop,
                        error = painterResource(R.drawable.ic_default_dish),
                        placeholder = painterResource(R.drawable.ic_default_dish)
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(128.dp)
                            .background(BackgroundWarm),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(R.drawable.ic_default_dish),
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            contentScale = ContentScale.Fit
                        )
                    }
                }

                Text(
                    text = dish.name,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = OnSurfaceText,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp)
                )
            }

            Row(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(12.dp)
                    .background(PrimaryTomato, RoundedCornerShape(12.dp))
                    .clickable(onClick = onRemove)
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "删除",
                    tint = OnPrimaryWhite,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "移出",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = OnPrimaryWhite
                )
            }
        }
    }
}
