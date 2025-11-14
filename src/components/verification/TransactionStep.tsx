import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { TransactionSigner } from '@/components/proof/TransactionSigner';
import { useVerification } from '@/contexts/VerificationContext';

interface TransactionStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function TransactionStep({ onComplete, onBack }: TransactionStepProps) {
  const { state } = useVerification();
  const [transactionComplete, setTransactionComplete] = useState(false);

  // Check if transaction was submitted (you'll need to add this state to your context)
  useEffect(() => {
    // This would check if transaction hash exists
    if (state.proofResult?.success && state.proofResult.transactionHash) {
      setTransactionComplete(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [state.proofResult, onComplete]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Step 6: Submit to Blockchain
        </h2>
        <p className="text-black/70 dark:text-white/70">
          Sign and submit your verification proof on-chain
        </p>
      </div>

      <TransactionSigner />

      {transactionComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-semibold">Transaction submitted successfully!</span>
          </div>
        </motion.div>
      )}

      {!transactionComplete && (
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="secondary"
            className="flex-1"
          >
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

