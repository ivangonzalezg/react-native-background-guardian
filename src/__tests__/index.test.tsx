// Mock the native module - jest.mock is hoisted, so we use jest.fn() directly
jest.mock('../NativeBackgroundGuardian', () => ({
  __esModule: true,
  default: {
    acquireWakeLock: jest.fn(),
    releaseWakeLock: jest.fn(),
    isWakeLockHeld: jest.fn(),
    enableScreenWakeLock: jest.fn(),
    disableScreenWakeLock: jest.fn(),
    isIgnoringBatteryOptimizations: jest.fn(),
    requestBatteryOptimizationExemption: jest.fn(),
    isPowerSaveMode: jest.fn(),
    openPowerSaveModeSettings: jest.fn(),
    openOEMSettings: jest.fn(),
    getDeviceManufacturer: jest.fn(),
  },
}));

// Import the mocked module to access mock functions
import NativeBackgroundGuardian from '../NativeBackgroundGuardian';

// Import the module under test
import BackgroundGuardian, {
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
  getDeviceManufacturer,
  type BackgroundGuardianInterface,
  type WakeLockResult,
  type BatteryOptimizationStatus,
  type DeviceInfo,
} from '../index';

// Cast to jest.Mock for type safety
const mockNativeModule = NativeBackgroundGuardian as jest.Mocked<
  typeof NativeBackgroundGuardian
>;

