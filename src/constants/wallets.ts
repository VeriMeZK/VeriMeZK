export interface SupportedWallet {
  name: string;
  logo: string;
  available: boolean;
}

export const SUPPORTED_WALLETS: SupportedWallet[] = [
  {
    name: 'Lace',
    logo: 'https://www.lace.io/lace-logo.svg',
    available: true,
  },
  {
    name: 'Nami',
    logo: 'https://namiwallet.io/logo.svg',
    available: false,
  },
  {
    name: 'Eternl',
    logo: 'https://eternl.io/logo.svg',
    available: false,
  },
  {
    name: 'Flint',
    logo: 'https://flint-wallet.com/logo.svg',
    available: false,
  },
];
