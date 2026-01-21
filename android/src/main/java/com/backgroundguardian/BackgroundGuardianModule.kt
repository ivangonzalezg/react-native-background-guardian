package com.backgroundguardian

import android.content.Context
import android.os.PowerManager
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

/**
 * BackgroundGuardian Android Native Module
 *
 * Provides APIs for managing wake locks and battery optimization settings
 * to prevent Android from killing background processes.
 */
@ReactModule(name = BackgroundGuardianModule.NAME)
class BackgroundGuardianModule(reactContext: ReactApplicationContext) :
    NativeBackgroundGuardianSpec(reactContext) {

    companion object {
        const val NAME = "BackgroundGuardian"
        private const val TAG = "BackgroundGuardian"
        private const val WAKE_LOCK_TAG = "BackgroundGuardian:WakeLock"
    }

    /**
     * Reference to the currently held wake lock, if any.
     * Only one wake lock is managed at a time per module instance.
     */
    private var wakeLock: PowerManager.WakeLock? = null

    override fun getName(): String = NAME

    // ==================== Wake Lock Methods ====================

    /**
     * Acquires a partial wake lock to keep the CPU running while the screen is off.
     *
     * A PARTIAL_WAKE_LOCK ensures the CPU stays on, but allows the screen and keyboard
     * backlight to turn off. This is the minimum level needed for background processing.
     *
     * @param tag Identifier for the wake lock (used in system logs for debugging)
     * @param promise Resolves to true if acquired successfully, false otherwise
     */
    override fun acquireWakeLock(tag: String, promise: Promise) {
        try {
            // If we already have an active wake lock, return true without acquiring another
            wakeLock?.let {
                if (it.isHeld) {
                    Log.d(TAG, "Wake lock already held, skipping acquisition")
                    promise.resolve(true)
                    return
                }
            }

            val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (powerManager == null) {
                Log.e(TAG, "PowerManager service not available")
                promise.resolve(false)
                return
            }

            // Create and acquire a new partial wake lock
            // Using the provided tag for easier debugging in system logs
            val wakeLockTag = if (tag.isNotEmpty()) "$WAKE_LOCK_TAG:$tag" else WAKE_LOCK_TAG
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                wakeLockTag
            ).apply {
                // Acquire without timeout - must be explicitly released
                acquire()
            }

            Log.d(TAG, "Wake lock acquired with tag: $wakeLockTag")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to acquire wake lock", e)
            promise.resolve(false)
        }
    }

    /**
     * Releases a previously acquired wake lock.
     *
     * This method safely releases the wake lock if one is held. It handles cases where:
     * - No wake lock was ever acquired
     * - The wake lock was already released
     * - An error occurs during release
     *
     * @param promise Resolves to true if released successfully or no lock was held,
     *                false if an error occurred
     */
    override fun releaseWakeLock(promise: Promise) {
        try {
            val currentWakeLock = wakeLock
            if (currentWakeLock == null) {
                Log.d(TAG, "No wake lock to release")
                promise.resolve(true)
                return
            }

            if (!currentWakeLock.isHeld) {
                Log.d(TAG, "Wake lock already released")
                wakeLock = null
                promise.resolve(true)
                return
            }

            // Release the wake lock
            currentWakeLock.release()
            wakeLock = null

            Log.d(TAG, "Wake lock released successfully")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to release wake lock", e)
            // Clear the reference even on error to avoid holding stale references
            wakeLock = null
            promise.resolve(false)
        }
    }

    // ==================== Battery Optimization Methods ====================
    // TODO: Implement in next task

    override fun isIgnoringBatteryOptimizations(promise: Promise) {
        // Placeholder - will be implemented in battery optimization task
        promise.resolve(false)
    }

    override fun requestBatteryOptimizationExemption(promise: Promise) {
        // Placeholder - will be implemented in battery optimization task
        promise.resolve(false)
    }

    // ==================== OEM Settings Methods ====================
    // TODO: Implement in next task

    override fun openOEMSettings(promise: Promise) {
        // Placeholder - will be implemented in OEM settings task
        promise.resolve(false)
    }

    // ==================== Device Info Methods ====================
    // TODO: Implement in next task

    override fun getDeviceManufacturer(promise: Promise) {
        // Placeholder - will be implemented in device info task
        promise.resolve(null)
    }
}
