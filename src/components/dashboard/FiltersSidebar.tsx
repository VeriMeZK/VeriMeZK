import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VerificationStatus } from '@/types';

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status?: VerificationStatus;
    dateFrom?: Date;
    dateTo?: Date;
    searchQuery: string;
  };
  onFiltersChange: (filters: {
    status?: VerificationStatus;
    dateFrom?: Date;
    dateTo?: Date;
    searchQuery: string;
  }) => void;
}

export function FiltersSidebar({ isOpen, onClose, filters, onFiltersChange }: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleStatusChange = (status: VerificationStatus | undefined) => {
    const newFilters = { ...localFilters, status };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    const newFilters = { ...localFilters, dateFrom: date };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    const newFilters = { ...localFilters, dateTo: date };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      searchQuery: localFilters.searchQuery,
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 glass-modal border-r border-black/20 dark:border-white/20 z-50 overflow-y-auto safe-area-top"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black dark:text-white">Filters</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-black dark:text-white">Status</h3>
                <div className="space-y-2">
                  {(['verified', 'pending', 'expired'] as VerificationStatus[]).map((status) => (
                    <motion.button
                      key={status}
                      onClick={() => handleStatusChange(localFilters.status === status ? undefined : status)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        localFilters.status === status
                          ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                          : 'glass-light border border-black/10 dark:border-white/10 text-black dark:text-white hover:border-black/20 dark:hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-black dark:text-white">Date Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-black/70 dark:text-white/70 mb-1.5">From</label>
                    <input
                      type="date"
                      value={formatDateForInput(localFilters.dateFrom)}
                      onChange={handleDateFromChange}
                      className="w-full px-3 py-2 rounded-lg glass-light border border-black/10 dark:border-white/10 text-black dark:text-white text-sm focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-black/70 dark:text-white/70 mb-1.5">To</label>
                    <input
                      type="date"
                      value={formatDateForInput(localFilters.dateTo)}
                      onChange={handleDateToChange}
                      className="w-full px-3 py-2 rounded-lg glass-light border border-black/10 dark:border-white/10 text-black dark:text-white text-sm focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(localFilters.status || localFilters.dateFrom || localFilters.dateTo) && (
                <motion.button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 rounded-lg glass-light border border-black/20 dark:border-white/20 text-black dark:text-white hover:border-black/40 dark:hover:border-white/40 transition-all text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

