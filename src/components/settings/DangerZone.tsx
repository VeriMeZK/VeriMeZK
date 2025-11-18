import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface DangerZoneProps {
  onClearAll: () => void;
  isClearing: boolean;
}

export function DangerZone({ onClearAll, isClearing }: DangerZoneProps) {
  const [confirmText, setConfirmText] = useState('');
  const isValid = confirmText === 'DELETE ALL';

  const handleClick = () => {
    if (isValid) {
      onClearAll();
    }
  };

  return (
    <div className="p-4 rounded-lg border-2 border-black dark:border-white bg-black/10 dark:bg-white/10">
      <div className="mb-4 flex items-start gap-3">
        <FiAlertTriangle className="text-xl text-black dark:text-white mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-black dark:text-white mb-1">Danger Zone</h3>
          <p className="text-sm text-black dark:text-white">
            This will permanently delete ALL data including verifications, settings, and cache. This
            action cannot be undone!
          </p>
        </div>
      </div>

      <div className="mb-3">
        <label
          htmlFor="confirm-delete"
          className="block text-sm font-medium text-black dark:text-white mb-2"
        >
          Type <strong>DELETE ALL</strong> to confirm:
        </label>
        <input
          id="confirm-delete"
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="DELETE ALL"
          className="w-full px-4 py-2 rounded-lg border-2 border-black/30 dark:border-white/30 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          aria-describedby="confirm-delete-hint"
        />
        <p id="confirm-delete-hint" className="sr-only">
          Type DELETE ALL to enable the delete button
        </p>
      </div>

      <button
        onClick={handleClick}
        disabled={!isValid || isClearing}
        className="w-full px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-busy={isClearing}
      >
        {isClearing ? 'Deleting...' : 'Delete All Data Permanently'}
      </button>
    </div>
  );
}
