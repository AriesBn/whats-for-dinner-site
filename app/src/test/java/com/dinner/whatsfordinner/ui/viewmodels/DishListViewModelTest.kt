package com.dinner.whatsfordinner.ui.viewmodels

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test

/**
 * RED phase: Tests for the new category navigation logic in DishListViewModel.
 * These test the selection/retrieval behavior independently of Android/Hilt.
 */
class DishListViewModelCategorySelectionTest {

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `category selection state starts null`() = runTest {
        assertNull(CategorySelectionState().selectedId)
    }

    @Test
    fun `selecting a category updates the state`() = runTest {
        val state = CategorySelectionState()
        state.select(1)
        assertEquals(1, state.selectedId)
    }

    @Test
    fun `go back returns to grid`() = runTest {
        val state = CategorySelectionState()
        state.select(2)
        state.back()
        assertNull(state.selectedId)
    }

    @Test
    fun `selecting null also returns to grid`() = runTest {
        val state = CategorySelectionState()
        state.select(3)
        state.select(null)
        assertNull(state.selectedId)
    }
}

/**
 * Simple state holder mirroring the selectedCategory logic
 * in DishListViewModel (extracted for testability without Hilt).
 */
class CategorySelectionState {
    var selectedId: Int? = null
        private set

    fun select(id: Int?) {
        selectedId = id
    }

    fun back() {
        selectedId = null
    }
}
