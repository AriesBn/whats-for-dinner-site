package com.dinner.whatsfordinner.data.repository

import com.dinner.whatsfordinner.data.local.dao.CategoryDao
import com.dinner.whatsfordinner.data.local.entity.CategoryEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CategoryRepository @Inject constructor(
    private val categoryDao: CategoryDao
) {
    val allCategories: Flow<List<CategoryEntity>> = categoryDao.getAllCategories()

    suspend fun insertAllIfEmpty() {
        val existing = categoryDao.getAllCategoriesOnce()
        if (existing.isEmpty()) {
            val defaultCategories = listOf(
                CategoryEntity(id = 1, name = "荤菜", sortOrder = 0),
                CategoryEntity(id = 2, name = "素菜", sortOrder = 1),
                CategoryEntity(id = 3, name = "汤", sortOrder = 2),
                CategoryEntity(id = 4, name = "主食", sortOrder = 3)
            )
            defaultCategories.forEach { categoryDao.insertOrIgnore(it) }
        }
    }

    suspend fun insert(category: CategoryEntity) {
        categoryDao.insert(category)
    }

    suspend fun update(category: CategoryEntity) {
        categoryDao.update(category)
    }

    suspend fun delete(category: CategoryEntity) {
        categoryDao.delete(category)
    }
}
