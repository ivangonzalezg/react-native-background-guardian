package com.backgroundguardian

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule
import androidx.core.net.toUri

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
   * @param timeout Timeout in milliseconds after which the lock will be automatically released
   * @param promise Resolves to true if acquired successfully, false otherwise
   */
  @SuppressLint("WakelockTimeout")
  override fun acquireWakeLock(tag: String, timeout: Double, promise: Promise) {
    try {
      // If we already have an active wake lock, return true without acquiring another
      wakeLock?.let {
        if (it.isHeld) {
          Log.d(TAG, "Wake lock already held, skipping acquisition")
          promise.resolve(true)
          return
        }
      }

      val powerManager =
        reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
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
        // Acquire with timeout
        acquire(timeout.toLong())
      }

      Log.d(TAG, "Wake lock acquired with tag: $wakeLockTag, timeout: ${timeout.toLong()}ms")
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

  /**
   * Checks if a wake lock is currently held.
   *
   * @param promise Resolves to true if a wake lock is currently held, false otherwise
   */
  override fun isWakeLockHeld(promise: Promise) {
    try {
      val isHeld = wakeLock?.isHeld == true
      Log.d(TAG, "Wake lock held status: $isHeld")
      promise.resolve(isHeld)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to check wake lock status", e)
      promise.resolve(false)
    }
  }

  // ==================== Screen Wake Lock Methods ====================

  /**
   * Enables a screen wake lock to keep the display on while the app is in the foreground.
   *
   * On Android, this adds FLAG_KEEP_SCREEN_ON to the current Activity window.
   * This does not keep the CPU running in the background. Use acquireWakeLock()
   * for background execution.
   *
   * @param promise Resolves to true if enabled successfully, false otherwise
   */
  override fun enableScreenWakeLock(promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      Log.w(TAG, "No current activity to enable screen wake lock")
      promise.resolve(false)
      return
    }

    UiThreadUtil.runOnUiThread {
      try {
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        Log.d(TAG, "Screen wake lock enabled")
        promise.resolve(true)
      } catch (e: Exception) {
        Log.e(TAG, "Failed to enable screen wake lock", e)
        promise.resolve(false)
      }
    }
  }

  /**
   * Disables the screen wake lock, allowing the display to turn off normally.
   *
   * On Android, this clears FLAG_KEEP_SCREEN_ON on the current Activity window.
   *
   * @param promise Resolves to true if disabled successfully, false otherwise
   */
  override fun disableScreenWakeLock(promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      Log.w(TAG, "No current activity to disable screen wake lock")
      promise.resolve(false)
      return
    }

    UiThreadUtil.runOnUiThread {
      try {
        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        Log.d(TAG, "Screen wake lock disabled")
        promise.resolve(true)
      } catch (e: Exception) {
        Log.e(TAG, "Failed to disable screen wake lock", e)
        promise.resolve(false)
      }
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
      val powerManager =
        reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
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
  @SuppressLint("BatteryLife")
  override fun requestBatteryOptimizationExemption(promise: Promise) {
    try {
      val packageName = reactApplicationContext.packageName

      // Check if already ignoring - if so, no need to show dialog
      val powerManager =
        reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
      if (powerManager?.isIgnoringBatteryOptimizations(packageName) == true) {
        Log.d(TAG, "Already ignoring battery optimizations, no dialog needed")
        promise.resolve(true)
        return
      }

      // Create the intent to request exemption
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
        data = "package:$packageName".toUri()
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
      Log.e(
        TAG,
        "SecurityException: REQUEST_IGNORE_BATTERY_OPTIMIZATIONS permission may be missing",
        e
      )
      promise.resolve(false)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to request battery optimization exemption", e)
      promise.resolve(false)
    }
  }


  /**
   * Opens the system battery optimization settings list.
   *
   * @param promise Resolves to true if the settings page was opened successfully
   */
  override fun openBatteryOptimizationSettings(promise: Promise) {
    if (openBatteryOptimizationSettingsInternal()) {
      Log.d(TAG, "Opened battery optimization settings")
      promise.resolve(true)
    } else {
      Log.d(TAG, "Failed to open battery optimization settings")
      promise.resolve(false)
    }
  }

  /**
   * Checks if the device is currently in idle (Doze) mode.
   *
   * Doze mode is activated when the device is unplugged, stationary, and screen-off
   * for a period of time.
   *
   * API Level Support:
   * - API < 23: Returns false (Doze mode not available)
   * - API >= 23: Checks PowerManager.isDeviceIdleMode()
   *
   * @param promise Resolves to true if the device is in idle mode, false otherwise
   */
  override fun isDeviceIdleMode(promise: Promise) {
    try {
      val powerManager =
        reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
      if (powerManager == null) {
        Log.e(TAG, "PowerManager service not available")
        promise.resolve(false)
        return
      }

      val isIdle = powerManager.isDeviceIdleMode
      Log.d(TAG, "Device idle mode status: $isIdle")
      promise.resolve(isIdle)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to check device idle mode", e)
      promise.resolve(false)
    }
  }

  // ==================== Power Save Mode Methods ====================

  /**
   * Checks if the device is in Power Save (Battery Saver) mode.
   *
   * Power Save mode is a system-wide setting that affects ALL apps, regardless
   * of battery optimization exemptions. When active, the system may:
   * - Throttle network requests
   * - Reduce location update frequency
   * - Defer background jobs
   * - Limit sync adapters
   *
   * Note: Power Save mode (isPowerSaveMode) is different from battery optimizations
   * (isIgnoringBatteryOptimizations). An app can be exempt from Doze mode restrictions
   * but still be affected by Power Save mode restrictions.
   *
   * API Level Support:
   * - API < 21: Returns false (Power Save mode not available)
   * - API >= 21: Checks actual system setting
   *
   * @param promise Resolves to true if power save mode is enabled, false otherwise
   */
  override fun isPowerSaveMode(promise: Promise) {
    try {
      val powerManager =
        reactApplicationContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
      if (powerManager == null) {
        Log.e(TAG, "PowerManager service not available")
        promise.resolve(false)
        return
      }

      val isPowerSave = powerManager.isPowerSaveMode
      Log.d(TAG, "Power save mode status: $isPowerSave")
      promise.resolve(isPowerSave)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to check power save mode status", e)
      promise.resolve(false)
    }
  }

  /**
   * Opens the system Power Save Mode (Battery Saver) settings.
   *
   * This opens the settings page where users can enable/disable Battery Saver mode
   * and configure automatic activation thresholds.
   *
   * @param promise Resolves to true if settings were opened successfully, false otherwise
   */
  override fun openPowerSaveModeSettings(promise: Promise) {
    try {
      // Try 1: ACTION_BATTERY_SAVER_SETTINGS (API 22+)
      val batterySaverIntent = Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      if (isActivityAvailable(batterySaverIntent) && tryStartActivity(batterySaverIntent)) {
        Log.d(TAG, "Opened battery saver settings")
        promise.resolve(true)
        return
      }

      // Try 2: ACTION_POWER_USAGE_SUMMARY (general battery settings)
      val powerUsageIntent = Intent(Intent.ACTION_POWER_USAGE_SUMMARY).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      if (isActivityAvailable(powerUsageIntent) && tryStartActivity(powerUsageIntent)) {
        Log.d(TAG, "Opened battery usage settings as fallback")
        promise.resolve(true)
        return
      }

      // Try 3: Generic settings with battery search
      try {
        val settingsIntent = Intent(Settings.ACTION_SETTINGS).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (tryStartActivity(settingsIntent)) {
          Log.d(TAG, "Opened general settings as fallback")
          promise.resolve(true)
          return
        }
      } catch (e: Exception) {
        Log.d(TAG, "Failed to open general settings", e)
      }

      Log.d(TAG, "Could not open power save mode settings")
      promise.resolve(false)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to open power save mode settings", e)
      promise.resolve(false)
    }
  }

  // ==================== OEM Settings Methods ====================

  /**
   * Map of OEM manufacturers to their battery/autostart settings activities.
   *
   * Many Android manufacturers implement aggressive battery optimization that kills
   * apps even when standard Android battery optimizations are disabled. This map
   * contains known activities for managing these OEM-specific settings.
   *
   * Note: These activities may change between OS versions and some may not exist
   * on all device variants. The implementation tries each one and falls back gracefully.
   */
  private val oemSettingsIntents: Map<String, List<Intent>> by lazy {
    mapOf(
      // Xiaomi MIUI
      "xiaomi" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.miui.securitycenter",
            "com.miui.permcenter.autostart.AutoStartManagementActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.miui.securitycenter",
            "com.miui.powercenter.PowerSettings"
          )
        )
      ),

      // Huawei EMUI
      "huawei" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.huawei.systemmanager",
            "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.huawei.systemmanager",
            "com.huawei.systemmanager.optimize.process.ProtectActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.huawei.systemmanager",
            "com.huawei.systemmanager.appcontrol.activity.StartupAppControlActivity"
          )
        )
      ),

      // Honor (sub-brand of Huawei)
      "honor" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.huawei.systemmanager",
            "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"
          )
        )
      ),

      // Oppo ColorOS
      "oppo" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.coloros.safecenter",
            "com.coloros.safecenter.startupapp.StartupAppListActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.oppo.safe",
            "com.oppo.safe.permission.startup.StartupAppListActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.coloros.oppoguardelf",
            "com.coloros.powermanager.fuelga498.PowerUsageModelActivity"
          )
        )
      ),

      // Vivo FuntouchOS
      "vivo" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.vivo.permissionmanager",
            "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.iqoo.secure",
            "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.vivo.abe",
            "com.vivo.applicationbehaviorengine.ui.ExcessivePowerManagerActivity"
          )
        )
      ),

      // Samsung OneUI
      "samsung" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.samsung.android.lool",
            "com.samsung.android.sm.ui.battery.BatteryActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.samsung.android.sm",
            "com.samsung.android.sm.ui.battery.BatteryActivity"
          )
        )
      ),

      // OnePlus OxygenOS
      "oneplus" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.oneplus.security",
            "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity"
          )
        )
      ),

      // Realme (based on ColorOS)
      "realme" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.coloros.safecenter",
            "com.coloros.safecenter.startupapp.StartupAppListActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.oppo.safe",
            "com.oppo.safe.permission.startup.StartupAppListActivity"
          )
        )
      ),

      // Asus ZenUI
      "asus" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.asus.mobilemanager",
            "com.asus.mobilemanager.autostart.AutoStartActivity"
          )
        ),
        Intent().setComponent(
          ComponentName(
            "com.asus.mobilemanager",
            "com.asus.mobilemanager.entry.FunctionActivity"
          )
        )
      ),

      // Lenovo
      "lenovo" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.lenovo.security",
            "com.lenovo.security.purebackground.PureBackgroundActivity"
          )
        )
      ),

      // Meizu Flyme
      "meizu" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.meizu.safe",
            "com.meizu.safe.powerui.PowerAppPermissionActivity"
          )
        )
      ),

      // Nokia (HMD Global)
      "nokia" to listOf(
        Intent().setComponent(
          ComponentName(
            "com.evenwell.powersaving.g3",
            "com.evenwell.powersaving.g3.exception.PowerSaverExceptionActivity"
          )
        )
      )
    )
  }

  /**
   * Opens OEM-specific battery/autostart settings if available for the current device.
   *
   * Many Android manufacturers (Xiaomi, Huawei, Oppo, Vivo, Samsung, etc.) implement
   * aggressive battery optimization that can kill apps even when standard Android
   * battery optimizations are disabled. This method attempts to open the manufacturer-
   * specific settings page where users can whitelist the app.
   *
   * The method tries multiple known activities for each manufacturer as they may
   * vary between OS versions. If no OEM-specific settings are found, it falls back
   * to opening the generic app details settings page.
   *
   * @param promise Resolves to true if any settings page was opened successfully,
   *                false if no settings could be opened
   */
  override fun openOEMSettings(promise: Promise) {
    try {
      val manufacturer = Build.MANUFACTURER.lowercase()
      Log.d(TAG, "Attempting to open OEM settings for manufacturer: $manufacturer")

      // Try OEM-specific intents
      val intents = oemSettingsIntents[manufacturer]
      if (intents != null) {
        for (intent in intents) {
          if (tryStartActivity(intent)) {
            Log.d(TAG, "Successfully opened OEM settings: ${intent.component}")
            promise.resolve(true)
            return
          }
        }
      }

      // Fallback 1: Try to open battery optimization settings list (API 23+)
      if (openBatteryOptimizationSettingsInternal()) {
        Log.d(TAG, "Opened battery optimization settings as fallback")
        promise.resolve(true)
        return
      }

      // Fallback 2: Try to open generic app details settings
      if (openAppDetailsSettings()) {
        Log.d(TAG, "Opened generic app details settings as fallback")
        promise.resolve(true)
        return
      }

      Log.d(TAG, "No OEM settings available for manufacturer: $manufacturer")
      promise.resolve(false)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to open OEM settings", e)
      promise.resolve(false)
    }
  }

  /**
   * Checks if an activity is available to handle the given intent.
   *
   * @param intent The intent to check
   * @return true if at least one activity can handle the intent, false otherwise
   */
  private fun isActivityAvailable(intent: Intent): Boolean {
    return try {
      val packageManager = reactApplicationContext.packageManager
      val activities = packageManager.queryIntentActivities(intent, 0)
      activities.isNotEmpty()
    } catch (e: Exception) {
      Log.d(TAG, "Failed to check activity availability", e)
      false
    }
  }

  /**
   * Attempts to start an activity safely.
   *
   * @param intent The intent to start
   * @return true if the activity was started successfully, false otherwise
   */
  private fun tryStartActivity(intent: Intent): Boolean {
    return try {
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      true
    } catch (e: ActivityNotFoundException) {
      Log.e(TAG, "Activity not found: ${intent.component}", e)
      Log.d(TAG, "Activity not found: ${intent.component}")
      false
    } catch (e: SecurityException) {
      Log.e(TAG, "Security exception for: ${intent.component}", e)
      Log.d(TAG, "Security exception for: ${intent.component}")
      false
    } catch (e: Exception) {
      Log.d(TAG, "Failed to start activity: ${intent.component}", e)
      false
    }
  }

  /**
   * Opens the battery optimization settings list (Internal helper).
   *
   * This shows the list of all apps with their battery optimization status,
   * where the user can manually enable/disable optimization for any app.
   * Available on Android 6.0 (API 23) and above.
   *
   * @return true if the settings page was opened successfully, false otherwise
   */
  private fun openBatteryOptimizationSettingsInternal(): Boolean {
    return try {
      val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactApplicationContext.startActivity(intent)
      true
    } catch (e: Exception) {
      Log.d(TAG, "Failed to open battery optimization settings", e)
      false
    }
  }

  /**
   * Opens the generic app details settings page as a fallback.
   *
   * @return true if the settings page was opened successfully, false otherwise
   */
  private fun openAppDetailsSettings(): Boolean {
    return try {
      val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
        data = "package:${reactApplicationContext.packageName}".toUri()
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactApplicationContext.startActivity(intent)
      true
    } catch (e: Exception) {
      Log.e(TAG, "Failed to open app details settings", e)
      false
    }
  }

  // ==================== Device Info Methods ====================

  /**
   * Gets the device manufacturer name.
   *
   * Returns the value of Build.MANUFACTURER, which identifies the device manufacturer
   * (e.g., "Samsung", "Xiaomi", "Google", "OnePlus"). This can be useful for:
   * - Determining whether OEM-specific settings might be available
   * - Showing manufacturer-specific instructions to users
   * - Analytics and debugging purposes
   *
   * The manufacturer name is returned in lowercase for easier comparison.
   *
   * @param promise Resolves to the manufacturer name string (lowercase),
   *                or null if it couldn't be determined
   */
  override fun getDeviceManufacturer(promise: Promise) {
    try {
      val manufacturer = Build.MANUFACTURER
      if (manufacturer.isNullOrBlank()) {
        Log.d(TAG, "Device manufacturer is null or blank")
        promise.resolve(null)
        return
      }

      val normalizedManufacturer = manufacturer.lowercase()
      Log.d(TAG, "Device manufacturer: $normalizedManufacturer")
      promise.resolve(normalizedManufacturer)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to get device manufacturer", e)
      promise.resolve(null)
    }
  }
}
