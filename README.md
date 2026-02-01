# react-native-background-guardian

[![npm version](https://img.shields.io/npm/v/react-native-background-guardian.svg)](https://www.npmjs.com/package/react-native-background-guardian)
[![license](https://img.shields.io/npm/l/react-native-background-guardian.svg)](https://github.com/ivangonzalezg/react-native-background-guardian/blob/main/LICENSE)
[![platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue.svg)](https://reactnative.dev/)

A cross-platform React Native library that prevents Android from killing background processes through Wake Locks, battery optimization exemptions, and OEM-specific protections. iOS-safe with no-op implementation.

## Features

- **Wake Lock Management** - Keep CPU running during background tasks
- **Battery Optimization Exemption** - Request Doze mode whitelist
- **Power Save Mode Detection** - Detect and manage Battery Saver mode
- **OEM-Specific Settings** - Navigate to manufacturer battery settings (Xiaomi, Samsung, Huawei, etc.)
- **Cross-Platform** - Safe no-op implementation for iOS
- **TypeScript Support** - Full type definitions included
- **New Architecture Ready** - Built as a Turbo Module

## Installation

```sh
npm install react-native-background-guardian
# or
yarn add react-native-background-guardian
```

### iOS

```sh
cd ios && pod install
```

### Android

No additional setup required. Permissions are automatically merged via the Android manifest.

## API Reference

### `acquireWakeLock(tag?: string, timeout?: number): Promise<boolean>`

Acquires a partial wake lock to keep the CPU running while the screen is off.

- `tag`: Optional identifier for debugging. Defaults to "BackgroundGuardian".
- `timeout`: Optional timeout in milliseconds. Defaults to **24 hours** (86,400,000 ms). **Note**: The wake lock is automatically released after this time to prevent battery drain if the app crashes.

```typescript
import BackgroundGuardian from 'react-native-background-guardian';

// Acquire wake lock with a custom 10-minute timeout
const acquired = await BackgroundGuardian.acquireWakeLock('MyBackgroundTask', 10 * 60 * 1000);
if (acquired) {
  // Perform background work
  await doBackgroundWork();
  // Release when done
  await BackgroundGuardian.releaseWakeLock();
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Acquires `PARTIAL_WAKE_LOCK` via PowerManager |
| iOS      | No-op, returns `true` |

### `releaseWakeLock(): Promise<boolean>`

Releases a previously acquired wake lock.

```typescript
const released = await BackgroundGuardian.releaseWakeLock();
console.log('Wake lock released:', released);
```

| Platform | Behavior |
|----------|----------|
| Android  | Releases the wake lock if held |
| iOS      | No-op, returns `true` |

### `isWakeLockHeld(): Promise<boolean>`

Checks if a wake lock is currently held.

```typescript
const isHeld = await BackgroundGuardian.isWakeLockHeld();
if (!isHeld) {
  await BackgroundGuardian.acquireWakeLock('MyTask');
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Returns `true` if wake lock is actively held |
| iOS      | No-op, returns `false` |

### `isIgnoringBatteryOptimizations(): Promise<boolean>`

Checks if the app is exempt from battery optimizations (Doze mode whitelist).

```typescript
const isIgnoring = await BackgroundGuardian.isIgnoringBatteryOptimizations();
if (!isIgnoring) {
  // Prompt user to exempt the app
  await BackgroundGuardian.requestBatteryOptimizationExemption();
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Checks via `PowerManager.isIgnoringBatteryOptimizations()` |
| iOS      | No-op, returns `true` |

### `requestBatteryOptimizationExemption(): Promise<boolean>`

Opens the system dialog to request battery optimization exemption.

```typescript
const dialogShown = await BackgroundGuardian.requestBatteryOptimizationExemption();
if (dialogShown) {
  console.log('User was prompted for battery optimization exemption');
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Shows `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` dialog |
| iOS      | No-op, returns `true` |

> **Note**: Google Play has restrictions on using `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`. Only use if your app genuinely requires background execution (messaging, health tracking, device management, etc.).

### `openBatteryOptimizationSettings(): Promise<boolean>`

Opens the system list of apps allowed to ignore battery optimizations. This is a safer alternative to `requestBatteryOptimizationExemption` as it requires no special permission and avoids Google Play policy issues.

```typescript
// Open the settings list so the user can manually toggle the switch
await BackgroundGuardian.openBatteryOptimizationSettings();
```

| Platform | Behavior |
|----------|----------|
| Android  | Opens `ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS` |
| iOS      | No-op, returns `false` |

### `isDeviceIdleMode(): Promise<boolean>`

Checks if the device is currently in idle (Doze) mode.

```typescript
const isIdle = await BackgroundGuardian.isDeviceIdleMode();
if (isIdle) {
  console.log('App is running during a Doze maintenance window');
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Checks `PowerManager.isDeviceIdleMode()` |
| iOS      | No-op, returns `false` |

### `isPowerSaveMode(): Promise<boolean>`

Checks if the device is in Power Save (Battery Saver) mode.

```typescript
const isPowerSave = await BackgroundGuardian.isPowerSaveMode();
if (isPowerSave) {
  Alert.alert(
    'Battery Saver Active',
    'Background features may be limited.',
    [{ text: 'Open Settings', onPress: () => BackgroundGuardian.openPowerSaveModeSettings() }]
  );
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Checks `PowerManager.isPowerSaveMode()` |
| iOS      | No-op, returns `false` |

> **Note**: Power Save mode is different from battery optimization exemptions. An app can be exempt from Doze mode (`isIgnoringBatteryOptimizations() = true`) but still be affected by Power Save mode restrictions.

### `openPowerSaveModeSettings(): Promise<boolean>`

Opens the system Power Save Mode (Battery Saver) settings.

```typescript
const opened = await BackgroundGuardian.openPowerSaveModeSettings();
if (opened) {
  console.log('Battery Saver settings opened');
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Opens Battery Saver settings page |
| iOS      | No-op, returns `false` |

### `openOEMSettings(): Promise<boolean>`

Opens OEM-specific battery or background settings if available.

```typescript
const manufacturer = await BackgroundGuardian.getDeviceManufacturer();
console.log(`Device: ${manufacturer}`);

const opened = await BackgroundGuardian.openOEMSettings();
if (opened) {
  console.log('OEM battery settings opened');
} else {
  console.log('No OEM-specific settings available');
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Opens OEM settings or falls back to battery optimization settings |
| iOS      | No-op, returns `false` |

### `getDeviceManufacturer(): Promise<string | null>`

Gets the device manufacturer name.

```typescript
const manufacturer = await BackgroundGuardian.getDeviceManufacturer();
if (manufacturer?.toLowerCase() === 'xiaomi') {
  // Show MIUI-specific instructions
  showMIUIInstructions();
}
```

| Platform | Behavior |
|----------|----------|
| Android  | Returns `Build.MANUFACTURER` (lowercase) |
| iOS      | Returns `"Apple"` |

## OEM Compatibility

Many Android manufacturers implement aggressive battery optimization that can kill apps even when standard Android battery optimizations are disabled. `openOEMSettings()` supports the following manufacturers:

| Manufacturer | Brand/OS | Supported |
|--------------|----------|-----------|
| Xiaomi | MIUI | ✅ |
| Huawei | EMUI | ✅ |
| Honor | Magic UI | ✅ |
| Samsung | OneUI | ✅ |
| Oppo | ColorOS | ✅ |
| Vivo | FuntouchOS | ✅ |
| OnePlus | OxygenOS | ✅ |
| Realme | Realme UI | ✅ |
| Asus | ZenUI | ✅ |
| Lenovo | - | ✅ |
| Meizu | Flyme | ✅ |
| Nokia | - | ✅ |
| Other | Stock Android | ⚡ Fallback |

**Fallback behavior**: For unsupported manufacturers, the library falls back to:
1. `ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS` (battery optimization list)
2. `ACTION_APPLICATION_DETAILS_SETTINGS` (app details page)

## Usage Examples

### Background Audio Player

```typescript
import BackgroundGuardian from 'react-native-background-guardian';

async function startAudioPlayback() {
  // Acquire wake lock to prevent CPU sleep
  await BackgroundGuardian.acquireWakeLock('AudioPlayer');

  // Start audio playback
  await audioPlayer.play();
}

async function stopAudioPlayback() {
  // Stop audio playback
  await audioPlayer.stop();

  // Release wake lock
  await BackgroundGuardian.releaseWakeLock();
}
```

### Background Location Tracking

```typescript
import BackgroundGuardian from 'react-native-background-guardian';
import { AppState } from 'react-native';

async function setupBackgroundTracking() {
  // Check battery optimization status
  const isIgnoring = await BackgroundGuardian.isIgnoringBatteryOptimizations();

  if (!isIgnoring) {
    // Request exemption for reliable background execution
    await BackgroundGuardian.requestBatteryOptimizationExemption();
  }

  // For aggressive OEMs, guide user to additional settings
  const manufacturer = await BackgroundGuardian.getDeviceManufacturer();
  if (['xiaomi', 'huawei', 'oppo', 'vivo'].includes(manufacturer ?? '')) {
    // Show instructions and open OEM settings
    Alert.alert(
      'Additional Setup Required',
      'Please enable "Autostart" and disable battery optimization for this app.',
      [{ text: 'Open Settings', onPress: () => BackgroundGuardian.openOEMSettings() }]
    );
  }
}
```

### Complete Integration Example

```typescript
import { useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import BackgroundGuardian from 'react-native-background-guardian';

export function useBackgroundGuardian() {
  const [isReady, setIsReady] = useState(false);
  const [manufacturer, setManufacturer] = useState<string | null>(null);
  const [isIgnoringBatteryOpt, setIsIgnoringBatteryOpt] = useState(false);

  const refreshStatus = useCallback(async () => {
    const ignoring = await BackgroundGuardian.isIgnoringBatteryOptimizations();
    setIsIgnoringBatteryOpt(ignoring);
  }, []);

  useEffect(() => {
    async function init() {
      const mfr = await BackgroundGuardian.getDeviceManufacturer();
      setManufacturer(mfr);
      await refreshStatus();
      setIsReady(true);
    }
    init();
  }, [refreshStatus]);

  // Refresh status when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshStatus();
      }
    });
    return () => subscription.remove();
  }, [refreshStatus]);

  const requestExemption = useCallback(async () => {
    await BackgroundGuardian.requestBatteryOptimizationExemption();
    await refreshStatus();
  }, [refreshStatus]);

  return {
    isReady,
    manufacturer,
    isIgnoringBatteryOpt,
    requestExemption,
    openOEMSettings: BackgroundGuardian.openOEMSettings,
    acquireWakeLock: BackgroundGuardian.acquireWakeLock,
    releaseWakeLock: BackgroundGuardian.releaseWakeLock,
  };
}
```

## Surviving Android Doze and App Standby

Android has two power-saving features that extend battery life by managing how apps behave when a device isn't connected to a power source: **Doze** and **App Standby**.

- **Doze**: Reduces battery consumption by deferring background CPU and network activity when the device is unused for long periods.
- **App Standby**: Defers background network activity for apps with no recent user activity.

### Doze Mode Strategies

When Doze mode is active, the system:
- Suspends network access.
- Ignores wake locks (unless you are in a maintenance window).
- Defers alarms.
- Stops Wi-Fi scans.

#### Solution A: Battery Optimization Exemption

Apps that are partially exempt from battery optimizations can:
- Use the network.
- Hold partial wake locks **even during Doze**.

**How to implement:**

1.  Check if you are already exempt:
    ```typescript
    const isIgnoring = await BackgroundGuardian.isIgnoringBatteryOptimizations();
    ```
2.  If not, guide the user to the settings. You have two options:
    *   **Option 1: Request Dialog (Restricted)**
        *   Uses `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.
        *   Shows a direct "Allow" dialog.
        *   **Warning**: Google Play restricts this permission to specific use cases (see "Acceptable Use Cases" below).
        ```typescript
        await BackgroundGuardian.requestBatteryOptimizationExemption();
        ```
    *   **Option 2: Settings List (Safe)**
        *   Opens the list of apps. User must find your app and select "Don't optimize".
        *   Safe for all apps; no special permissions needed.
        ```typescript
        await BackgroundGuardian.openBatteryOptimizationSettings();
        ```

3.  **Handle OEM-Specific Restrictions**: Some manufacturers (Xiaomi, Samsung, etc.) have *additional* battery savers. Use `openOEMSettings()` to help the user disable them.

#### Solution B: Foreground Services

If your app needs to run constantly (e.g., Music Player, Fitness Tracker), you **must** use a Foreground Service. A foreground service shows a persistent notification, signaling to the system that the app is "active" even if not on screen.

- **Note**: `react-native-background-guardian` helps with *Wake Locks* and *Settings*, but you need a library like `react-native-background-actions` or native code to start a Foreground Service.
- A Foreground Service prevents the system from considering your app "Idle", thus avoiding App Standby.

### Testing Doze Mode

You can force your device into Doze mode to test how your app behaves.

1.  Connect device via ADB.
2.  Force Idle Mode:
    ```bash
    adb shell dumpsys deviceidle force-idle
    ```
3.  You can use `BackgroundGuardian.isDeviceIdleMode()` to log when this happens.
4.  To exit:
    ```bash
    adb shell dumpsys deviceidle unforce
    adb shell dumpsys battery reset
    ```

### Acceptable Use Cases for Exemption

If you use `requestBatteryOptimizationExemption()` (the direct dialog), your app must fall into one of these categories to be allowed on Google Play:

| App Type | Description |
|----------|-------------|
| **Chat / Voice / Video** | Apps needing real-time messaging where FCM High Priority is insufficient. |
| **Task Automation** | Apps that schedule automated actions (macros). |
| **Health / Fitness** | Tracking workouts (often combined with Foreground Service). |
| **Device Connection** | Companion apps for smartwatches, IoT devices, etc. |
| **Safety** | Apps for personal safety (SOS). |
| **VPN / Proxy** | Network tools. |

**If your app does not fit these categories**, do not use `requestBatteryOptimizationExemption()`. Instead, use `openBatteryOptimizationSettings()` and instruct the user manually.

### Checklist for Background Reliability

1.  [ ] **Wake Lock**: Call `acquireWakeLock()` during critical tasks.
2.  [ ] **Exemption**: Check `isIgnoringBatteryOptimizations()`.
3.  [ ] **Power Saver**: Check `isPowerSaveMode()` (System Battery Saver affects even exempt apps!).
4.  [ ] **OEM Settings**: Check `getDeviceManufacturer()` and show instructions for Xiaomi/Huawei/Samsung users.
5.  [ ] **Foreground Service**: Use if you need continuous long-running execution.

## Android Permissions

The library automatically adds the following permissions to your Android manifest:

```xml
<!-- Required for Wake Lock functionality -->
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Required for requesting battery optimization exemption -->
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

## Troubleshooting

### Wake lock not working

1. Ensure you're testing on a real device (emulators may behave differently)
2. Verify the wake lock is acquired using ADB:
   ```sh
   adb shell dumpsys power | grep "BackgroundGuardian"
   ```
3. Make sure you're calling `releaseWakeLock()` when done

### Battery optimization status not updating

After the user accepts or rejects the battery optimization dialog, they are taken to the system settings. Use `AppState` to refresh the status when the app returns to the foreground:

```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      refreshBatteryStatus();
    }
  });
  return () => subscription.remove();
}, []);
```

### OEM settings not opening

Some OEM activities may not exist on all device variants or OS versions. The library tries multiple activities per manufacturer and falls back gracefully. If no OEM settings are found, it opens the standard battery optimization settings.

### Google Play policy considerations

The `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` permission is restricted by Google Play. Only use it if your app falls into one of these categories:

- VoIP apps
- Messaging apps
- Health/fitness tracking
- IoT/device management
- Task automation apps
- Other apps that genuinely require background execution

## Limitations

- **iOS**: All methods are no-ops that return safe default values. iOS handles background execution differently through Background Modes.
- **Android < 6.0 (API 23)**: Battery optimization APIs are not available. Methods return appropriate defaults.
- **OEM Settings**: May not work on all device variants as manufacturers frequently change their system app packages.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
