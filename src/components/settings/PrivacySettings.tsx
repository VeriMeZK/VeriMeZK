import type { SettingsSectionProps } from '@/pages/Settings';
import { SettingsCard } from './SettingsCard';
import { Switch } from '@/components/ui/switch';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

export function PrivacySettings({ onChangesMade }: SettingsSectionProps) {
  const { settings, toggleSetting, updateAutoDelete } = usePrivacySettings();

  const handleToggle = (key: keyof typeof settings) => {
    toggleSetting(key);
    onChangesMade();
  };

  const handleAutoDeleteChange = (value: string) => {
    updateAutoDelete(value);
    onChangesMade();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Privacy & Data</h2>
        <p className="text-gray-600 dark:text-gray-400">Control how your data is stored and used</p>
      </div>

      <div className="space-y-4">
        {/* Save Verifications */}
        <SettingsCard
          title="Save Verification History"
          description="Store your verification proofs locally for quick access"
        >
          <div className="flex items-center justify-end">
            <Switch
              checked={settings.saveVerifications}
              onCheckedChange={() => handleToggle('saveVerifications')}
            />
          </div>
        </SettingsCard>

        {/* Save Biometrics */}
        <SettingsCard
          title="Cache Biometric Data"
          description="Temporarily store face data for faster re-verification (encrypted)"
        >
          <div className="flex items-center justify-end">
            <Switch
              checked={settings.saveBiometrics}
              onCheckedChange={() => handleToggle('saveBiometrics')}
            />
          </div>
        </SettingsCard>

        {/* Share Analytics */}
        <SettingsCard
          title="Anonymous Usage Analytics"
          description="Help improve the app by sharing anonymous usage data"
        >
          <div className="flex items-center justify-end">
            <Switch
              checked={settings.shareAnalytics}
              onCheckedChange={() => handleToggle('shareAnalytics')}
            />
          </div>
        </SettingsCard>

        {/* Auto Delete */}
        <SettingsCard title="Auto-Delete Old Data">
          <select
            value={settings.autoDeleteAfter}
            onChange={e => handleAutoDeleteChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <option value="7">After 7 days</option>
            <option value="30">After 30 days</option>
            <option value="90">After 90 days</option>
            <option value="never">Never</option>
          </select>
        </SettingsCard>

        {/* Privacy Notice */}
        <SettingsCard variant="info" title="Privacy First">
          <p className="text-sm text-black dark:text-white">
            All verification processing happens locally on your device. Your biometric data never
            leaves your browser.
          </p>
        </SettingsCard>
      </div>
    </div>
  );
}
