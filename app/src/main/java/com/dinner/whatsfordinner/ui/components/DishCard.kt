package com.dinner.whatsfordinner.ui.components

import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.dinner.whatsfordinner.R
import com.dinner.whatsfordinner.data.local.entity.DishEntity
import com.dinner.whatsfordinner.ui.theme.BackgroundWarm
import com.dinner.whatsfordinner.ui.theme.BorderColor
import com.dinner.whatsfordinner.ui.theme.OnPrimaryWhite
import com.dinner.whatsfordinner.ui.theme.PrimaryTomato
import com.dinner.whatsfordinner.ui.theme.PrimaryTomatoDeep
import com.dinner.whatsfordinner.ui.theme.SurfaceWhite
import java.io.File

@Composable
fun DishCard(
    dish: DishEntity,
    onDishClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
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
        modifier = modifier
            .size(100.dp)
            .then(if (onDishClick != null) Modifier.clickable(onClick = onDishClick) else Modifier),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (displayUri != null) {
                AsyncImage(
                    model = displayUri,
                    contentDescription = dish.name,
                    modifier = Modifier.size(100.dp, 65.dp),
                    contentScale = ContentScale.Crop,
                    error = painterResource(R.drawable.ic_default_dish),
                    placeholder = painterResource(R.drawable.ic_default_dish)
                )
            } else {
                Box(
                    modifier = Modifier.size(100.dp, 65.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(R.drawable.ic_default_dish),
                        contentDescription = null,
                        modifier = Modifier.size(65.dp),
                        contentScale = ContentScale.Fit
                    )
                }
            }

            Text(
                text = dish.name,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}

@Composable
fun DishCardWithDelete(
    dish: DishEntity,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.size(100.dp)) {
        DishCard(dish = dish)
        Box(
            modifier = Modifier
                .size(20.dp)
                .align(Alignment.TopEnd)
                .clickable(onClick = onDelete)
                .background(Color(0xFFFF4D4F).copy(alpha = 0.9f), RoundedCornerShape(10.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text("\u00d7", color = OnPrimaryWhite)
        }
    }
}

@Composable
fun DishCardWithDeleteAndAdd(
    dish: DishEntity,
    isSelected: Boolean,
    onToggleAdd: () -> Unit,
    modifier: Modifier = Modifier
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
        modifier = modifier
            .fillMaxWidth()
            .height(198.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(132.dp)
                        .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                ) {
                    if (displayUri != null) {
                        AsyncImage(
                            model = displayUri,
                            contentDescription = dish.name,
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    BackgroundWarm,
                                    RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
                                ),
                            contentScale = ContentScale.Crop,
                            error = painterResource(R.drawable.ic_default_dish)
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    BackgroundWarm,
                                    RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(R.drawable.ic_default_dish),
                                contentDescription = null,
                                modifier = Modifier.size(60.dp),
                                contentScale = ContentScale.Fit
                            )
                        }
                    }
                }

                Text(
                    text = dish.name,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 12.dp)
                )
            }

            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(12.dp)
                    .size(34.dp)
                    .clickable(enabled = !isSelected, onClick = onToggleAdd)
                    .border(
                        width = if (isSelected) 1.dp else 0.dp,
                        color = if (isSelected) BorderColor else Color.Transparent,
                        shape = RoundedCornerShape(12.dp)
                    )
                    .background(
                        color = if (isSelected) BackgroundWarm else PrimaryTomato,
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (isSelected) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "已添加",
                        tint = PrimaryTomatoDeep,
                        modifier = Modifier.size(16.dp)
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "添加到今晚",
                        tint = OnPrimaryWhite,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
