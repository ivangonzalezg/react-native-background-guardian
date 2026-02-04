import NativeBackgroundGuardian from './NativeBackgroundGuardian';

/**
 * Result type for wake lock operations.
 */
export interface WakeLockResult {
  /** Whether the operation was successful */
  success: boolean;
}

/**
 * Result type for battery optimization status check.
 */
export interface BatteryOptimizationStatus {
  /** Whether the app is ignoring battery optimizations */
  isIgnoring: boolean;
}

/**
 * Device information returned by the module.
 */
export interface DeviceInfo {
  /** Device manufacturer name (e.g., "Samsung", "Xiaomi", "Apple") */
  manufacturer: string | null;
}

/**
 * Main interface for the BackgroundGuardian module.
 * Provides methods to prevent Android from killing background processes.
 */
export interface BackgroundGuardianInterface {
  /**
   * Acquires a partial wake lock to keep the CPU running.
   * @param tag - Optional identifier for debugging purposes
   * @param timeout - Optional timeout in milliseconds. Defaults to 24 hours (86400000ms).
   * @returns Promise resolving to true if acquired successfully
   */
  acquireWakeLock: (tag?: string, timeout?: number) => Promise<boolean>;

  /**
   * Releases a previously acquired wake lock.
   * @returns Promise resolving to true if released successfully
   */
  releaseWakeLock: () => Promise<boolean>;

  /**
   * Checks if a wake lock is currently held.
   * @returns Promise resolving to true if a wake lock is held
   */
  isWakeLockHeld: () => Promise<boolean>;

  /**
   * Enables a screen wake lock to keep the display on while the app is in the foreground.
   * @returns Promise resolving to true if enabled successfully
   */
  enableScreenWakeLock: () => Promise<boolean>;

  /**
   * Disables the screen wake lock, allowing the display to turn off normally.
   * @returns Promise resolving to true if disabled successfully
   */
  disableScreenWakeLock: () => Promise<boolean>;

  /**
   * Checks if the app is ignoring battery optimizations.
   * @returns Promise resolving to true if ignoring optimizations
   */
  isIgnoringBatteryOptimizations: () => Promise<boolean>;

  /**
   * Requests battery optimization exemption from the user.
   * @returns Promise resolving to true if the dialog was shown
   */
  requestBatteryOptimizationExemption: () => Promise<boolean>;

  /**
   * Opens OEM-specific battery/background settings.
   * @returns Promise resolving to true if settings were opened
   */
  openOEMSettings: () => Promise<boolean>;

  /**
   * Opens the system battery optimization settings list.
   * @returns Promise resolving to true if settings were opened
   */
  openBatteryOptimizationSettings: () => Promise<boolean>;

  /**
   * Checks if the device is currently in idle (Doze) mode.
   * @returns Promise resolving to true if in idle mode
   */
  isDeviceIdleMode: () => Promise<boolean>;

  /**
   * Checks if the device is in Power Save (Battery Saver) mode.
   * @returns Promise resolving to true if power save mode is enabled
   */
  isPowerSaveMode: () => Promise<boolean>;

  /**
   * Opens the system Power Save Mode settings.
   * @returns Promise resolving to true if settings were opened
   */
  openPowerSaveModeSettings: () => Promise<boolean>;

  /**
   * Gets the device manufacturer name.
   * @returns Promise resolving to the manufacturer string or null
   */
  getDeviceManufacturer: () => Promise<string | null>;
}

/**
 * Acquires a partial wake lock to keep the CPU running while the screen is off.
 *
 * On Android, this prevents the system from suspending the CPU, allowing
 * background tasks to continue running. The wake lock is reference-counted,
 * meaning you must call `releaseWakeLock()` for each `acquireWakeLock()` call.
 *
 * On iOS, this is a no-op that returns `true` immediately, as iOS handles
 * background execution differently through Background Modes.
 *
 * @param tag - Optional identifier for the wake lock. Useful for debugging
 *              and identifying which component holds the lock. Defaults to
 *              "BackgroundGuardian".
 * @param timeout - Optional timeout in milliseconds after which the wake lock
 *                  will be automatically released. Defaults to 24 hours (86400000ms).
 * @returns Promise resolving to `true` if the wake lock was successfully
 *          acquired, `false` otherwise.
 *
 * @example
 * ```typescript
 * // Acquire wake lock before starting background work
 * const acquired = await acquireWakeLock('MyBackgroundTask');
 * if (acquired) {
 *   // Perform background work
 *   await doBackgroundWork();
 *   // Release when done
 *   await releaseWakeLock();
 * }
 * ```
 *
 * @see releaseWakeLock
 */
