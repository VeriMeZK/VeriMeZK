import { useCallback } from 'react';
import { useDataManagement } from '@/hooks/useDataManagement';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmation } from '@/hooks/useConfirmation';

export function useClearDataActions(onChangesMade: () => void) {
  const { clearVerifications, clearSettings, clearCache, clearAllData } = useDataManagement();
  const toast = useToast();
  const confirmation = useConfirmation();

  const handleClearVerifications = useCallback(() => {
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
  }, [confirmation, clearVerifications, onChangesMade, toast]);

  const handleClearSettings = useCallback(() => {
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
  }, [confirmation, clearSettings, onChangesMade, toast]);

  const handleClearCache = useCallback(() => {
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
  }, [confirmation, clearCache, onChangesMade, toast]);

  const handleClearAllData = useCallback(
    async (setIsClearing: (clearing: boolean) => void) => {
      confirmation.confirm(
        'Delete All Data',
        'This will permanently delete ALL data including verifications, settings, and cache. This action cannot be undone!',
        async () => {
          setIsClearing(true);
          try {
            await clearAllData();
            toast.success('All data has been permanently deleted');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to clear data');
          } finally {
            setIsClearing(false);
          }
        },
        'danger'
      );
    },
    [confirmation, clearAllData, toast]
  );

  return {
    handleClearVerifications,
    handleClearSettings,
    handleClearCache,
    handleClearAllData,
    confirmation,
  };
}
