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
  FACTORY: '0x266174ba738E757AA82398E7b0dd3D7840ed6232',
  ROUTER: '0x51d4756EA62680eF8cC570856eE4d0E97Ab94571',
  WETH: '0x5D34a1b5c9753ED978939f9CAd3635A439B41898', // WOPN
  LIBRARY: '0xeC697968edC511cF6f9436eD65c08897bb568Eb7',
  MULTICALL: '0x02BC332F37c6B7C0c170624d8E74e9D90c952A66',
} as const;

// Token Addresses
export const TOKENS = {
  WOPN: '0x5D34a1b5c9753ED978939f9CAd3635A439B41898',
  BNB: '0x0800e7438013A0ffEf305B0977760Ed7FfEEfa84',
  MON: '0x4D4C72C6f83A8ec651e4b1a5A825EAE15503DBaF',
  HYPE: '0xBcfc4eC8E155c238501F0ca8DDfa0E33231eC87c',
  ETH: '0x4b160BC86837898cc462fb6BA6e45cBC0f4BcDB5',
  DRAGON: '0xFF3191bEE1640610CFA5338430f7F07CC9f5E1FF',
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
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/33498.png',
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
