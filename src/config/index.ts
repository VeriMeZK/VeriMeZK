// Configuration loader
export const config = {
  midnight: {
    networkId: import.meta.env.VITE_MIDNIGHT_NETWORK_ID || '1',
    rpcUrl: import.meta.env.VITE_MIDNIGHT_RPC_URL || '',
    indexerUrl: import.meta.env.VITE_MIDNIGHT_INDEXER_URL || '',
  },
  cardano: {
    network: import.meta.env.VITE_CARDANO_NETWORK || 'testnet',
  },
  contract: {
    address: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'VeriMeZK',
  },
  api: {
    endpoints: import.meta.env.VITE_API_ENDPOINTS || '',
  },
};

export default config;

