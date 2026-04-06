package com.dinner.whatsfordinner.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dinner.whatsfordinner.data.local.entity.CategoryEntity
import com.dinner.whatsfordinner.data.local.entity.DishEntity
import com.dinner.whatsfordinner.data.prefs.SelectedDishesRepository
import com.dinner.whatsfordinner.data.repository.CategoryRepository
import com.dinner.whatsfordinner.data.repository.DishRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CategoryWithDishes(
    val category: CategoryEntity,
    val dishes: List<DishEntity>
)

@HiltViewModel
class DishListViewModel @Inject constructor(
    private val categoryRepository: CategoryRepository,
    private val dishRepository: DishRepository,
    private val selectedDishesRepository: SelectedDishesRepository
) : ViewModel() {

    private val _categories = MutableStateFlow<List<CategoryEntity>>(emptyList())
    val categories: StateFlow<List<CategoryEntity>> = _categories

    private val _dishesByCategory = MutableStateFlow<Map<Int, List<DishEntity>>>(emptyMap())
    val dishesByCategory: StateFlow<Map<Int, List<DishEntity>>> = _dishesByCategory

    private val _selectedCategory = MutableStateFlow<Int?>(null)
    val selectedCategory: StateFlow<Int?> = _selectedCategory

    private val _selectedDishes = MutableStateFlow<Set<Int>>(emptySet())
    val selectedDishes: StateFlow<Set<Int>> = _selectedDishes

    val categoriesWithDishes: StateFlow<List<CategoryWithDishes>> = _categories
        .combine(_dishesByCategory) { cats, dishesMap ->
            cats.map { cat ->
                CategoryWithDishes(cat, dishesMap[cat.id] ?: emptyList())
            }
        }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    val filteredDishesForSelectedCategory: StateFlow<List<DishEntity>> = _selectedCategory
        .combine(_dishesByCategory) { selectedId, dishesMap ->
            if (selectedId == null) {
                emptyList()
            } else {
                dishesMap[selectedId] ?: emptyList()
            }
        }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    init {
        seedCategories()
        seedTestDishes()
        observeCategories()
        observeAllDishes()
        observeSelectedDishes()
    }

    private fun seedCategories() {
        viewModelScope.launch {
            categoryRepository.insertAllIfEmpty()
        }
    }

    private fun seedTestDishes() {
        viewModelScope.launch {
            val existing = dishRepository.getAllDishes().first()
            if (existing.isEmpty()) {
                val testDishes = listOf(
                    // 荤菜 (categoryId = 1)
                    DishEntity(name = "红烧肉", categoryId = 1),
                    DishEntity(name = "糖醋排骨", categoryId = 1),
                    DishEntity(name = "宫保鸡丁", categoryId = 1),
                    DishEntity(name = "回锅肉", categoryId = 1),
                    // 素菜 (categoryId = 2)
                    DishEntity(name = "西红柿炒蛋", categoryId = 2),
                    DishEntity(name = "麻婆豆腐", categoryId = 2),
                    DishEntity(name = "地三鲜", categoryId = 2),
                    DishEntity(name = "干煸四季豆", categoryId = 2),
                    // 汤 (categoryId = 3)
                    DishEntity(name = "紫菜蛋花汤", categoryId = 3),
                    DishEntity(name = "番茄蛋汤", categoryId = 3),
                    DishEntity(name = "排骨莲藕汤", categoryId = 3),
                    // 主食 (categoryId = 4)
                    DishEntity(name = "蛋炒饭", categoryId = 4),
                    DishEntity(name = "担担面", categoryId = 4),
                    DishEntity(name = "葱油拌面", categoryId = 4),
                )
                testDishes.forEach { dishRepository.addDishWithDefaultPhoto(it.name, it.categoryId) }
            }
        }
    }

    private fun observeCategories() {
        viewModelScope.launch {
            categoryRepository.allCategories.collect { list ->
                _categories.value = list
            }
        }
    }

    private fun observeAllDishes() {
        viewModelScope.launch {
            dishRepository.getAllDishes().collect { allDishes ->
                val grouped = allDishes.groupBy { it.categoryId }
                _dishesByCategory.value = grouped
            }
        }
    }

    private fun observeSelectedDishes() {
        viewModelScope.launch {
            selectedDishesRepository.selectedDishIds.collect { ids ->
                _selectedDishes.value = ids
            }
        }
    }

    fun selectCategory(categoryId: Int?) {
        _selectedCategory.value = categoryId
    }

    fun goBack() {
        _selectedCategory.value = null
    }

    internal fun selectedCategoryIdForTest() = _selectedCategory.value

    fun toggleDishSelection(dishId: Int) {
        viewModelScope.launch {
            selectedDishesRepository.toggleDishSelection(dishId)
        }
    }

    fun getSelectedDishesList(dishesMap: Map<Int, List<DishEntity>>): List<DishEntity> {
        val ids = _selectedDishes.value
        if (ids.isEmpty()) return emptyList()
        val allDishes = dishesMap.values.flatten()
        return allDishes.filter { dish -> ids.contains(dish.id) }
    }

    fun confirmSelectionAndGoHome() {
        _selectedCategory.value = null
    }

    fun clearSelectedDishes() {
        viewModelScope.launch {
            selectedDishesRepository.clearSelectedDishes()
        }
    }

    fun deleteDish(dish: DishEntity) {
        viewModelScope.launch {
            dishRepository.deleteDish(dish)
        }
    }
}
