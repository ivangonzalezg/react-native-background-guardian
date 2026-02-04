import { useEffect, useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  Platform,
  AppState,
} from 'react-native';
import BackgroundGuardian from 'react-native-background-guardian';

export default function App() {
  const [manufacturer, setManufacturer] = useState<string | null>(null);
  const [isIgnoring, setIsIgnoring] = useState<boolean | null>(null);
  const [wakeLockHeld, setWakeLockHeld] = useState(false);
  const [isScreenWakeLockEnabled, setIsScreenWakeLockEnabled] = useState(false);
  const [isPowerSave, setIsPowerSave] = useState<boolean | null>(null);
  const [isDeviceIdle, setIsDeviceIdle] = useState<boolean | null>(null);

  const refreshWakeLockStatus = useCallback(async () => {
    const isHeld = await BackgroundGuardian.isWakeLockHeld();
    setWakeLockHeld(isHeld);
  }, []);

  const refreshBatteryStatus = useCallback(async () => {
    const ignoring = await BackgroundGuardian.isIgnoringBatteryOptimizations();
    setIsIgnoring(ignoring);
  }, []);

  const refreshPowerSaveStatus = useCallback(async () => {
    const powerSave = await BackgroundGuardian.isPowerSaveMode();
    setIsPowerSave(powerSave);
  }, []);

  const refreshDeviceIdleStatus = useCallback(async () => {
    const deviceIdle = await BackgroundGuardian.isDeviceIdleMode();
    setIsDeviceIdle(deviceIdle);
  }, []);

  const init = useCallback(async () => {
    const mfr = await BackgroundGuardian.getDeviceManufacturer();
    setManufacturer(mfr);
    await refreshBatteryStatus();
    await refreshPowerSaveStatus();
    await refreshWakeLockStatus();
    await refreshDeviceIdleStatus();
  }, [
    refreshBatteryStatus,
    refreshPowerSaveStatus,
    refreshWakeLockStatus,
    refreshDeviceIdleStatus,
  ]);

  useEffect(() => {
    init();
  }, [init]);

  const handleAppStateChange = useCallback(
    (nextAppState: string) => {
      if (nextAppState === 'active') {
        refreshBatteryStatus();
        refreshPowerSaveStatus();
        refreshWakeLockStatus();
        refreshDeviceIdleStatus();
      }
    },
    [
      refreshBatteryStatus,
      refreshPowerSaveStatus,
      refreshWakeLockStatus,
      refreshDeviceIdleStatus,
    ]
  );

  // Refresh battery status when app comes back to foreground
  // This handles the case where user accepts/rejects the battery optimization dialog
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  const handleAcquireWakeLock = useCallback(async () => {
    await BackgroundGuardian.acquireWakeLock('ExampleApp');
    await refreshWakeLockStatus();
  }, [refreshWakeLockStatus]);

  const handleReleaseWakeLock = useCallback(async () => {
    await BackgroundGuardian.releaseWakeLock();
    await refreshWakeLockStatus();
  }, [refreshWakeLockStatus]);

  const handleEnableScreenWakeLock = useCallback(async () => {
    const enabled = await BackgroundGuardian.enableScreenWakeLock();
    if (enabled) {
      setIsScreenWakeLockEnabled(true);
    }
  }, []);

  const handleDisableScreenWakeLock = useCallback(async () => {
    const disabled = await BackgroundGuardian.disableScreenWakeLock();
    if (disabled) {
      setIsScreenWakeLockEnabled(false);
    }
  }, []);

  const handleRequestExemption = useCallback(async () => {
    await BackgroundGuardian.requestBatteryOptimizationExemption();
    await refreshBatteryStatus();
  }, [refreshBatteryStatus]);

  const handleOpenOEMSettings = useCallback(async () => {
    await BackgroundGuardian.openOEMSettings();
  }, []);

  const handleOpenPowerSaveSettings = useCallback(async () => {
    await BackgroundGuardian.openPowerSaveModeSettings();
  }, []);

  const handleOpenBatterySettings = useCallback(async () => {
    await BackgroundGuardian.openBatteryOptimizationSettings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BackgroundGuardian</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Platform:</Text>
        <Text style={styles.value}>{Platform.OS}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Manufacturer:</Text>
        <Text style={styles.value}>{manufacturer ?? 'Loading...'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Ignoring Battery Opt:</Text>
        <Text style={styles.value}>
          {isIgnoring === null ? 'Loading...' : isIgnoring ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Wake Lock Held:</Text>
        <Text style={styles.value}>{wakeLockHeld ? 'Yes' : 'No'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Keep Screen On:</Text>
        <Text style={styles.value}>
          {isScreenWakeLockEnabled ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Power Save Mode:</Text>
        <Text style={styles.value}>
          {isPowerSave === null ? 'Loading...' : isPowerSave ? 'On' : 'Off'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Device Idle (Doze):</Text>
        <Text style={styles.value}>
          {isDeviceIdle === null ? 'Loading...' : isDeviceIdle ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={wakeLockHeld ? 'Release Wake Lock' : 'Acquire Wake Lock'}
          onPress={wakeLockHeld ? handleReleaseWakeLock : handleAcquireWakeLock}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={
            isScreenWakeLockEnabled
              ? 'Disable Screen Wake'
              : 'Enable Screen Wake'
          }
          onPress={
            isScreenWakeLockEnabled
              ? handleDisableScreenWakeLock
              : handleEnableScreenWakeLock
          }
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Request Battery Exemption"
          onPress={handleRequestExemption}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Open Battery Opt. Settings"
          onPress={handleOpenBatterySettings}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Open OEM Settings" onPress={handleOpenOEMSettings} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Open Power Save Settings"
          onPress={handleOpenPowerSaveSettings}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  infoContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
  },
  value: {
    color: '#666',
  },
  buttonContainer: {
    marginVertical: 8,
    width: '100%',
  },
});
