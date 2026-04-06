package com.dinner.whatsfordinner.data.repository

import android.net.Uri
import com.dinner.whatsfordinner.data.local.dao.DishDao
import com.dinner.whatsfordinner.data.local.entity.DishEntity
import com.dinner.whatsfordinner.data.photo.PhotoManager
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DishRepository @Inject constructor(
    private val dishDao: DishDao,
    private val photoManager: PhotoManager
) {
    suspend fun addDish(name: String, categoryId: Int, photoUri: Uri): DishEntity {
        val savedPath = photoManager.savePhoto(photoUri)
        val dish = DishEntity(
            name = name,
            categoryId = categoryId,
            photoUri = savedPath
        )
        val id = dishDao.insert(dish)
        return dish.copy(id = id.toInt())
    }

    suspend fun addDishWithDefaultPhoto(name: String, categoryId: Int): DishEntity {
        val dish = DishEntity(
            name = name,
            categoryId = categoryId,
            photoUri = "" // empty means default image will be used
        )
        val id = dishDao.insert(dish)
        return dish.copy(id = id.toInt())
    }

    fun getDishesByCategory(categoryId: Int): Flow<List<DishEntity>> =
        dishDao.getDishesByCategory(categoryId)

    fun getAllDishes(): Flow<List<DishEntity>> = dishDao.getAllDishes()

    suspend fun getRandomDish(): DishEntity? = dishDao.getRandomDish()

    suspend fun updateDish(id: Int, name: String, categoryId: Int, photoUri: String) {
        dishDao.update(id, name, categoryId, photoUri)
    }

    suspend fun deleteDish(dish: DishEntity) {
        if (dish.photoUri.isNotEmpty()) {
            photoManager.deletePhoto(dish.photoUri)
        }
        dishDao.delete(dish)
    }

    suspend fun deleteDishById(id: Int, photoUri: String) {
        if (photoUri.isNotEmpty()) {
            photoManager.deletePhoto(photoUri)
        }
        dishDao.deleteById(id)
    }
}
