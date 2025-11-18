import { useState, useCallback, useEffect } from 'react';

export interface NotificationSettings {
  verificationComplete: boolean;
  expiryWarnings: boolean;
  transactionUpdates: boolean;
  systemAlerts: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  verificationComplete: true,
  expiryWarnings: true,
  transactionUpdates: true,
  systemAlerts: true,
  soundEnabled: false,
  desktopNotifications: false,
};

const STORAGE_KEY = 'notification_settings';

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }, [settings]);

  const toggleSetting = useCallback((key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const requestDesktopNotifications = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      if (granted) {
        setSettings(prev => ({
          ...prev,
          desktopNotifications: true,
        }));
      }

      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  return {
    settings,
    toggleSetting,
    requestDesktopNotifications,
  };
}
