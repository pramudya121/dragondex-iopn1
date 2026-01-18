import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, walletConnect } from 'wagmi/connectors';

// Define OPN Testnet chain
export const opnTestnet = defineChain({
  id: 984,
  name: 'OPN Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OPN',
    symbol: 'OPN',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.iopn.tech'] },
  },
  blockExplorers: {
    default: { name: 'OPN Explorer', url: 'https://testnet.iopn.tech' },
  },
  testnet: true,
});

// Wagmi configuration
export const config = createConfig({
  chains: [opnTestnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    injected({
      target: {
        id: 'okxWallet',
        name: 'OKX Wallet',
        provider: (window: any) => window.okxwallet,
      },
    }),
    injected({
      target: {
        id: 'rabby',
        name: 'Rabby Wallet',
        provider: (window: any) => window.rabby,
      },
    }),
    injected({
      target: {
        id: 'bitget',
        name: 'Bitget Wallet',
        provider: (window: any) => window.bitkeep?.ethereum,
      },
    }),
  ],
  transports: {
    [opnTestnet.id]: http('https://testnet-rpc.iopn.tech'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
