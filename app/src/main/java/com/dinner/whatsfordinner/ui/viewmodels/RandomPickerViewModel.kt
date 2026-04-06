package com.dinner.whatsfordinner.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dinner.whatsfordinner.data.local.entity.DishEntity
import com.dinner.whatsfordinner.data.repository.DishRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class PickerState {
    object Idle : PickerState()
    object Spinning : PickerState()
    data class Result(val dish: DishEntity) : PickerState()
    object Empty : PickerState()
}

@HiltViewModel
class RandomPickerViewModel @Inject constructor(
    private val dishRepository: DishRepository
) : ViewModel() {

    var pickerState by mutableStateOf<PickerState>(PickerState.Idle)
        private set

    var spinningNames by mutableStateOf<List<String>>(emptyList())
        private set

    init {
        // Load all dish names for animation
        viewModelScope.launch {
            dishRepository.getAllDishes().collect { dishes ->
                spinningNames = dishes.map { it.name }
                if (dishes.isEmpty() && pickerState !is PickerState.Spinning) {
                    pickerState = PickerState.Empty
                }
            }
        }
    }

    fun pickRandomDish() {
        viewModelScope.launch {
            if (spinningNames.isEmpty()) {
                pickerState = PickerState.Empty
                return@launch
            }
            pickerState = PickerState.Spinning

            // Slot-machine animation
            val randomIndex = (0 until spinningNames.size).random()
            val picked = dishRepository.getRandomDish()

            if (picked != null) {
                // Show spinning effect then result
                for (i in 0..14) {
                    delay(80)
                }
                delay(200)
                pickerState = PickerState.Result(picked)
            } else {
                pickerState = PickerState.Empty
            }
        }
    }
}
