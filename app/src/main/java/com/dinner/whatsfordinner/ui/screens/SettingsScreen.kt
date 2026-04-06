package com.dinner.whatsfordinner.ui.screens

import android.app.TimePickerDialog
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.work.WorkManager
import com.dinner.whatsfordinner.R
import com.dinner.whatsfordinner.data.prefs.NotificationPrefs
import com.dinner.whatsfordinner.data.prefs.NotificationPrefsRepository
import com.dinner.whatsfordinner.ui.theme.OnPrimaryWhite
import com.dinner.whatsfordinner.ui.theme.OnSurfaceTextSecondary
import com.dinner.whatsfordinner.ui.theme.OnSurfaceTextTertiary
import com.dinner.whatsfordinner.ui.theme.PrimaryMeituanGreen
import com.dinner.whatsfordinner.worker.DailyDinnerWorker
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val prefsRepo = remember { NotificationPrefsRepository(context) }
    var prefs by remember { mutableStateOf(NotificationPrefs()) }
    var showTimePicker by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        prefsRepo.preferences.collect { prefs = it }
    }

    if (showTimePicker) {
        DisposableEffect(context, prefs.hour, prefs.minute, prefs.enabled) {
            val dialog = TimePickerDialog(
                context,
                { _, hour, minute ->
                    scope.launch {
                        prefsRepo.updateTime(hour, minute)
                    }
                    rescheduleWorker(context, hour, minute, prefs.enabled)
                    showTimePicker = false
                },
                prefs.hour,
                prefs.minute,
                true
            )
            dialog.setOnDismissListener { showTimePicker = false }
            dialog.show()
            onDispose { dialog.dismiss() }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            PrimaryMeituanGreen,
                            PrimaryMeituanGreen.copy(alpha = 0.85f)
                        )
                    )
                )
                .padding(horizontal = 16.dp, vertical = 24.dp)
        ) {
            Text(
                text = stringResource(R.string.nav_settings),
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = OnPrimaryWhite
                )
            )
        }

        Column(
            modifier = Modifier
                                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            SettingsCard(
                title = stringResource(R.string.settings_notification),
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Notifications,
                        title = stringResource(R.string.settings_notification_enabled),
                        trailing = {
                            Switch(
                                checked = prefs.enabled,
                                onCheckedChange = { enabled ->
                                    scope.launch {
                                        prefsRepo.updateEnabled(enabled)
                                    }
                                    if (enabled) {
                                        rescheduleWorker(context, prefs.hour, prefs.minute, true)
                                    } else {
                                        cancelWorker(context)
                                    }
                                }
                            )
                        }
                    ),
                    SettingsItem(
                        icon = Icons.Default.AccessTime,
                        title = "${stringResource(R.string.settings_notification_time)}: ${String.format("%02d:%02d", prefs.hour, prefs.minute)}",
                        clickable = true,
                        onClick = { showTimePicker = true }
                    )
                )
            )

            SettingsCard(
                title = stringResource(R.string.settings_app_info),
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "${stringResource(R.string.settings_version)}: 1.0.0",
                        subtitle = "每晚吃什么 · Meituan Style"
                    )
                )
            )
        }
    }
}

@Composable
private fun SettingsCard(
    title: String,
    items: List<SettingsItem>
) {
    Column(modifier = Modifier.padding(bottom = 16.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall.copy(
                fontWeight = FontWeight.SemiBold,
                color = OnSurfaceTextSecondary
            ),
            modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                items.forEachIndexed { index, item ->
                    SettingsRow(item = item, showDivider = index < items.lastIndex)
                }
            }
        }
    }
}

@Composable
private fun SettingsRow(
    item: SettingsItem,
    showDivider: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .then(
                if (item.clickable) {
                    item.onClick?.let { Modifier.clickable(onClick = it) } ?: Modifier
                } else {
                    Modifier
                }
            ),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = PrimaryMeituanGreen,
                modifier = Modifier.size(22.dp)
            )
            Column {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Normal)
                )
                item.subtitle?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = OnSurfaceTextTertiary
                    )
                }
            }
        }
        item.trailing?.invoke()
    }
    if (showDivider) {
        HorizontalDivider(color = Color(0xFFF0F0F0))
    }
}

private data class SettingsItem(
    val icon: ImageVector,
    val title: String,
    val subtitle: String? = null,
    val trailing: @Composable (() -> Unit)? = null,
    val clickable: Boolean = false,
    val onClick: (() -> Unit)? = null
)

private fun rescheduleWorker(context: Context, hour: Int, minute: Int, enabled: Boolean) {
    val scheduler = DailyDinnerWorker.Scheduler(WorkManager.getInstance(context))
    if (enabled) {
        scheduler.scheduleWorker(hour, minute)
    } else {
        scheduler.cancelWorker()
    }
}

private fun cancelWorker(context: Context) {
    DailyDinnerWorker.Scheduler(WorkManager.getInstance(context)).cancelWorker()
}

