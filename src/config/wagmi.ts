import { createConfig, http, fallback } from 'wagmi';
import { defineChain } from 'viem';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// WalletConnect Cloud Project ID — ganti dengan ID Anda dari https://cloud.reown.com
// ID publik (aman di-bundle ke frontend).
export const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'a8e1e5e4f0a3a4b6c7d8e9f0a1b2c3d4';

const PRIMARY_RPC = 'https://testnet-rpc.iopn.tech';
const BACKUP_RPC = 'https://testnet-rpc2.iopn.tech';

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
    default: { http: [PRIMARY_RPC, BACKUP_RPC] },
    public: { http: [PRIMARY_RPC, BACKUP_RPC] },
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
    [opnTestnet.id]: fallback([
      http(PRIMARY_RPC, { retryCount: 1, retryDelay: 250 }),
      http(BACKUP_RPC, { retryCount: 1, retryDelay: 250 }),
    ]),
  },
});