describe('BackgroundGuardian', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Module Export Tests ====================

  describe('Module Exports', () => {
    it('should export default BackgroundGuardian object', () => {
      expect(BackgroundGuardian).toBeDefined();
      expect(typeof BackgroundGuardian).toBe('object');
    });

    it('should export all methods on default export', () => {
      expect(BackgroundGuardian.acquireWakeLock).toBeDefined();
      expect(BackgroundGuardian.releaseWakeLock).toBeDefined();
      expect(BackgroundGuardian.isWakeLockHeld).toBeDefined();
      expect(BackgroundGuardian.enableScreenWakeLock).toBeDefined();
      expect(BackgroundGuardian.disableScreenWakeLock).toBeDefined();
      expect(BackgroundGuardian.isIgnoringBatteryOptimizations).toBeDefined();
      expect(
        BackgroundGuardian.requestBatteryOptimizationExemption
      ).toBeDefined();
      expect(BackgroundGuardian.isPowerSaveMode).toBeDefined();
      expect(BackgroundGuardian.openPowerSaveModeSettings).toBeDefined();
      expect(BackgroundGuardian.openOEMSettings).toBeDefined();
      expect(BackgroundGuardian.getDeviceManufacturer).toBeDefined();
    });

    it('should export named functions', () => {
      expect(acquireWakeLock).toBeDefined();
      expect(releaseWakeLock).toBeDefined();
      expect(isWakeLockHeld).toBeDefined();
      expect(enableScreenWakeLock).toBeDefined();
      expect(disableScreenWakeLock).toBeDefined();
      expect(isIgnoringBatteryOptimizations).toBeDefined();
      expect(requestBatteryOptimizationExemption).toBeDefined();
      expect(isPowerSaveMode).toBeDefined();
      expect(openPowerSaveModeSettings).toBeDefined();
      expect(openOEMSettings).toBeDefined();
      expect(getDeviceManufacturer).toBeDefined();
    });

    it('should have consistent function references between default and named exports', () => {
      expect(BackgroundGuardian.acquireWakeLock).toBe(acquireWakeLock);
      expect(BackgroundGuardian.releaseWakeLock).toBe(releaseWakeLock);
      expect(BackgroundGuardian.isWakeLockHeld).toBe(isWakeLockHeld);
      expect(BackgroundGuardian.enableScreenWakeLock).toBe(
        enableScreenWakeLock
      );
      expect(BackgroundGuardian.disableScreenWakeLock).toBe(
        disableScreenWakeLock
      );
      expect(BackgroundGuardian.isIgnoringBatteryOptimizations).toBe(
        isIgnoringBatteryOptimizations
      );
      expect(BackgroundGuardian.requestBatteryOptimizationExemption).toBe(
        requestBatteryOptimizationExemption
      );
      expect(BackgroundGuardian.isPowerSaveMode).toBe(isPowerSaveMode);
      expect(BackgroundGuardian.openPowerSaveModeSettings).toBe(
        openPowerSaveModeSettings
      );
      expect(BackgroundGuardian.openOEMSettings).toBe(openOEMSettings);
      expect(BackgroundGuardian.getDeviceManufacturer).toBe(
        getDeviceManufacturer
      );
    });
  });

  // ==================== Type Tests ====================

  describe('TypeScript Types', () => {
    it('should have correct BackgroundGuardianInterface shape', () => {
      const guardian: BackgroundGuardianInterface = BackgroundGuardian;
      expect(guardian).toBeDefined();
    });

    it('should have correct WakeLockResult shape', () => {
      const result: WakeLockResult = { success: true };
      expect(result.success).toBe(true);
    });

    it('should have correct BatteryOptimizationStatus shape', () => {
      const status: BatteryOptimizationStatus = { isIgnoring: false };
      expect(status.isIgnoring).toBe(false);
    });

    it('should have correct DeviceInfo shape', () => {
      const info: DeviceInfo = { manufacturer: 'samsung' };
      expect(info.manufacturer).toBe('samsung');

      const nullInfo: DeviceInfo = { manufacturer: null };
      expect(nullInfo.manufacturer).toBeNull();
    });
  });

  // ==================== Wake Lock Tests ====================

  describe('acquireWakeLock', () => {
    it('should call native module with default tag', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);

      const result = await acquireWakeLock();

      expect(mockNativeModule.acquireWakeLock).toHaveBeenCalledWith(
        'BackgroundGuardian',
        86400000
      );
      expect(result).toBe(true);
    });

    it('should call native module with custom tag', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);

      const result = await acquireWakeLock('MyCustomTag');

      expect(mockNativeModule.acquireWakeLock).toHaveBeenCalledWith(
        'MyCustomTag',
        86400000
      );
      expect(result).toBe(true);
    });

    it('should call native module with custom timeout', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);

      const result = await acquireWakeLock('CustomTimeout', 10000);

      expect(mockNativeModule.acquireWakeLock).toHaveBeenCalledWith(
        'CustomTimeout',
        10000
      );
      expect(result).toBe(true);
    });

    it('should return false when acquisition fails', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(false);

      const result = await acquireWakeLock();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.acquireWakeLock.mockRejectedValue(
        new Error('Native error')
      );

      await expect(acquireWakeLock()).rejects.toThrow('Native error');
    });

    it('should work with empty string tag', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);

      await acquireWakeLock('');

      expect(mockNativeModule.acquireWakeLock).toHaveBeenCalledWith(
        '',
        86400000
      );
    });
  });

  describe('releaseWakeLock', () => {
    it('should call native module and return true on success', async () => {
      mockNativeModule.releaseWakeLock.mockResolvedValue(true);

      const result = await releaseWakeLock();

      expect(mockNativeModule.releaseWakeLock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no wake lock is held', async () => {
      mockNativeModule.releaseWakeLock.mockResolvedValue(false);

      const result = await releaseWakeLock();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.releaseWakeLock.mockRejectedValue(
        new Error('Release failed')
      );

      await expect(releaseWakeLock()).rejects.toThrow('Release failed');
    });
  });

  describe('enableScreenWakeLock', () => {
    it('should call native module and return true on success', async () => {
      mockNativeModule.enableScreenWakeLock.mockResolvedValue(true);

      const result = await enableScreenWakeLock();

      expect(mockNativeModule.enableScreenWakeLock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when enable fails', async () => {
      mockNativeModule.enableScreenWakeLock.mockResolvedValue(false);

      const result = await enableScreenWakeLock();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.enableScreenWakeLock.mockRejectedValue(
        new Error('Enable screen wake lock failed')
      );

      await expect(enableScreenWakeLock()).rejects.toThrow(
        'Enable screen wake lock failed'
      );
    });
  });

  describe('disableScreenWakeLock', () => {
    it('should call native module and return true on success', async () => {
      mockNativeModule.disableScreenWakeLock.mockResolvedValue(true);

      const result = await disableScreenWakeLock();

      expect(mockNativeModule.disableScreenWakeLock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when disable fails', async () => {
      mockNativeModule.disableScreenWakeLock.mockResolvedValue(false);

      const result = await disableScreenWakeLock();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.disableScreenWakeLock.mockRejectedValue(
        new Error('Disable screen wake lock failed')
      );

      await expect(disableScreenWakeLock()).rejects.toThrow(
        'Disable screen wake lock failed'
      );
    });
  });

  describe('Wake Lock Edge Cases', () => {
    it('should handle multiple consecutive acquires', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);

      await acquireWakeLock('Task1');
      await acquireWakeLock('Task2');
      await acquireWakeLock('Task3');

      expect(mockNativeModule.acquireWakeLock).toHaveBeenCalledTimes(3);
    });

    it('should handle release without prior acquire', async () => {
      mockNativeModule.releaseWakeLock.mockResolvedValue(true);

      const result = await releaseWakeLock();

      expect(mockNativeModule.releaseWakeLock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle acquire-release-acquire sequence', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);
      mockNativeModule.releaseWakeLock.mockResolvedValue(true);

      await acquireWakeLock('First');
      await releaseWakeLock();
      await acquireWakeLock('Second');

      expect(mockNativeModule.acquireWakeLock).toHaveBeenCalledTimes(2);
      expect(mockNativeModule.releaseWakeLock).toHaveBeenCalledTimes(1);
    });
  });

  describe('isWakeLockHeld', () => {
    it('should return true when wake lock is held', async () => {
      mockNativeModule.isWakeLockHeld.mockResolvedValue(true);

      const result = await isWakeLockHeld();

      expect(mockNativeModule.isWakeLockHeld).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no wake lock is held', async () => {
      mockNativeModule.isWakeLockHeld.mockResolvedValue(false);

      const result = await isWakeLockHeld();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.isWakeLockHeld.mockRejectedValue(
        new Error('Check failed')
      );

      await expect(isWakeLockHeld()).rejects.toThrow('Check failed');
    });

    it('should verify wake lock status after acquire', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);
      mockNativeModule.isWakeLockHeld.mockResolvedValue(true);

      await acquireWakeLock('TestTask');
      const isHeld = await isWakeLockHeld();

      expect(isHeld).toBe(true);
    });

    it('should verify wake lock status after release', async () => {
      mockNativeModule.releaseWakeLock.mockResolvedValue(true);
      mockNativeModule.isWakeLockHeld.mockResolvedValue(false);

      await releaseWakeLock();
      const isHeld = await isWakeLockHeld();

      expect(isHeld).toBe(false);
    });
  });

  // ==================== Battery Optimization Tests ====================

  describe('isIgnoringBatteryOptimizations', () => {
    it('should return true when app is ignoring optimizations', async () => {
      mockNativeModule.isIgnoringBatteryOptimizations.mockResolvedValue(true);

      const result = await isIgnoringBatteryOptimizations();

      expect(
        mockNativeModule.isIgnoringBatteryOptimizations
      ).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when app is not ignoring optimizations', async () => {
      mockNativeModule.isIgnoringBatteryOptimizations.mockResolvedValue(false);

      const result = await isIgnoringBatteryOptimizations();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.isIgnoringBatteryOptimizations.mockRejectedValue(
        new Error('Check failed')
      );

      await expect(isIgnoringBatteryOptimizations()).rejects.toThrow(
        'Check failed'
      );
    });
  });

  describe('requestBatteryOptimizationExemption', () => {
    it('should return true when dialog is shown successfully', async () => {
      mockNativeModule.requestBatteryOptimizationExemption.mockResolvedValue(
        true
      );

      const result = await requestBatteryOptimizationExemption();

      expect(
        mockNativeModule.requestBatteryOptimizationExemption
      ).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when dialog cannot be shown', async () => {
      mockNativeModule.requestBatteryOptimizationExemption.mockResolvedValue(
        false
      );

      const result = await requestBatteryOptimizationExemption();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.requestBatteryOptimizationExemption.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(requestBatteryOptimizationExemption()).rejects.toThrow(
        'Permission denied'
      );
    });
  });

  // ==================== Power Save Mode Tests ====================

  describe('isPowerSaveMode', () => {
    it('should return true when power save mode is enabled', async () => {
      mockNativeModule.isPowerSaveMode.mockResolvedValue(true);

      const result = await isPowerSaveMode();

      expect(mockNativeModule.isPowerSaveMode).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when power save mode is disabled', async () => {
      mockNativeModule.isPowerSaveMode.mockResolvedValue(false);

      const result = await isPowerSaveMode();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.isPowerSaveMode.mockRejectedValue(
        new Error('PowerManager error')
      );

      await expect(isPowerSaveMode()).rejects.toThrow('PowerManager error');
    });
  });

  describe('openPowerSaveModeSettings', () => {
    it('should return true when settings are opened', async () => {
      mockNativeModule.openPowerSaveModeSettings.mockResolvedValue(true);

      const result = await openPowerSaveModeSettings();

      expect(mockNativeModule.openPowerSaveModeSettings).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when settings cannot be opened', async () => {
      mockNativeModule.openPowerSaveModeSettings.mockResolvedValue(false);

      const result = await openPowerSaveModeSettings();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.openPowerSaveModeSettings.mockRejectedValue(
        new Error('Settings error')
      );

      await expect(openPowerSaveModeSettings()).rejects.toThrow(
        'Settings error'
      );
    });
  });

  describe('Power Save Mode Integration', () => {
    it('should handle typical power save mode check and action flow', async () => {
      mockNativeModule.isPowerSaveMode.mockResolvedValue(true);
      mockNativeModule.openPowerSaveModeSettings.mockResolvedValue(true);

      const isPowerSave = await isPowerSaveMode();

      if (isPowerSave) {
        const opened = await openPowerSaveModeSettings();
        expect(opened).toBe(true);
      }

      expect(mockNativeModule.isPowerSaveMode).toHaveBeenCalled();
      expect(mockNativeModule.openPowerSaveModeSettings).toHaveBeenCalled();
    });

    it('should distinguish between battery optimization and power save mode', async () => {
      // App can be exempt from Doze but still affected by Power Save mode
      mockNativeModule.isIgnoringBatteryOptimizations.mockResolvedValue(true);
      mockNativeModule.isPowerSaveMode.mockResolvedValue(true);

      const isDozeExempt = await isIgnoringBatteryOptimizations();
      const isPowerSave = await isPowerSaveMode();

      // Both can be true simultaneously
      expect(isDozeExempt).toBe(true);
      expect(isPowerSave).toBe(true);
    });
  });

  // ==================== OEM Settings Tests ====================

  describe('openOEMSettings', () => {
    it('should return true when OEM settings are opened', async () => {
      mockNativeModule.openOEMSettings.mockResolvedValue(true);

      const result = await openOEMSettings();

      expect(mockNativeModule.openOEMSettings).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no OEM settings available', async () => {
      mockNativeModule.openOEMSettings.mockResolvedValue(false);

      const result = await openOEMSettings();

      expect(result).toBe(false);
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.openOEMSettings.mockRejectedValue(
        new Error('Settings error')
      );

      await expect(openOEMSettings()).rejects.toThrow('Settings error');
    });
  });

  // ==================== Device Manufacturer Tests ====================

  describe('getDeviceManufacturer', () => {
    it('should return manufacturer name in lowercase', async () => {
      mockNativeModule.getDeviceManufacturer.mockResolvedValue('samsung');

      const result = await getDeviceManufacturer();

      expect(mockNativeModule.getDeviceManufacturer).toHaveBeenCalled();
      expect(result).toBe('samsung');
    });

    it('should return null when manufacturer cannot be determined', async () => {
      mockNativeModule.getDeviceManufacturer.mockResolvedValue(null);

      const result = await getDeviceManufacturer();

      expect(result).toBeNull();
    });

    it('should handle various manufacturer names', async () => {
      const manufacturers = [
        'xiaomi',
        'huawei',
        'oppo',
        'vivo',
        'oneplus',
        'google',
        'apple',
      ];

      for (const manufacturer of manufacturers) {
        mockNativeModule.getDeviceManufacturer.mockResolvedValue(manufacturer);
        const result = await getDeviceManufacturer();
        expect(result).toBe(manufacturer);
      }
    });

    it('should handle native module rejection', async () => {
      mockNativeModule.getDeviceManufacturer.mockRejectedValue(
        new Error('Device info error')
      );

      await expect(getDeviceManufacturer()).rejects.toThrow(
        'Device info error'
      );
    });
  });

  // ==================== Platform-Specific Tests ====================

  describe('Platform Behavior', () => {
    describe('iOS (no-op behavior)', () => {
      beforeEach(() => {
        // Simulate iOS no-op responses
        mockNativeModule.acquireWakeLock.mockResolvedValue(true);
        mockNativeModule.releaseWakeLock.mockResolvedValue(true);
        mockNativeModule.isWakeLockHeld.mockResolvedValue(false);
        mockNativeModule.isIgnoringBatteryOptimizations.mockResolvedValue(true);
        mockNativeModule.requestBatteryOptimizationExemption.mockResolvedValue(
          true
        );
        mockNativeModule.isPowerSaveMode.mockResolvedValue(false);
        mockNativeModule.openPowerSaveModeSettings.mockResolvedValue(false);
        mockNativeModule.openOEMSettings.mockResolvedValue(false);
        mockNativeModule.getDeviceManufacturer.mockResolvedValue('apple');
      });

      it('should return true for acquireWakeLock on iOS', async () => {
        const result = await acquireWakeLock();
        expect(result).toBe(true);
      });

      it('should return true for releaseWakeLock on iOS', async () => {
        const result = await releaseWakeLock();
        expect(result).toBe(true);
      });

      it('should return false for isWakeLockHeld on iOS', async () => {
        const result = await isWakeLockHeld();
        expect(result).toBe(false);
      });

      it('should return true for isIgnoringBatteryOptimizations on iOS', async () => {
        const result = await isIgnoringBatteryOptimizations();
        expect(result).toBe(true);
      });

      it('should return true for requestBatteryOptimizationExemption on iOS', async () => {
        const result = await requestBatteryOptimizationExemption();
        expect(result).toBe(true);
      });

      it('should return false for isPowerSaveMode on iOS', async () => {
        const result = await isPowerSaveMode();
        expect(result).toBe(false);
      });

      it('should return false for openPowerSaveModeSettings on iOS', async () => {
        const result = await openPowerSaveModeSettings();
        expect(result).toBe(false);
      });

      it('should return false for openOEMSettings on iOS', async () => {
        const result = await openOEMSettings();
        expect(result).toBe(false);
      });

      it('should return "apple" for getDeviceManufacturer on iOS', async () => {
        const result = await getDeviceManufacturer();
        expect(result).toBe('apple');
      });
    });

    describe('Android behavior', () => {
      it('should call native methods on Android', async () => {
        mockNativeModule.acquireWakeLock.mockResolvedValue(true);
        mockNativeModule.getDeviceManufacturer.mockResolvedValue('samsung');

        await acquireWakeLock('AndroidTask');
        const manufacturer = await getDeviceManufacturer();

        expect(mockNativeModule.acquireWakeLock).toHaveBeenCalledWith(
          'AndroidTask',
          86400000
        );
        expect(manufacturer).toBe('samsung');
      });
    });
  });

  // ==================== Integration-Style Tests ====================

  describe('Integration Scenarios', () => {
    it('should handle typical background task flow', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);
      mockNativeModule.releaseWakeLock.mockResolvedValue(true);

      // Acquire wake lock
      const acquired = await acquireWakeLock('BackgroundSync');
      expect(acquired).toBe(true);

      // Simulate background work...

      // Release wake lock
      const released = await releaseWakeLock();
      expect(released).toBe(true);
    });

    it('should handle battery optimization check and request flow', async () => {
      mockNativeModule.isIgnoringBatteryOptimizations.mockResolvedValue(false);
      mockNativeModule.requestBatteryOptimizationExemption.mockResolvedValue(
        true
      );

      // Check current status
      const isIgnoring = await isIgnoringBatteryOptimizations();

      if (!isIgnoring) {
        // Request exemption
        const requested = await requestBatteryOptimizationExemption();
        expect(requested).toBe(true);
      }

      expect(
        mockNativeModule.isIgnoringBatteryOptimizations
      ).toHaveBeenCalled();
      expect(
        mockNativeModule.requestBatteryOptimizationExemption
      ).toHaveBeenCalled();
    });

    it('should handle OEM settings flow based on manufacturer', async () => {
      mockNativeModule.getDeviceManufacturer.mockResolvedValue('xiaomi');
      mockNativeModule.openOEMSettings.mockResolvedValue(true);

      const manufacturer = await getDeviceManufacturer();

      if (manufacturer === 'xiaomi') {
        const opened = await openOEMSettings();
        expect(opened).toBe(true);
      }

      expect(mockNativeModule.getDeviceManufacturer).toHaveBeenCalled();
      expect(mockNativeModule.openOEMSettings).toHaveBeenCalled();
    });

    it('should handle concurrent operations', async () => {
      mockNativeModule.acquireWakeLock.mockResolvedValue(true);
      mockNativeModule.isIgnoringBatteryOptimizations.mockResolvedValue(true);
      mockNativeModule.getDeviceManufacturer.mockResolvedValue('google');

      // Run multiple operations concurrently
      const [wakeLockResult, batteryResult, manufacturerResult] =
        await Promise.all([
          acquireWakeLock('ConcurrentTask'),
          isIgnoringBatteryOptimizations(),
          getDeviceManufacturer(),
        ]);

      expect(wakeLockResult).toBe(true);
      expect(batteryResult).toBe(true);
      expect(manufacturerResult).toBe('google');
    });
  });

  // ==================== Error Handling Tests ====================

  describe('Error Handling', () => {
    it('should propagate errors from acquireWakeLock', async () => {
      const error = new Error('PowerManager not available');
      mockNativeModule.acquireWakeLock.mockRejectedValue(error);

      await expect(acquireWakeLock()).rejects.toThrow(
        'PowerManager not available'
      );
    });

    it('should propagate errors from releaseWakeLock', async () => {
      const error = new Error('WakeLock already released');
      mockNativeModule.releaseWakeLock.mockRejectedValue(error);

      await expect(releaseWakeLock()).rejects.toThrow(
        'WakeLock already released'
      );
    });

    it('should propagate errors from isWakeLockHeld', async () => {
      const error = new Error('Wake lock check failed');
      mockNativeModule.isWakeLockHeld.mockRejectedValue(error);

      await expect(isWakeLockHeld()).rejects.toThrow('Wake lock check failed');
    });

    it('should propagate errors from isIgnoringBatteryOptimizations', async () => {
      const error = new Error('Permission check failed');
      mockNativeModule.isIgnoringBatteryOptimizations.mockRejectedValue(error);

      await expect(isIgnoringBatteryOptimizations()).rejects.toThrow(
        'Permission check failed'
      );
    });

    it('should propagate errors from requestBatteryOptimizationExemption', async () => {
      const error = new Error('Activity not found');
      mockNativeModule.requestBatteryOptimizationExemption.mockRejectedValue(
        error
      );

      await expect(requestBatteryOptimizationExemption()).rejects.toThrow(
        'Activity not found'
      );
    });

    it('should propagate errors from isPowerSaveMode', async () => {
      const error = new Error('PowerManager unavailable');
      mockNativeModule.isPowerSaveMode.mockRejectedValue(error);

      await expect(isPowerSaveMode()).rejects.toThrow(
        'PowerManager unavailable'
      );
    });

    it('should propagate errors from openPowerSaveModeSettings', async () => {
      const error = new Error('Settings activity not found');
      mockNativeModule.openPowerSaveModeSettings.mockRejectedValue(error);

      await expect(openPowerSaveModeSettings()).rejects.toThrow(
        'Settings activity not found'
      );
    });

    it('should propagate errors from openOEMSettings', async () => {
      const error = new Error('Component not found');
      mockNativeModule.openOEMSettings.mockRejectedValue(error);

      await expect(openOEMSettings()).rejects.toThrow('Component not found');
    });

    it('should propagate errors from getDeviceManufacturer', async () => {
      const error = new Error('Build info unavailable');
      mockNativeModule.getDeviceManufacturer.mockRejectedValue(error);

      await expect(getDeviceManufacturer()).rejects.toThrow(
        'Build info unavailable'
      );
    });
  });
});
