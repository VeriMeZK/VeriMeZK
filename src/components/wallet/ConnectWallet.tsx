import React from 'react';
import { CardanoWallet } from '@meshsdk/react';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useVerification } from '@/contexts/VerificationContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { motion } from 'framer-motion';

export function ConnectWallet() {
  const { connected, name, address, lovelace, isReady, disconnect } = useWalletConnection();
  const { setWalletInfo } = useVerification();

  const handleConnected = (walletName: string) => {
    // Wallet connection is handled by MeshJS
    // We'll update context when address is available
  };

  React.useEffect(() => {
    if (connected && address && name) {
      setWalletInfo(address, name);
    }
  }, [connected, address, name, setWalletInfo]);

  if (connected && address) {
    return (
      <Card>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black dark:text-white">Wallet Connected</h2>
            <Button variant="secondary" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Wallet</p>
              <p className="text-lg font-semibold text-black dark:text-white">{name}</p>
            </div>
            
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Address</p>
              <p className="text-sm font-mono text-black dark:text-white break-all">
                {address.slice(0, 20)}...{address.slice(-20)}
              </p>
            </div>
            
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Balance</p>
              <p className="text-lg font-semibold text-black dark:text-white">
                {lovelace ? (Number(lovelace) / 1000000).toFixed(2) : '0.00'} ADA
              </p>
            </div>
          </div>

          {isReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4"
            >
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                ✓ Ready to proceed with verification
              </p>
            </motion.div>
          )}
        </motion.div>
      </Card>
    );
  }

  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-black dark:text-white text-center">
          Connect Your Wallet
        </h2>
        <p className="text-black/70 dark:text-white/70 text-center">
          Connect your Cardano wallet to begin identity verification
        </p>
        <div className="flex justify-center">
          <CardanoWallet
            label="Connect Wallet"
            persist={true}
            onConnected={handleConnected}
            isDark={true}
          />
        </div>
      </motion.div>
    </Card>
  );
}

