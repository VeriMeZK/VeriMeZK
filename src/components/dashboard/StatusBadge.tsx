import React from 'react';
import { motion } from 'framer-motion';
import type { VerificationStatus } from '@/types';

interface StatusBadgeProps {
  status: VerificationStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    verified: {
      label: 'Verified',
      bg: 'bg-green-500/10 dark:bg-green-400/10',
      border: 'border-green-500/30 dark:border-green-400/30',
      text: 'text-green-700 dark:text-green-400',
      dot: 'bg-green-500 dark:bg-green-400',
    },
    pending: {
      label: 'Pending',
      bg: 'bg-yellow-500/10 dark:bg-yellow-400/10',
      border: 'border-yellow-500/30 dark:border-yellow-400/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      dot: 'bg-yellow-500 dark:bg-yellow-400',
    },
    expired: {
      label: 'Expired',
      bg: 'bg-red-500/10 dark:bg-red-400/10',
      border: 'border-red-500/30 dark:border-red-400/30',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500 dark:bg-red-400',
    },
  };

  const config = statusConfig[status];

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </motion.span>
  );
}

