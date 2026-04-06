package com.dinner.whatsfordinner.data.prefs

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.selectedDishesDataStore: DataStore<Preferences> by preferencesDataStore(name = "selected_dishes_prefs")

@Singleton
class SelectedDishesRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val SELECTED_DISH_IDS = stringSetPreferencesKey("selected_dish_ids")
    }

    val selectedDishIds: Flow<Set<Int>> = context.selectedDishesDataStore.data.map { prefs ->
        prefs[SELECTED_DISH_IDS]
            ?.mapNotNull { it.toIntOrNull() }
            ?.toSet()
            ?: emptySet()
    }

    suspend fun toggleDishSelection(dishId: Int) {
        context.selectedDishesDataStore.edit { prefs ->
            val current = prefs[SELECTED_DISH_IDS]?.toMutableSet() ?: mutableSetOf()
            val id = dishId.toString()
            if (current.contains(id)) {
                current.remove(id)
            } else {
                current.add(id)
            }
            prefs[SELECTED_DISH_IDS] = current
        }
    }

    suspend fun clearSelectedDishes() {
        context.selectedDishesDataStore.edit { prefs ->
            prefs[SELECTED_DISH_IDS] = emptySet()
        }
    }
}
