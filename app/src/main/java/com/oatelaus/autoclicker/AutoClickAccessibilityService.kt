package com.oatelaus.autoclicker

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.os.Build
import android.view.accessibility.AccessibilityEvent

class AutoClickAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        instance = this
    }

    override fun onInterrupt() {
        // No-op
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // No-op
    }

    override fun onDestroy() {
        if (instance === this) {
            instance = null
        }
        super.onDestroy()
    }

    fun performTap(x: Float, y: Float): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            return false
        }

        val path = Path().apply {
            moveTo(x, y)
        }

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 1))
            .build()

        return dispatchGesture(gesture, null, null)
    }

    companion object {
        @Volatile
        var instance: AutoClickAccessibilityService? = null
    }
}
