import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Native module specification for BackgroundGuardian.
 * Defines the contract between JavaScript and native code.
 *
 * All methods return Promises for async native operations.
 * iOS implementations should return safe no-op values.
 */
export interface Spec extends TurboModule {
  /**
   * Acquires a partial wake lock to keep the CPU running while the screen is off.
   * On Android, this prevents the system from suspending the CPU.
   * On iOS, this is a no-op and returns true immediately.
   *
   * @param tag - Optional identifier for the wake lock (useful for debugging)
   * @returns Promise resolving to true if successfully acquired, false otherwise
   */
  acquireWakeLock(tag: string): Promise<boolean>;

  /**
   * Releases a previously acquired wake lock.
   * On Android, this releases the CPU wake lock.
   * On iOS, this is a no-op and returns true immediately.
   *
   * @returns Promise resolving to true if successfully released, false otherwise
   */
  releaseWakeLock(): Promise<boolean>;

  /**
   * Checks if a wake lock is currently held.
   * On Android, returns whether a wake lock is actively held.
   * On iOS, this is a no-op and returns false immediately.
   *
   * @returns Promise resolving to true if a wake lock is held, false otherwise
   */
  isWakeLockHeld(): Promise<boolean>;

  /**
   * Checks if the app is currently ignoring battery optimizations.
   * On Android, checks if the app is whitelisted from Doze mode.
   * On iOS, this is a no-op and returns true immediately.
   *
   * @returns Promise resolving to true if ignoring optimizations, false otherwise
   */
  isIgnoringBatteryOptimizations(): Promise<boolean>;

  /**
   * Opens the system dialog to request battery optimization exemption.
   * On Android, shows the REQUEST_IGNORE_BATTERY_OPTIMIZATIONS intent.
   * On iOS, this is a no-op and returns true immediately.
   *
   * @returns Promise resolving to true if the dialog was shown, false otherwise
   */
  requestBatteryOptimizationExemption(): Promise<boolean>;

  /**
   * Opens OEM-specific battery/background settings if available.
   * On Android, attempts to open manufacturer-specific battery settings
   * (e.g., Xiaomi MIUI, Samsung, Huawei, etc.).
   * On iOS, this is a no-op and returns false immediately.
   *
   * @returns Promise resolving to true if settings were opened, false if not available
   */
  openOEMSettings(): Promise<boolean>;

  /**
   * Checks if the device is in Power Save (Battery Saver) mode.
   * On Android, checks PowerManager.isPowerSaveMode().
   * On iOS, this is a no-op and returns false immediately.
   *
   * Power Save mode is a system-wide setting that affects ALL apps, regardless
   * of battery optimization exemptions. When active, it may throttle network,
   * location updates, and background processing.
   *
   * @returns Promise resolving to true if power save mode is enabled, false otherwise
   */
  isPowerSaveMode(): Promise<boolean>;

  /**
   * Opens the system Power Save Mode settings.
   * On Android, opens the Battery Saver settings page.
   * On iOS, this is a no-op and returns false immediately.
   *
   * @returns Promise resolving to true if settings were opened, false otherwise
   */
  openPowerSaveModeSettings(): Promise<boolean>;

  /**
   * Gets the device manufacturer name.
   * On Android, returns Build.MANUFACTURER.
   * On iOS, returns "Apple".
   *
   * @returns Promise resolving to the manufacturer string, or null if unavailable
   */
  getDeviceManufacturer(): Promise<string | null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BackgroundGuardian');
