# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-21

### Added

- **Wake Lock Management**
  - `acquireWakeLock(tag?)` - Acquire a partial wake lock to keep CPU running
  - `releaseWakeLock()` - Release a previously acquired wake lock

- **Battery Optimization**
  - `isIgnoringBatteryOptimizations()` - Check if app is exempt from Doze mode
  - `requestBatteryOptimizationExemption()` - Request battery optimization exemption via system dialog

- **OEM Settings**
  - `openOEMSettings()` - Open manufacturer-specific battery/autostart settings
  - `getDeviceManufacturer()` - Get device manufacturer name
  - Support for 12 OEM manufacturers: Xiaomi, Huawei, Honor, Samsung, Oppo, Vivo, OnePlus, Realme, Asus, Lenovo, Meizu, Nokia
  - Fallback to standard Android battery optimization settings for unsupported manufacturers

- **iOS Support**
  - Safe no-op implementations for all methods
  - Returns appropriate default values (`true` for most methods, `"Apple"` for manufacturer)

- **TypeScript Support**
  - Full type definitions for all APIs
  - Exported interfaces: `BackgroundGuardianInterface`, `WakeLockResult`, `BatteryOptimizationStatus`, `DeviceInfo`

- **Documentation**
  - Comprehensive README with API reference
  - Usage examples for common scenarios
  - OEM compatibility table
  - Troubleshooting guide

### Technical Details

- Built as a React Native Turbo Module (New Architecture)
- Android: Uses `PowerManager.PARTIAL_WAKE_LOCK` for wake locks
- Android: Requires `WAKE_LOCK` and `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` permissions (auto-merged)
- Minimum Android API: 23 (Marshmallow) for battery optimization features
- 100% test coverage
