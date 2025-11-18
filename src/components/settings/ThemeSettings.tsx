import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import type { SettingsSectionProps } from '@/pages/Settings';

interface ThemeCardProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function ThemeCard({ icon, label, isSelected, onClick }: ThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
          : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
      }`}
    >
      <div className="text-4xl text-black dark:text-white">{icon}</div>
      <span className="font-medium text-black dark:text-white">{label}</span>
    </button>
  );
}

export function ThemeSettings({ onChangesMade }: SettingsSectionProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    onChangesMade();
  };

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Theme Preferences</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the appearance of the application
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-black dark:text-white mb-3 block">
            Theme Mode
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ThemeCard
              icon={<FiSun />}
              label="Light"
              isSelected={theme === 'light'}
              onClick={() => handleThemeChange('light')}
            />
            <ThemeCard
              icon={<FiMoon />}
              label="Dark"
              isSelected={theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
            />
            <ThemeCard
              icon={<FiMonitor />}
              label="System"
              isSelected={theme === 'system'}
              onClick={() => handleThemeChange('system')}
            />
          </div>
        </label>

        {theme === 'system' && (
          <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20">
            <p className="text-sm text-black dark:text-white">
              <strong>System theme detected:</strong> Currently using{' '}
              <span className="font-semibold">{currentTheme}</span> mode based on your system
              preferences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
