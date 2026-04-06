package com.dinner.whatsfordinner.di

import android.content.Context
import com.dinner.whatsfordinner.data.local.AppDatabase
import com.dinner.whatsfordinner.data.local.dao.CategoryDao
import com.dinner.whatsfordinner.data.local.dao.DishDao
import com.dinner.whatsfordinner.data.photo.PhotoManager
import com.dinner.whatsfordinner.data.prefs.NotificationPrefsRepository
import com.dinner.whatsfordinner.data.prefs.SelectedDishesRepository
import com.dinner.whatsfordinner.data.repository.CategoryRepository
import com.dinner.whatsfordinner.data.repository.DishRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return AppDatabase.getDatabase(context)
    }

    @Provides
    fun provideCategoryDao(database: AppDatabase): CategoryDao {
        return database.categoryDao()
    }

    @Provides
    fun provideDishDao(database: AppDatabase): DishDao {
        return database.dishDao()
    }

    @Provides
    @Singleton
    fun providePhotoManager(@ApplicationContext context: Context): PhotoManager {
        return PhotoManager(context)
    }

    @Provides
    @Singleton
    fun provideDishRepository(
        dishDao: DishDao,
        photoManager: PhotoManager
    ): DishRepository {
        return DishRepository(dishDao, photoManager)
    }

    @Provides
    @Singleton
    fun provideCategoryRepository(
        categoryDao: CategoryDao
    ): CategoryRepository {
        return CategoryRepository(categoryDao)
    }

    @Provides
    @Singleton
    fun provideNotificationPrefsRepository(
        @ApplicationContext context: Context
    ): NotificationPrefsRepository {
        return NotificationPrefsRepository(context)
    }

    @Provides
    @Singleton
    fun provideSelectedDishesRepository(
        @ApplicationContext context: Context
    ): SelectedDishesRepository {
        return SelectedDishesRepository(context)
    }

    @Provides
    @Singleton
    fun provideIODispatcher(): CoroutineDispatcher = Dispatchers.IO

    @Provides
    @Singleton
    fun provideMainDispatcher(): CoroutineDispatcher = Dispatchers.Main
}
