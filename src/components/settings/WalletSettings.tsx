import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useWalletSettings } from '@/hooks/useWalletSettings';
import { Switch } from '@/components/ui/switch';
import { SUPPORTED_WALLETS } from '@/constants/wallets';
import type { SettingsSectionProps } from '@/pages/Settings';

interface WalletCardProps {
  name: string;
  logo: string;
  available: boolean;
}

function WalletCard({ name, logo, available }: WalletCardProps) {
  return (
    <div
      className={`relative flex items-center gap-3 p-4 rounded-lg border transition-all ${
        available
          ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
          : 'border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 opacity-60'
      }`}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-6 h-6"
          onError={e => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden text-black dark:text-white text-xs font-bold">{name[0]}</div>
      </div>
      <span className="text-sm font-medium text-black dark:text-white">{name}</span>
      {!available && (
        <span className="ml-auto px-2 py-1 text-xs font-semibold text-black dark:text-white bg-gray-200 dark:bg-gray-600 rounded-full">
          Soon
        </span>
      )}
    </div>
  );
}

export function WalletSettings({ onChangesMade }: SettingsSectionProps) {
  const { connected, name: walletName, address, disconnect } = useWalletConnection();
  const { settings, setAutoConnect } = useWalletSettings();

  const handleDisconnect = () => {
    disconnect();
    onChangesMade();
  };

  const handleAutoConnectChange = (checked: boolean) => {
    setAutoConnect(checked);
    onChangesMade();
  };

  const formatAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Wallet Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your connected wallet and preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* Connected Wallet */}
        {connected && address ? (
          <div className="p-4 rounded-lg border-2 border-black dark:border-white bg-black/5 dark:bg-white/5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-black dark:text-white mb-1">Connected Wallet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {walletName || 'Unknown Wallet'}
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold text-white dark:text-black bg-black dark:bg-white rounded-full">
                Connected
              </span>
            </div>
            <div className="p-3 rounded bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 mb-3">
              <p className="text-sm font-mono text-black dark:text-white break-all">
                {formatAddress(address)}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white border-2 border-black dark:border-white rounded-lg hover:opacity-80 transition-all"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
            <h3 className="font-semibold text-black dark:text-white mb-1">No Wallet Connected</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Connect a Cardano wallet to use VeriMeZK
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:opacity-90 transition-all"
            >
              Go to Home to Connect
            </button>
          </div>
        )}

        {/* Auto-Connect */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">
              Auto-Connect on Launch
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically connect to your wallet when opening the app
            </p>
          </div>
          <Switch
            checked={settings.autoConnect}
            onCheckedChange={handleAutoConnectChange}
            className="ml-4"
            aria-label="Toggle auto-connect on launch"
          />
        </div>

        {/* Supported Wallets */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <h3 className="font-semibold text-black dark:text-white mb-3">Supported Wallets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUPPORTED_WALLETS.map(wallet => (
              <WalletCard key={wallet.name} {...wallet} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20">
          <p className="text-sm text-black dark:text-white">
            <strong>ℹ️ Note:</strong> Your wallet is only used to sign transactions. Private keys
            never leave your wallet extension.
          </p>
        </div>
      </div>
    </div>
  );
}
