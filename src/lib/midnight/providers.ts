// Midnight SDK providers - optional, will fail gracefully if packages unavailable
import type { MidnightProviders } from '@/types';
import config from '@/config';

export async function setupProviders(): Promise<MidnightProviders> {
  try {
    // Use dynamic imports with vite-ignore to prevent build-time resolution
    const { FetchZkConfigProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-fetch-zk-config-provider');
    const { httpClientProofProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-http-client-proof-provider');
    const { indexerPublicDataProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-indexer-public-data-provider');
    const { levelPrivateStateProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-level-private-state-provider');
    const networkIdModule: any = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-network-id');

    const zkConfigProvider = new FetchZkConfigProvider(config.midnight.rpcUrl);

    const proofProvider = httpClientProofProvider(config.midnight.rpcUrl);

    const dataProvider = indexerPublicDataProvider(
      config.midnight.indexerUrl,
      config.midnight.indexerUrl // subscriptionURL - using same URL for both
    );

    const stateProvider = await levelPrivateStateProvider();

    // Handle networkId - it might be a function, module, or value
    const networkIdValue = Number(config.midnight.networkId);
    let networkIdProvider: any = networkIdValue;
    
    // Try to use networkId if it's available and callable
    const networkIdFn = networkIdModule?.default || networkIdModule?.networkId || networkIdModule;
    if (typeof networkIdFn === 'function') {
      try {
        networkIdProvider = networkIdFn(networkIdValue);
      } catch {
        networkIdProvider = networkIdValue;
      }
    } else if (networkIdModule?.setNetworkId && typeof networkIdModule.setNetworkId === 'function') {
      networkIdModule.setNetworkId(networkIdValue);
      networkIdProvider = networkIdValue;
    }

    return {
      zkConfigProvider,
      proofProvider,
      dataProvider,
      stateProvider,
      networkId: networkIdProvider,
    };
  } catch (error) {
    console.warn('Midnight SDK providers not available:', error);
    throw new Error('Midnight SDK packages not installed. Install optional dependencies when available.');
  }
}

