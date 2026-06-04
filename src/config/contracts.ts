// DRAGONDEX Smart Contract Configuration for OPN Testnet

export const OPN_TESTNET = {
  id: 984,
  name: 'OPN Testnet',
  nativeCurrency: {
    name: 'OPN',
    symbol: 'OPN',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.iopn.tech'] },
    public: { http: ['https://testnet-rpc.iopn.tech'] },
  },
  blockExplorers: {
    default: { name: 'OPN Explorer', url: 'https://testnet.iopn.tech' },
  },
  testnet: true,
} as const;

// Contract Addresses
export const CONTRACTS = {
  FACTORY: '0x887AE7FfCB54f5811d957f3EA8095b15Bd99e538',
  ROUTER: '0x048A65f2f52F1c1A0a1fC59E67Ac95daA361AA89',
  WETH: '0xd38b2Cd5D8d68E6EA75f9aD9bC01F9e168d4b5E1', // WOPN
  LIBRARY: '0x2C9bd07a8885Fdd93f5426DB6C250a9adfcEe2C7',
  MULTICALL: '0xb27c21B35d6fF3Fc55e826ef6714AF76a82c5E71',
  // Token addresses
  DRAGON: '0x76c8BF103D0548dC171EC9675bCc327f20f35A42',
  BNB: '0x542ed1D0572428f6aCC16852bFd9a4AD8e90A7b6',
  ETH: '0x769511B4237AE00Af2bbF77a339eC71CACe0e08B',
  MON: '0xbC7aa080ECe100522E5d2b396d0C31b39cEEa87b',
  HYPE: '0x45B14877a0A640f94a09C1Ab4445DEb000f7Aff7',
} as const;

// Token Addresses
export const TOKENS = {
  WOPN: '0xd38b2Cd5D8d68E6EA75f9aD9bC01F9e168d4b5E1',
  BNB: '0x542ed1D0572428f6aCC16852bFd9a4AD8e90A7b6',
  MON: '0xbC7aa080ECe100522E5d2b396d0C31b39cEEa87b',
  HYPE: '0x45B14877a0A640f94a09C1Ab4445DEb000f7Aff7',
  ETH: '0x769511B4237AE00Af2bbF77a339eC71CACe0e08B',
  DRAGON: '0x76c8BF103D0548dC171EC9675bCc327f20f35A42',
} as const;

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  isNative?: boolean;
}

export const TOKEN_LIST: TokenInfo[] = [
  {
    address: 'native',
    symbol: 'OPN',
    name: 'OPN',
    decimals: 18,
    logoURI: '/tokens/opn.jpg',
    isNative: true,
  },
  {
    address: TOKENS.WOPN,
    symbol: 'WOPN',
    name: 'Wrapped OPN',
    decimals: 18,
    logoURI: '/tokens/opn.jpg',
  },
  {
    address: TOKENS.DRAGON,
    symbol: 'DRAGON',
    name: 'Dragon Token',
    decimals: 18,
    logoURI: '/tokens/dragon.png',
  },
  {
    address: TOKENS.BNB,
    symbol: 'BNB',
    name: 'Binance Coin',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
  },
  {
    address: TOKENS.ETH,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  },
  {
    address: TOKENS.MON,
    symbol: 'MON',
    name: 'Monad',
    decimals: 18,
    logoURI: '/tokens/mon.jpg',
  },
  {
    address: TOKENS.HYPE,
    symbol: 'HYPE',
    name: 'Hyperliquid',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png',
  },
];

export const getTokenByAddress = (address: string): TokenInfo | undefined => {
  return TOKEN_LIST.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
};

export const getTokenBySymbol = (symbol: string): TokenInfo | undefined => {
  return TOKEN_LIST.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
};
