import { useState } from 'react';
import type { SettingsSectionProps } from '@/pages/Settings';
import { useDataManagement } from '@/hooks/useDataManagement';
import { useToast } from '@/contexts/ToastContext';

export function ExportImportSettings({ onChangesMade }: SettingsSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { exportData, importData } = useDataManagement();
  const toast = useToast();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportData();
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importData(file);
      onChangesMade();
      toast.success('Data imported successfully! Please refresh the page.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Export & Import</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Backup and restore your verification data and settings
        </p>
      </div>

      <div className="space-y-4">
        {/* Export Data */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white mb-1">Export Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download all your verification proofs and settings as a JSON file
              </p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exporting...' : '📥 Export All Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Import Data */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white mb-1">Import Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Restore your data from a previously exported backup file
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="hidden"
                />
                <span className="cursor-pointer px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:opacity-90 transition-all inline-block">
                  {isImporting ? 'Importing...' : '📤 Import Data'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border-2 border-black/30 dark:border-white/30">
          <p className="text-sm text-black dark:text-white">
            <strong>⚠️ Important:</strong> Import will merge with existing data. To completely
            replace your data, clear all data first, then import.
          </p>
        </div>

        {/* What's Included */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <h3 className="font-semibold text-black dark:text-white mb-3">
            What's Included in Backups
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-black dark:text-white font-bold">✓</span>
              Verification proofs and transaction history
            </li>
            <li className="flex items-center gap-2">
              <span className="text-black dark:text-white font-bold">✓</span>
              Theme and language preferences
            </li>
            <li className="flex items-center gap-2">
              <span className="text-black dark:text-white font-bold">✓</span>
              Privacy and notification settings
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500 font-bold">✗</span>
              Wallet private keys (never stored)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500 font-bold">✗</span>
              Biometric data (never stored)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
