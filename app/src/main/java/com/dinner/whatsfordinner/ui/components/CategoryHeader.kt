package com.dinner.whatsfordinner.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.dinner.whatsfordinner.ui.theme.PrimaryMeituanGreen

@Composable
fun CategoryHeader(
    categoryName: String,
    dishCount: Int,
    modifier: Modifier = Modifier
) {
    Text(
        text = "$categoryName · ${dishCount}道菜",
        style = MaterialTheme.typography.titleMedium,
        color = PrimaryMeituanGreen,
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(PrimaryMeituanGreen.copy(alpha = 0.08f))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    )
}
