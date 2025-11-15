import { useState } from 'react';
import { FiTrash2, FiRefreshCw, FiDatabase, FiAlertTriangle } from 'react-icons/fi';
import type { SettingsSectionProps } from '@/pages/Settings';
import { useDataManagement } from '@/hooks/useDataManagement';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmation } from '@/hooks/useConfirmation';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ClearDataCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  variant?: 'warning' | 'danger';
}

function ClearDataCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  variant = 'warning',
}: ClearDataCardProps) {
  const colors = {
    warning: {
      border: 'border-black/30 dark:border-white/30',
      bg: 'bg-black/5 dark:bg-white/5',
      text: 'text-black dark:text-white',
      button:
        'text-black dark:text-white border-2 border-black/30 dark:border-white/30 hover:bg-black/10 dark:hover:bg-white/10',
    },
    danger: {
      border: 'border-black/50 dark:border-white/50',
      bg: 'bg-black/10 dark:bg-white/10',
      text: 'text-black dark:text-white',
      button: 'text-white dark:text-black bg-black dark:bg-white hover:opacity-80',
    },
  };

  const style = colors[variant];

  return (
    <div className={`p-4 rounded-lg border ${style.border} ${style.bg}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`text-xl ${style.text} mt-0.5`}>{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-black dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all ${style.button}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

export function ClearDataSettings({ onChangesMade }: SettingsSectionProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const { clearVerifications, clearSettings, clearCache, clearAllData } = useDataManagement();
  const toast = useToast();
  const confirmation = useConfirmation();

  const handleClearVerifications = () => {
    confirmation.confirm(
      'Clear Verification Proofs',
      'Are you sure you want to delete all verification proofs? This action cannot be undone.',
      () => {
        clearVerifications();
        onChangesMade();
        toast.success('All verification proofs have been deleted');
      },
      'warning'
    );
  };

  const handleClearSettings = () => {
    confirmation.confirm(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults? You will need to refresh the page.',
      () => {
        clearSettings();
        onChangesMade();
        toast.info('Settings have been reset. Please refresh the page.');
      },
      'warning'
    );
  };

  const handleClearCache = () => {
    confirmation.confirm(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      () => {
        clearCache();
        onChangesMade();
        toast.success('Cache has been cleared');
      },
      'info'
    );
  };

  const handleClearAllData = async () => {
    if (confirmText !== 'DELETE ALL') {
      toast.warning('Please type "DELETE ALL" to confirm');
      return;
    }

    confirmation.confirm(
      'Delete All Data',
      'This will permanently delete ALL data including verifications, settings, and cache. This action cannot be undone!',
      async () => {
        setIsClearing(true);
        try {
          await clearAllData();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to clear data');
        } finally {
          setIsClearing(false);
        }
      },
      'danger'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Clear Data</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Delete stored data and reset application state
        </p>
      </div>

      <div className="space-y-4">
        {/* Clear Verifications */}
        <ClearDataCard
          icon={<FiTrash2 />}
          title="Clear Verification Proofs"
          description="Delete all stored verification proofs and transaction history"
          buttonText="Clear Verifications"
          onClick={handleClearVerifications}
        />

        {/* Reset Settings */}
        <ClearDataCard
          icon={<FiRefreshCw />}
          title="Reset Settings"
          description="Restore all settings to their default values"
          buttonText="Reset Settings"
          onClick={handleClearSettings}
        />

        {/* Clear Cache */}
        <ClearDataCard
          icon={<FiDatabase />}
          title="Clear Cache"
          description="Remove temporary cached data and session information"
          buttonText="Clear Cache"
          onClick={handleClearCache}
        />

        <hr className="border-black/10 dark:border-white/10" />

        {/* Clear All Data - Danger Zone */}
        <div className="p-4 rounded-lg border-2 border-black dark:border-white bg-black/10 dark:bg-white/10">
          <div className="mb-4 flex items-start gap-3">
            <FiAlertTriangle className="text-xl text-black dark:text-white mt-0.5" />
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-1">⚠️ Danger Zone</h3>
              <p className="text-sm text-black dark:text-white">
                This will permanently delete ALL data including verifications, settings, and cache.
                This action cannot be undone!
              </p>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Type <strong>DELETE ALL</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE ALL"
              className="w-full px-4 py-2 rounded-lg border-2 border-black/30 dark:border-white/30 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <button
            onClick={handleClearAllData}
            disabled={confirmText !== 'DELETE ALL' || isClearing}
            className="w-full px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearing ? 'Deleting...' : 'Delete All Data Permanently'}
          </button>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20">
          <p className="text-sm text-black dark:text-white">
            <strong>💡 Tip:</strong> Export your data before clearing to create a backup that you
            can restore later.
          </p>
        </div>
      </div>

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
