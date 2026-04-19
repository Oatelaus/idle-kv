package com.oatelaus.autoclicker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat

class OverlayService : Service() {
    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View

    private val handler = Handler(Looper.getMainLooper())
    private var tapping = false
    private var tapX = 0f
    private var tapY = 0f

    private val tapLoop = object : Runnable {
        override fun run() {
            if (!tapping) return
            AutoClickAccessibilityService.instance?.performTap(tapX, tapY)
            handler.postDelayed(this, TAP_INTERVAL_MS)
        }
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        startForeground(NOTIFICATION_ID, buildNotification())
        showOverlay()
    }

    override fun onDestroy() {
        tapping = false
        handler.removeCallbacksAndMessages(null)
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun showOverlay() {
        overlayView = View(this).apply {
            setBackgroundColor(0x00000000)
            setOnTouchListener { _, event ->
                when (event.actionMasked) {
                    MotionEvent.ACTION_DOWN -> {
                        tapX = event.rawX
                        tapY = event.rawY
                        startTapping()
                        true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        tapX = event.rawX
                        tapY = event.rawY
                        true
                    }
                    MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                        stopTapping()
                        true
                    }
                    else -> false
                }
            }
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
        }

        windowManager.addView(overlayView, params)
    }

    private fun startTapping() {
        if (tapping) return
        tapping = true
        handler.post(tapLoop)
    }

    private fun stopTapping() {
        tapping = false
        handler.removeCallbacks(tapLoop)
    }

    private fun buildNotification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            )
            manager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val CHANNEL_ID = "auto_click_overlay"
        private const val NOTIFICATION_ID = 1001
        private const val TAP_INTERVAL_MS = 30L
    }
}
