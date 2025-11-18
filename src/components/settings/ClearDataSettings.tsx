import { useState } from 'react';
import type { SettingsSectionProps } from '@/constants/settings';
import { useClearDataActions } from '@/hooks/useClearDataActions';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ClearDataCard } from './ClearDataCard';
import { DangerZone } from './DangerZone';
import { InfoTip } from './InfoTip';
import { CLEAR_DATA_OPTIONS } from '@/constants/clearData';

export function ClearDataSettings({ onChangesMade }: SettingsSectionProps) {
  const [isClearing, setIsClearing] = useState(false);
  const {
    handleClearVerifications,
    handleClearSettings,
    handleClearCache,
    handleClearAllData,
    confirmation,
  } = useClearDataActions(onChangesMade);

  const actionHandlers = {
    verifications: handleClearVerifications,
    settings: handleClearSettings,
    cache: handleClearCache,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Clear Data</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Delete stored data and reset application state
        </p>
      </header>

      <div className="space-y-4">
        {/* Clear Data Options */}
        {CLEAR_DATA_OPTIONS.map(option => {
          const IconComponent = option.icon;
          return (
            <ClearDataCard
              key={option.id}
              icon={<IconComponent />}
              title={option.title}
              description={option.description}
              buttonText={option.buttonText}
              onClick={actionHandlers[option.id]}
            />
          );
        })}

        <hr className="border-black/10 dark:border-white/10" />

        {/* Danger Zone */}
        <DangerZone onClearAll={() => handleClearAllData(setIsClearing)} isClearing={isClearing} />

        {/* Info Tip */}
        <InfoTip />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        variant={confirmation.variant}
      />
    </div>
  );
}
