import { useState, useCallback, useEffect } from 'react';

export interface PrivacySettings {
  saveVerifications: boolean;
  saveBiometrics: boolean;
  shareAnalytics: boolean;
  autoDeleteAfter: string;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  saveVerifications: true,
  saveBiometrics: false,
  shareAnalytics: false,
  autoDeleteAfter: '30',
};

const STORAGE_KEY = 'privacy_settings';

export function usePrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>(() => {
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
      console.error('Failed to save privacy settings:', error);
    }
  }, [settings]);

  const toggleSetting = useCallback((key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const updateAutoDelete = useCallback((value: string) => {
    setSettings(prev => ({
      ...prev,
      autoDeleteAfter: value,
    }));
  }, []);

  return {
    settings,
    toggleSetting,
    updateAutoDelete,
  };
}
