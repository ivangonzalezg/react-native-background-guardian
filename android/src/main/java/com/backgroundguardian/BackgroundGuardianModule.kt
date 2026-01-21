package com.backgroundguardian

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
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

    /**
     * Checks if the app is currently exempt from battery optimizations (Doze mode).
     *
     * Battery optimizations were introduced in Android 6.0 (API 23) as part of Doze mode.
     * When an app is not ignoring battery optimizations, the system may defer background
     * work, network access, and alarms when the device is idle.
     *
     * API Level Support:
     * - API < 23: Returns true (no battery optimization restrictions exist)
     * - API >= 23: Checks actual system setting
     *
     * @param promise Resolves to true if the app is ignoring battery optimizations
     *                (i.e., exempt from Doze restrictions), false otherwise
     */
    override fun isIgnoringBatteryOptimizations(promise: Promise) {
        try {
            // Battery optimizations (Doze mode) were introduced in Android 6.0 (API 23)
            // On older versions, there are no such restrictions
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                Log.d(TAG, "Battery optimizations not applicable on API < 23")
                promise.resolve(true)
                return
            }

            val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (powerManager == null) {
                Log.e(TAG, "PowerManager service not available")
                promise.resolve(false)
                return
            }

            val packageName = reactApplicationContext.packageName
            val isIgnoring = powerManager.isIgnoringBatteryOptimizations(packageName)

            Log.d(TAG, "Battery optimization status for $packageName: isIgnoring=$isIgnoring")
            promise.resolve(isIgnoring)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check battery optimization status", e)
            promise.resolve(false)
        }
    }

    /**
     * Opens the system dialog to request battery optimization exemption.
     *
     * This launches the ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS intent, which shows
     * a system dialog asking the user to allow the app to ignore battery optimizations.
     *
     * Important Notes:
     * - Requires REQUEST_IGNORE_BATTERY_OPTIMIZATIONS permission in AndroidManifest.xml
     * - Google Play has restrictions on apps using this. Only use if your app genuinely
     *   requires background execution (messaging, health tracking, device management, etc.)
     * - The dialog only appears if the app is not already ignoring battery optimizations
     *
     * API Level Support:
     * - API < 23: Returns true (no action needed, no restrictions exist)
     * - API >= 23: Opens the system dialog
     *
     * @param promise Resolves to true if the dialog was shown successfully (or not needed),
     *                false if an error occurred or the intent couldn't be resolved
     */
    override fun requestBatteryOptimizationExemption(promise: Promise) {
        try {
            // Battery optimizations were introduced in Android 6.0 (API 23)
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                Log.d(TAG, "Battery optimization exemption not needed on API < 23")
                promise.resolve(true)
                return
            }

            val packageName = reactApplicationContext.packageName

            // Check if already ignoring - if so, no need to show dialog
            val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (powerManager?.isIgnoringBatteryOptimizations(packageName) == true) {
                Log.d(TAG, "Already ignoring battery optimizations, no dialog needed")
                promise.resolve(true)
                return
            }

            // Create the intent to request exemption
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:$packageName")
                // FLAG_ACTIVITY_NEW_TASK is required when starting an activity from a non-activity context
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            // Verify the intent can be resolved before attempting to start it
            val packageManager = reactApplicationContext.packageManager
            if (intent.resolveActivity(packageManager) == null) {
                Log.e(TAG, "No activity found to handle battery optimization request")
                promise.resolve(false)
                return
            }

            // Start the activity
            reactApplicationContext.startActivity(intent)

            Log.d(TAG, "Battery optimization exemption dialog opened for $packageName")
            promise.resolve(true)
        } catch (e: SecurityException) {
            // This can happen if the permission is not declared in the manifest
            Log.e(TAG, "SecurityException: REQUEST_IGNORE_BATTERY_OPTIMIZATIONS permission may be missing", e)
            promise.resolve(false)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to request battery optimization exemption", e)
            promise.resolve(false)
        }
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
