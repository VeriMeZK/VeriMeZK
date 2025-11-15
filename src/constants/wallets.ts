export interface SupportedWallet {
  name: string;
  lightColor: string;
  darkColor: string;
  lightBg: string;
  darkBg: string;
}

export const SUPPORTED_WALLETS: SupportedWallet[] = [
  {
    name: 'Nami',
    lightColor: '#1E40AF',
    darkColor: '#93C5FD',
    lightBg: '#DBEAFE',
    darkBg: '#1E3A8A',
  },
  {
    name: 'Eternl',
    lightColor: '#059669',
    darkColor: '#6EE7B7',
    lightBg: '#D1FAE5',
    darkBg: '#065F46',
  },
  {
    name: 'Flint',
    lightColor: '#7C3AED',
    darkColor: '#C4B5FD',
    lightBg: '#EDE9FE',
    darkBg: '#5B21B6',
  },
];
