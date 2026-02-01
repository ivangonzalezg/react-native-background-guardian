#import "BackgroundGuardian.h"

/**
 * BackgroundGuardian iOS Implementation
 *
 * This is a no-op (no operation) implementation for iOS. All methods return safe
 * default values immediately without performing any actual operations.
 *
 * Why no-op?
 * - iOS handles background execution differently through Background Modes, not wake locks
 * - iOS doesn't have user-configurable battery optimization settings like Android
 * - iOS doesn't have OEM-specific battery management (Apple controls the entire stack)
 *
 * This approach allows developers to use the same API on both platforms without
 * platform-specific conditionals in their JavaScript code.
 */
@implementation BackgroundGuardian

#pragma mark - TurboModule Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBackgroundGuardianSpecJSI>(params);
}

+ (NSString *)moduleName
{
    return @"BackgroundGuardian";
}

#pragma mark - Wake Lock Methods

/**
 * Acquires a wake lock (no-op on iOS).
 *
 * On iOS, there's no direct equivalent to Android's wake locks. iOS manages
 * background execution through Background Modes (audio, location, VoIP, etc.)
 * which are configured in Info.plist, not acquired programmatically.
 *
 * @param tag Identifier for the wake lock (ignored on iOS)
 * @param timeout Timeout in milliseconds (ignored on iOS)
 * @param resolve Promise resolver - always resolves with true
 * @param reject Promise rejecter - never called
 */
- (void)acquireWakeLock:(NSString *)tag
                timeout:(double)timeout
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
    // No-op: iOS doesn't support wake locks in the Android sense.
    // Background execution is handled via Background Modes in Info.plist.
    resolve(@(YES));
}

/**
 * Releases a wake lock (no-op on iOS).
 *
 * Since we don't acquire wake locks on iOS, releasing is also a no-op.
 *
 * @param resolve Promise resolver - always resolves with true
 * @param reject Promise rejecter - never called
 */
- (void)releaseWakeLock:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
    // No-op: Nothing to release on iOS.
    resolve(@(YES));
}

/**
 * Checks if a wake lock is currently held (no-op on iOS).
 *
 * Since iOS doesn't support wake locks, we always return false.
 *
 * @param resolve Promise resolver - always resolves with false
 * @param reject Promise rejecter - never called
 */
- (void)isWakeLockHeld:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
    // No-op: iOS doesn't have wake locks, so none can be held.
    resolve(@(NO));
}

#pragma mark - Battery Optimization Methods

/**
 * Checks if the app is ignoring battery optimizations (no-op on iOS).
 *
 * iOS doesn't have the same battery optimization exemption system as Android.
 * Apps either have background capabilities configured in Info.plist or they don't.
 * We return true to indicate the app can proceed with background work.
 *
 * @param resolve Promise resolver - always resolves with true
 * @param reject Promise rejecter - never called
 */
- (void)isIgnoringBatteryOptimizations:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject
{
    // No-op: iOS doesn't have Android-style battery optimization settings.
    // Return true to indicate no restrictions from this API's perspective.
    resolve(@(YES));
}

/**
 * Requests battery optimization exemption (no-op on iOS).
 *
 * iOS doesn't have a system dialog for battery optimization exemption.
 * Background capabilities are declared in Info.plist and reviewed by Apple.
 * We return true to indicate the "request" was successful (nothing to request).
 *
 * @param resolve Promise resolver - always resolves with true
 * @param reject Promise rejecter - never called
 */
- (void)requestBatteryOptimizationExemption:(RCTPromiseResolveBlock)resolve
                                     reject:(RCTPromiseRejectBlock)reject
{
    // No-op: iOS doesn't have a battery optimization exemption dialog.
    // Background capabilities are configured via Info.plist.
    resolve(@(YES));
}

#pragma mark - Power Save Mode Methods

/**
 * Checks if power save mode is enabled (no-op on iOS).
 *
 * iOS has Low Power Mode, but checking it requires UIKit and has different
 * semantics than Android's Power Save mode. For API consistency, we return
 * false to indicate no system-wide power restrictions from this API's perspective.
 *
 * @param resolve Promise resolver - always resolves with false
 * @param reject Promise rejecter - never called
 */
- (void)isPowerSaveMode:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
    // No-op: iOS Low Power Mode has different semantics and checking it
    // requires UIKit. Return false for API consistency.
    resolve(@(NO));
}

/**
 * Opens power save mode settings (no-op on iOS).
 *
 * iOS doesn't allow opening specific Settings pages programmatically
 * beyond the app's own settings. Return false to indicate settings
 * could not be opened.
 *
 * @param resolve Promise resolver - always resolves with false
 * @param reject Promise rejecter - never called
 */
- (void)openPowerSaveModeSettings:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject
{
    // No-op: iOS doesn't allow opening specific system settings pages.
    resolve(@(NO));
}

#pragma mark - OEM Settings Methods

/**
 * Opens OEM-specific battery settings (no-op on iOS).
 *
 * Unlike Android where different manufacturers (Xiaomi, Samsung, etc.) have
 * custom battery optimization settings, iOS has no OEM variations - Apple
 * controls the entire hardware and software stack.
 *
 * Returns false to indicate no OEM settings are available.
 *
 * @param resolve Promise resolver - always resolves with false
 * @param reject Promise rejecter - never called
 */
- (void)openOEMSettings:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
    // No-op: iOS has no OEM-specific settings (Apple is the only "OEM").
    // Return false to indicate no settings were opened.
    resolve(@(NO));
}

/**
 * Opens battery optimization settings list (no-op on iOS).
 *
 * iOS doesn't have a granular battery optimization settings list for apps.
 *
 * @param resolve Promise resolver - always resolves with false
 * @param reject Promise rejecter - never called
 */
- (void)openBatteryOptimizationSettings:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject
{
    resolve(@(NO));
}

/**
 * Checks if device is in idle mode (no-op on iOS).
 *
 * iOS doesn't expose a "Doze" equivalent status in the same way.
 *
 * @param resolve Promise resolver - always resolves with false
 * @param reject Promise rejecter - never called
 */
- (void)isDeviceIdleMode:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
    resolve(@(NO));
}

#pragma mark - Device Info Methods

/**
 * Gets the device manufacturer.
 *
 * On iOS, the manufacturer is always Apple. This is useful for cross-platform
 * code that needs to identify the device manufacturer.
 *
 * @param resolve Promise resolver - always resolves with "Apple"
 * @param reject Promise rejecter - never called
 */
- (void)getDeviceManufacturer:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
    // iOS devices are exclusively manufactured by Apple.
    resolve(@"Apple");
}

@end
