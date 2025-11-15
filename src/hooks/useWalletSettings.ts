import { useState, useCallback, useEffect } from 'react';

export interface WalletSettings {
  autoConnect: boolean;
}

const DEFAULT_SETTINGS: WalletSettings = {
  autoConnect: true,
};

const STORAGE_KEY = 'wallet_settings';

export function useWalletSettings() {
  const [settings, setSettings] = useState<WalletSettings>(() => {
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
      console.error('Failed to save wallet settings:', error);
    }
  }, [settings]);

  const toggleAutoConnect = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      autoConnect: !prev.autoConnect,
    }));
  }, []);

  const setAutoConnect = useCallback((value: boolean) => {
    setSettings(prev => ({
      ...prev,
      autoConnect: value,
    }));
  }, []);

  return {
    settings,
    toggleAutoConnect,
    setAutoConnect,
  };
}