export function acquireWakeLock(
  tag: string = 'BackgroundGuardian',
  timeout: number = 86400000
): Promise<boolean> {
  return NativeBackgroundGuardian.acquireWakeLock(tag, timeout);
}

/**
 * Releases a previously acquired wake lock.
 *
 * On Android, this releases the CPU wake lock, allowing the system to
 * suspend the CPU when idle. Always call this method when your background
 * work is complete to preserve battery life.
 *
 * On iOS, this is a no-op that returns `true` immediately.
 *
 * @returns Promise resolving to `true` if the wake lock was successfully
 *          released, `false` if no wake lock was held or release failed.
 *
 * @example
 * ```typescript
 * // Release wake lock after background work is done
 * const released = await releaseWakeLock();
 * console.log('Wake lock released:', released);
 * ```
 *
 * @see acquireWakeLock
 */
export function releaseWakeLock(): Promise<boolean> {
  return NativeBackgroundGuardian.releaseWakeLock();
}

/**
 * Checks if a wake lock is currently held.
 *
 * On Android, this returns whether a wake lock is actively held by this module.
 * Useful for debugging or updating UI state based on wake lock status.
 *
 * On iOS, this always returns `false` as wake locks don't exist.
 *
 * @returns Promise resolving to `true` if a wake lock is currently held,
 *          `false` otherwise.
 *
 * @example
 * ```typescript
 * const isHeld = await isWakeLockHeld();
 * if (!isHeld) {
 *   await acquireWakeLock('MyTask');
 * }
 * ```
 *
 * @see acquireWakeLock
 * @see releaseWakeLock
 */
export function isWakeLockHeld(): Promise<boolean> {
  return NativeBackgroundGuardian.isWakeLockHeld();
}

/**
 * Enables a screen wake lock to keep the display on while the app is in the foreground.
 *
 * On Android, this sets `FLAG_KEEP_SCREEN_ON` on the current Activity window.
 * On iOS, this disables the idle timer (`UIApplication.shared.isIdleTimerDisabled = true`).
 *
 * Note: This keeps the screen awake only while the app is in the foreground.
 * It does not replace `acquireWakeLock()` for background CPU execution.
 *
 * @returns Promise resolving to `true` if the screen wake lock was enabled,
 *          `false` otherwise.
 *
 * @example
 * ```typescript
 * const enabled = await enableScreenWakeLock();
 * console.log('Keep screen on:', enabled);
 * ```
 */
export function enableScreenWakeLock(): Promise<boolean> {
  return NativeBackgroundGuardian.enableScreenWakeLock();
}

/**
 * Disables the screen wake lock, allowing the display to turn off normally.
 *
 * On Android, this clears `FLAG_KEEP_SCREEN_ON` on the current Activity window.
 * On iOS, this re-enables the idle timer (`UIApplication.shared.isIdleTimerDisabled = false`).
 *
 * @returns Promise resolving to `true` if the screen wake lock was disabled,
 *          `false` otherwise.
 *
 * @example
 * ```typescript
 * await disableScreenWakeLock();
 * ```
 */
export function disableScreenWakeLock(): Promise<boolean> {
  return NativeBackgroundGuardian.disableScreenWakeLock();
}

/**
 * Checks if the app is currently exempt from battery optimizations.
 *
 * On Android, this checks if the app is whitelisted from Doze mode and
 * App Standby. When an app is ignoring battery optimizations, it can
 * run background tasks more freely without being restricted by the system.
 *
 * On iOS, this always returns `true` as the concept doesn't apply in the
 * same way.
 *
 * @returns Promise resolving to `true` if the app is ignoring battery
 *          optimizations, `false` otherwise.
 *
 * @example
 * ```typescript
 * const isIgnoring = await isIgnoringBatteryOptimizations();
 * if (!isIgnoring) {
 *   // Prompt user to exempt the app
 *   await requestBatteryOptimizationExemption();
 * }
 * ```
 *
 * @see requestBatteryOptimizationExemption
 */
