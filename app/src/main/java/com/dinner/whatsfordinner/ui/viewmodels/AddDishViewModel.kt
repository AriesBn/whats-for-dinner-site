package com.dinner.whatsfordinner.ui.viewmodels

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dinner.whatsfordinner.R
import com.dinner.whatsfordinner.data.local.entity.CategoryEntity
import com.dinner.whatsfordinner.data.repository.CategoryRepository
import com.dinner.whatsfordinner.data.repository.DishRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class AddDishViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val dishRepository: DishRepository,
    private val categoryRepository: CategoryRepository
) : ViewModel() {

    var dishName by mutableStateOf("")
        private set

    var selectedCategoryId by mutableStateOf<Int?>(null)
        private set

    var photoUri by mutableStateOf<Uri?>(null)
        private set

    var categories by mutableStateOf<List<CategoryEntity>>(emptyList())
        private set

    var showSuccessMessage by mutableStateOf(false)
        private set

    // Temp file URI for camera capture
    var tempPhotoUri: Uri? = null
        private set

    init {
        loadCategories()
    }

    private fun loadCategories() {
        viewModelScope.launch {
            categories = categoryRepository.allCategories.first()
        }
    }

    fun updateDishName(name: String) {
        dishName = name
    }

    fun updateSelectedCategory(categoryId: Int) {
        selectedCategoryId = categoryId
    }

    fun updatePhotoUri(uri: Uri?) {
        photoUri = uri
    }

    fun createTempUri(): Uri? {
        val fileName = "temp_${System.currentTimeMillis()}.jpg"
        val file = File(context.cacheDir, fileName)
        val authority = "${context.packageName}.fileprovider"
        tempPhotoUri = FileProvider.getUriForFile(context, authority, file)
        return tempPhotoUri
    }

    fun saveDish() {
        val name = dishName.trim()
        val catId = selectedCategoryId ?: 1
        if (photoUri != null) {
            viewModelScope.launch {
                dishRepository.addDish(name, catId, photoUri!!)
                showSuccessMessage = true
            }
        } else {
            viewModelScope.launch {
                dishRepository.addDishWithDefaultPhoto(name, catId)
                showSuccessMessage = true
            }
        }
    }

    fun resetSuccessMessage() {
        showSuccessMessage = false
    }
}
