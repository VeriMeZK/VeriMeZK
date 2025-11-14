import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import type { StoredVerification } from '@/types';
import { formatAddress } from '@/utils';
import config from '@/config';

interface VerificationCardProps {
  verification: StoredVerification;
  onViewDetails?: (verification: StoredVerification) => void;
}

export function VerificationCard({ verification, onViewDetails }: VerificationCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadProof = () => {
    const data = {
      id: verification.id,
      proofHash: verification.proofHash,
      clauses: verification.clauses,
      transactionHash: verification.transactionHash,
      timestamp: verification.timestamp.toISOString(),
      status: verification.status,
      claims: verification.claims,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-${verification.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getExplorerUrl = (txHash: string) => {
    // This would be configured based on the network
    const network = config.cardano.network;
    if (network === 'mainnet') {
      return `https://cardanoscan.io/transaction/${txHash}`;
    }
    return `https://testnet.cardanoscan.io/transaction/${txHash}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 border border-black/15 dark:border-white/15 hover:border-black/25 dark:hover:border-white/25 transition-all"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={verification.status} />
              <span className="text-xs text-black/60 dark:text-white/60">
                {formatDate(verification.timestamp)}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-black dark:text-white truncate">
              {verification.claims?.name || 'Identity Verification'}
            </h3>
            {verification.claims?.countryCode && (
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                Country: {verification.claims.countryCode}
              </p>
            )}
          </div>
        </div>

        {/* Proof Hash */}
        <div className="glass-light rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-black/70 dark:text-white/70">Proof Hash</p>
            <motion.button
              onClick={() => copyToClipboard(verification.proofHash, 'hash')}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Copy proof hash"
            >
              {copied === 'hash' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/60 dark:text-white/60">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </motion.button>
          </div>
          <p className="text-xs font-mono text-black dark:text-white break-all">
            {formatAddress(verification.proofHash, 12, 12)}
          </p>
        </div>

        {/* Clauses */}
        {verification.clauses.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-black/70 dark:text-white/70">Verified Claims</p>
            <div className="flex flex-wrap gap-1.5">
              {verification.clauses.slice(0, expanded ? undefined : 3).map((clause, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 text-xs rounded bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 border border-black/10 dark:border-white/10"
                >
                  {clause}
                </span>
              ))}
              {verification.clauses.length > 3 && (
                <motion.button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white underline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {expanded ? 'Show less' : `+${verification.clauses.length - 3} more`}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Transaction Hash (if available) */}
        <AnimatePresence>
          {verification.transactionHash && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-light rounded-lg p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-black/70 dark:text-white/70">Transaction Hash</p>
                <div className="flex items-center gap-1">
                  <motion.a
                    href={getExplorerUrl(verification.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="View on explorer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/60 dark:text-white/60">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </motion.a>
                  <motion.button
                    onClick={() => copyToClipboard(verification.transactionHash!, 'tx')}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Copy transaction hash"
                  >
                    {copied === 'tx' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/60 dark:text-white/60">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </motion.button>
                </div>
              </div>
              <p className="text-xs font-mono text-black dark:text-white break-all">
                {formatAddress(verification.transactionHash, 12, 12)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10">
          <motion.button
            onClick={downloadProof}
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg glass-light border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-black dark:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Download JSON
          </motion.button>
          {onViewDetails && (
            <motion.button
              onClick={() => onViewDetails(verification)}
              className="px-3 py-2 text-xs font-medium rounded-lg glass-light border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-black dark:text-white transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Details
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