export function isIgnoringBatteryOptimizations(): Promise<boolean> {
  return NativeBackgroundGuardian.isIgnoringBatteryOptimizations();
}

/**
 * Opens the system dialog to request battery optimization exemption.
 *
 * On Android, this launches the system's "Request Ignore Battery Optimizations"
 * dialog, allowing the user to whitelist the app from Doze mode and App Standby.
 * The user must manually approve this request.
 *
 * Note: Google Play has restrictions on apps using this permission. Only use
 * this if your app genuinely requires background execution (e.g., messaging,
 * health tracking, device management).
 *
 * On iOS, this is a no-op that returns `true` immediately.
 *
 * @returns Promise resolving to `true` if the dialog was successfully shown,
 *          `false` if the dialog couldn't be opened.
 *
 * @example
 * ```typescript
 * const isIgnoring = await isIgnoringBatteryOptimizations();
 * if (!isIgnoring) {
 *   const dialogShown = await requestBatteryOptimizationExemption();
 *   if (dialogShown) {
 *     console.log('User was prompted for battery optimization exemption');
 *   }
 * }
 * ```
 *
 * @see isIgnoringBatteryOptimizations
 */
export function requestBatteryOptimizationExemption(): Promise<boolean> {
  return NativeBackgroundGuardian.requestBatteryOptimizationExemption();
}

/**
 * Checks if the device is in Power Save (Battery Saver) mode.
 *
 * On Android, this checks `PowerManager.isPowerSaveMode()`. Power Save mode is
 * a system-wide setting that affects ALL apps, regardless of battery optimization
 * exemptions. When active, the system may:
 * - Throttle network requests
 * - Reduce location update frequency
 * - Defer background jobs
 * - Limit sync adapters
 *
 * Note: This is different from `isIgnoringBatteryOptimizations()`. An app can be
 * exempt from Doze mode restrictions but still be affected by Power Save mode.
 *
 * On iOS, this always returns `false`.
 *
 * @returns Promise resolving to `true` if power save mode is enabled,
 *          `false` otherwise.
 *
 * @example
 * ```typescript
 * const isPowerSave = await isPowerSaveMode();
 * if (isPowerSave) {
 *   Alert.alert(
 *     'Battery Saver Active',
 *     'Background features may be limited. Disable Battery Saver for best experience.',
 *     [{ text: 'Open Settings', onPress: () => openPowerSaveModeSettings() }]
 *   );
 * }
 * ```
 *
 * @see openPowerSaveModeSettings
 * @see isIgnoringBatteryOptimizations
 */
export function isPowerSaveMode(): Promise<boolean> {
  return NativeBackgroundGuardian.isPowerSaveMode();
}

/**
 * Opens the system Power Save Mode (Battery Saver) settings.
 *
 * On Android, this opens the Battery Saver settings page where users can
 * enable/disable Battery Saver mode and configure automatic activation.
 *
 * On iOS, this is a no-op that returns `false` immediately.
 *
 * @returns Promise resolving to `true` if settings were successfully opened,
 *          `false` if the settings couldn't be opened.
 *
 * @example
 * ```typescript
 * const isPowerSave = await isPowerSaveMode();
 * if (isPowerSave) {
 *   const opened = await openPowerSaveModeSettings();
 *   if (opened) {
 *     console.log('Battery Saver settings opened');
 *   }
 * }
 * ```
 *
 * @see isPowerSaveMode
 */
export function openPowerSaveModeSettings(): Promise<boolean> {
  return NativeBackgroundGuardian.openPowerSaveModeSettings();
}

