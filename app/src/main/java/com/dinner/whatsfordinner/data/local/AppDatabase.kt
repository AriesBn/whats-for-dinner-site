package com.dinner.whatsfordinner.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.dinner.whatsfordinner.data.local.dao.CategoryDao
import com.dinner.whatsfordinner.data.local.dao.DishDao
import com.dinner.whatsfordinner.data.local.entity.CategoryEntity
import com.dinner.whatsfordinner.data.local.entity.DishEntity

@Database(
    entities = [CategoryEntity::class, DishEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun categoryDao(): CategoryDao
    abstract fun dishDao(): DishDao

    companion object {
        private const val DATABASE_NAME = "dinner_db"

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    DATABASE_NAME
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
