import type { SettingsSectionProps } from '@/pages/Settings';
import { SettingsCard } from './SettingsCard';
import { Switch } from '@/components/ui/switch';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

export function NotificationSettings({ onChangesMade }: SettingsSectionProps) {
  const { settings, toggleSetting, requestDesktopNotifications } = useNotificationSettings();

  const handleToggle = (key: keyof typeof settings) => {
    toggleSetting(key);
    onChangesMade();
  };

  const handleRequestNotifications = async () => {
    const granted = await requestDesktopNotifications();
    if (granted) {
      onChangesMade();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Notifications</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage notification preferences and alerts
        </p>
      </div>

      <div className="space-y-4">
        <SettingsCard
          title="Verification Complete"
          description="Get notified when verification proof is generated"
        >
          <div className="flex justify-end">
            <Switch
              checked={settings.verificationComplete}
              onCheckedChange={() => handleToggle('verificationComplete')}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Document Expiry Warnings"
          description="Alert me when my document is about to expire"
        >
          <div className="flex justify-end">
            <Switch
              checked={settings.expiryWarnings}
              onCheckedChange={() => handleToggle('expiryWarnings')}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Transaction Updates"
          description="Notify me about blockchain transaction status"
        >
          <div className="flex justify-end">
            <Switch
              checked={settings.transactionUpdates}
              onCheckedChange={() => handleToggle('transactionUpdates')}
            />
          </div>
        </SettingsCard>

        <SettingsCard title="System Alerts" description="Important updates and security notices">
          <div className="flex justify-end">
            <Switch
              checked={settings.systemAlerts}
              onCheckedChange={() => handleToggle('systemAlerts')}
            />
          </div>
        </SettingsCard>

        <hr className="border-black/10 dark:border-white/10" />

        <SettingsCard title="Sound Effects" description="Play sounds for notifications">
          <div className="flex justify-end">
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={() => handleToggle('soundEnabled')}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Desktop Notifications"
          description="Show system notifications outside the browser"
        >
          <div className="flex justify-end">
            <button
              onClick={handleRequestNotifications}
              className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              {settings.desktopNotifications ? 'Enabled' : 'Enable'}
            </button>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