/**
 * Opens OEM-specific battery or background settings if available.
 *
 * Many Android manufacturers (Xiaomi, Samsung, Huawei, OnePlus, etc.) implement
 * aggressive battery optimization features that can kill apps even when standard
 * Android battery optimizations are disabled. This method attempts to open the
 * manufacturer-specific settings page where users can whitelist your app.
 *
 * Supported OEMs include:
 * - Xiaomi (MIUI)
 * - Samsung
 * - Huawei/Honor
 * - OnePlus
 * - Oppo
 * - Vivo
 * - And others...
 *
 * On iOS, this is a no-op that returns `false` immediately, as Apple devices
 * don't have OEM-specific battery settings.
 *
 * @returns Promise resolving to `true` if OEM settings were successfully opened,
 *          `false` if the device doesn't have recognized OEM settings or if
 *          opening failed.
 *
 * @example
 * ```typescript
 * const manufacturer = await getDeviceManufacturer();
 * console.log(`Device: ${manufacturer}`);
 *
 * const opened = await openOEMSettings();
 * if (opened) {
 *   console.log('OEM battery settings opened');
 * } else {
 *   console.log('No OEM-specific settings available');
 * }
 * ```
 *
 * @see getDeviceManufacturer
 */
export function openOEMSettings(): Promise<boolean> {
  return NativeBackgroundGuardian.openOEMSettings();
}

/**
 * Opens the system battery optimization settings list.
 *
 * On Android, this opens the list of apps where users can manually toggle
 * battery optimization for specific apps. This is a safer alternative to
 * `requestBatteryOptimizationExemption` as it doesn't require special permissions
 * and is not restricted by Google Play policies, though it requires more user steps.
 *
 * On iOS, this is a no-op that returns `false` immediately.
 *
 * @returns Promise resolving to `true` if settings were successfully opened,
 *          `false` otherwise.
 */
export function openBatteryOptimizationSettings(): Promise<boolean> {
  return NativeBackgroundGuardian.openBatteryOptimizationSettings();
}

/**
 * Checks if the device is currently in idle (Doze) mode.
 *
 * On Android, this checks `PowerManager.isDeviceIdleMode()`. Doze mode is activated
 * when the device is unplugged, stationary, and the screen is off for a period of time.
 * In this mode, system restricts apps' access to network and CPU-intensive services.
 *
 * On iOS, this applies less directly but returns `false` for API consistency.
 *
 * @returns Promise resolving to `true` if the device is in idle (Doze) mode,
 *          `false` otherwise.
 */
export function isDeviceIdleMode(): Promise<boolean> {
  return NativeBackgroundGuardian.isDeviceIdleMode();
}

/**
 * Gets the device manufacturer name.
 *
 * On Android, this returns the value of `Build.MANUFACTURER`, which identifies
 * the device manufacturer (e.g., "Samsung", "Xiaomi", "Google", "OnePlus").
 * This can be useful for determining whether OEM-specific settings might be
 * available or for analytics purposes.
 *
 * On iOS, this returns "Apple".
 *
 * @returns Promise resolving to the manufacturer name string, or `null` if
 *          the manufacturer couldn't be determined.
 *
 * @example
 * ```typescript
 * const manufacturer = await getDeviceManufacturer();
 * if (manufacturer?.toLowerCase() === 'xiaomi') {
 *   // Show MIUI-specific instructions to the user
 *   showMIUIInstructions();
 * }
 * ```
 *
 * @see openOEMSettings
 */
export function getDeviceManufacturer(): Promise<string | null> {
  return NativeBackgroundGuardian.getDeviceManufacturer();
}

/**
 * BackgroundGuardian module object with all methods.
 * Provides a namespace-style API for accessing all functionality.
 *
 * @example
 * ```typescript
 * import BackgroundGuardian from 'react-native-background-guardian';
 *
 * // Using the object-style API
 * await BackgroundGuardian.acquireWakeLock('MyTask');
 * await BackgroundGuardian.releaseWakeLock();
 * ```
 */
const BackgroundGuardian: BackgroundGuardianInterface = {
  acquireWakeLock,
  releaseWakeLock,
  isWakeLockHeld,
  enableScreenWakeLock,
  disableScreenWakeLock,
  isIgnoringBatteryOptimizations,
  requestBatteryOptimizationExemption,
  isPowerSaveMode,
  openPowerSaveModeSettings,
  openOEMSettings,
  openBatteryOptimizationSettings,
  isDeviceIdleMode,
  getDeviceManufacturer,
};

export default BackgroundGuardian;
