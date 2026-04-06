package com.dinner.whatsfordinner.worker

import org.junit.Assert.assertEquals
import org.junit.Test
import java.util.Calendar

class MidnightSelectionResetSchedulerTest {

    @Test
    fun `next midnight millis returns next day midnight`() {
        val now = Calendar.getInstance().apply {
            set(2026, Calendar.APRIL, 6, 18, 30, 45)
            set(Calendar.MILLISECOND, 123)
        }

        val next = Calendar.getInstance().apply {
            timeInMillis = MidnightSelectionResetScheduler.nextMidnightMillis(now)
        }

        assertEquals(2026, next.get(Calendar.YEAR))
        assertEquals(Calendar.APRIL, next.get(Calendar.MONTH))
        assertEquals(7, next.get(Calendar.DAY_OF_MONTH))
        assertEquals(0, next.get(Calendar.HOUR_OF_DAY))
        assertEquals(0, next.get(Calendar.MINUTE))
        assertEquals(0, next.get(Calendar.SECOND))
        assertEquals(0, next.get(Calendar.MILLISECOND))
    }
}
