package com.dinner.whatsfordinner.data.prefs

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SharedStateManager @Inject constructor() {

    private var pendingDishId: Int? = null

    fun consumePendingDishId(): Int? {
        val id = pendingDishId
        pendingDishId = null
        return id
    }

    fun setPendingDishId(dishId: Int) {
        pendingDishId = dishId
    }
}
