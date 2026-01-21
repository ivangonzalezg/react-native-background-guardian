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

  const refreshBatteryStatus = useCallback(async () => {
    const ignoring = await BackgroundGuardian.isIgnoringBatteryOptimizations();
    setIsIgnoring(ignoring);
  }, []);

  useEffect(() => {
    const init = async () => {
      const mfr = await BackgroundGuardian.getDeviceManufacturer();
      setManufacturer(mfr);
      await refreshBatteryStatus();
    };
    init();
  }, [refreshBatteryStatus]);

  // Refresh battery status when app comes back to foreground
  // This handles the case where user accepts/rejects the battery optimization dialog
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshBatteryStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshBatteryStatus]);

  const handleAcquireWakeLock = async () => {
    const result = await BackgroundGuardian.acquireWakeLock('ExampleApp');
    setWakeLockHeld(result);
  };

  const handleReleaseWakeLock = async () => {
    const result = await BackgroundGuardian.releaseWakeLock();
    if (result) {
      setWakeLockHeld(false);
    }
  };

  const handleRequestExemption = async () => {
    await BackgroundGuardian.requestBatteryOptimizationExemption();
    await refreshBatteryStatus();
  };

  const handleOpenOEMSettings = async () => {
    await BackgroundGuardian.openOEMSettings();
  };

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

      <View style={styles.buttonContainer}>
        <Button
          title={wakeLockHeld ? 'Release Wake Lock' : 'Acquire Wake Lock'}
          onPress={wakeLockHeld ? handleReleaseWakeLock : handleAcquireWakeLock}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Request Battery Exemption"
          onPress={handleRequestExemption}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Open OEM Settings" onPress={handleOpenOEMSettings} />
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
