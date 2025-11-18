import { FiTrash2, FiRefreshCw, FiDatabase } from 'react-icons/fi';

export const CLEAR_DATA_OPTIONS = [
  {
    id: 'verifications',
    icon: FiTrash2,
    title: 'Clear Verification Proofs',
    description: 'Delete all stored verification proofs and transaction history',
    buttonText: 'Clear Verifications',
  },
  {
    id: 'settings',
    icon: FiRefreshCw,
    title: 'Reset Settings',
    description: 'Restore all settings to their default values',
    buttonText: 'Reset Settings',
  },
  {
    id: 'cache',
    icon: FiDatabase,
    title: 'Clear Cache',
    description: 'Remove temporary cached data and session information',
    buttonText: 'Clear Cache',
  },
] as const;

export type ClearDataOptionId = (typeof CLEAR_DATA_OPTIONS)[number]['id'];
