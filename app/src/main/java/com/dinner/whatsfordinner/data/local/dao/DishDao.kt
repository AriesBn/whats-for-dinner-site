package com.dinner.whatsfordinner.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import com.dinner.whatsfordinner.data.local.entity.DishEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DishDao {
    @Insert
    suspend fun insert(dish: DishEntity): Long

    @Query("SELECT * FROM dishes WHERE category_id = :categoryId ORDER BY created_at DESC")
    fun getDishesByCategory(categoryId: Int): Flow<List<DishEntity>>

    @Query("SELECT * FROM dishes ORDER BY created_at DESC")
    fun getAllDishes(): Flow<List<DishEntity>>

    @Query("SELECT * FROM dishes ORDER BY RANDOM() LIMIT 1")
    suspend fun getRandomDish(): DishEntity?

    @Query("SELECT * FROM dishes WHERE category_id = :categoryId ORDER BY RANDOM() LIMIT 1")
    suspend fun getRandomDishByCategory(categoryId: Int): DishEntity?

    @Query("UPDATE dishes SET name = :name, category_id = :categoryId, photo_uri = :photoUri WHERE id = :id")
    suspend fun update(id: Int, name: String, categoryId: Int, photoUri: String)

    @Delete
    suspend fun delete(dish: DishEntity)

    @Query("DELETE FROM dishes WHERE id = :id")
    suspend fun deleteById(id: Int)
}
