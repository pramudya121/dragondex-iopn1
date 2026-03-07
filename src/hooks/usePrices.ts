import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS, TOKEN_LIST, TokenInfo } from '@/config/contracts';
import { PAIR_ABI, FACTORY_ABI } from '@/config/abis';
import { formatUnits } from 'viem';

// Default prices for OPN Testnet tokens (simulated - would use oracles in production)
export const BASE_PRICES: Record<string, number> = {
  OPN: 1.0,
  WOPN: 1.0,
  DRAGON: 0.25,
  BNB: 580.0,
  ETH: 3200.0,
  MON: 2.5,
  HYPE: 15.0,
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Hook to get token prices based on pool reserves
export function useTokenPrices() {
  // Get WOPN pairs to derive prices
  const wopnPairs = TOKEN_LIST.filter((t) => !t.isNative && t.symbol !== 'WOPN');

  const pairQueries = useReadContracts({
    contracts: wopnPairs.map((token) => ({
      address: CONTRACTS.FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getPair',
      args: [CONTRACTS.WETH as `0x${string}`, token.address as `0x${string}`],
    })),
  });

  const pairTargets = useMemo(() => {
    return wopnPairs
      .map((token, index) => ({
        token,
        pairAddress: pairQueries.data?.[index]?.result as `0x${string}` | undefined,
      }))
      .filter(
        ({ pairAddress }) =>
          !!pairAddress && pairAddress.toLowerCase() !== ZERO_ADDRESS
      ) as { token: (typeof wopnPairs)[number]; pairAddress: `0x${string}` }[];
  }, [wopnPairs, pairQueries.data]);

  const reserveQueries = useReadContracts({
    contracts: pairTargets.flatMap(({ pairAddress }) => [
      { address: pairAddress, abi: PAIR_ABI, functionName: 'getReserves' },
      { address: pairAddress, abi: PAIR_ABI, functionName: 'token0' },
    ]),
    query: { enabled: pairTargets.length > 0 },
  });

  const prices = useMemo(() => {
    const priceMap: Record<string, number> = { ...BASE_PRICES };

    if (!reserveQueries.data) return priceMap;

    for (let i = 0; i < pairTargets.length; i++) {
      const reserves = reserveQueries.data[i * 2]?.result as [bigint, bigint, number] | undefined;
      const token0Addr = reserveQueries.data[i * 2 + 1]?.result as `0x${string}` | undefined;

      if (!reserves || !token0Addr || reserves[0] === 0n || reserves[1] === 0n) continue;

      const { token } = pairTargets[i];
      const isToken0Wopn = token0Addr.toLowerCase() === CONTRACTS.WETH.toLowerCase();

      const wopnReserve = parseFloat(formatUnits(isToken0Wopn ? reserves[0] : reserves[1], 18));
      const tokenReserve = parseFloat(formatUnits(isToken0Wopn ? reserves[1] : reserves[0], token.decimals));

      if (tokenReserve > 0) {
        // Price in WOPN terms (WOPN = $1)
        priceMap[token.symbol] = wopnReserve / tokenReserve;
      }
    }

    return priceMap;
  }, [reserveQueries.data, pairTargets]);

  return {
    prices,
    getPrice: (symbol: string) => prices[symbol] || 0,
    isLoading: pairQueries.isLoading || reserveQueries.isLoading,
  };
}

// Hook to calculate price impact for a swap
// Uses token0 address to correctly order reserves
export function usePriceImpact(
  fromToken: TokenInfo | null,
  toToken: TokenInfo | null,
  fromAmount: string,
  toAmount: string,
  reserves?: [bigint, bigint],
  token0Address?: string
) {
  return useMemo(() => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      return { priceImpact: 0, severity: 'low' as const };
    }

    const inputAmount = parseFloat(fromAmount);
    const outputAmount = parseFloat(toAmount);

    if (inputAmount === 0 || outputAmount === 0) {
      return { priceImpact: 0, severity: 'low' as const };
    }

    // If we have reserves AND token0 address, calculate actual price impact
    if (reserves && reserves[0] > 0n && reserves[1] > 0n && token0Address) {
      const fromAddr = (fromToken.isNative ? CONTRACTS.WETH : fromToken.address).toLowerCase();
      const isFromToken0 = token0Address.toLowerCase() === fromAddr;

      const reserveIn = parseFloat(formatUnits(
        isFromToken0 ? reserves[0] : reserves[1], fromToken.decimals
      ));
      const reserveOut = parseFloat(formatUnits(
        isFromToken0 ? reserves[1] : reserves[0], toToken.decimals
      ));

      if (reserveIn <= 0 || reserveOut <= 0) {
        return { priceImpact: 0, severity: 'low' as const };
      }

      // Spot price before trade
      const spotPrice = reserveOut / reserveIn;

      // Actual execution price
      const executionPrice = outputAmount / inputAmount;

      // Price impact = (spotPrice - executionPrice) / spotPrice * 100
      const impact = Math.abs((spotPrice - executionPrice) / spotPrice * 100);

      // Cap at 100% to avoid nonsensical display
      const cappedImpact = Math.min(impact, 99.99);

      return {
        priceImpact: cappedImpact,
        severity: cappedImpact > 10 ? 'high' as const : cappedImpact > 3 ? 'medium' as const : 'low' as const,
      };
    }

    // Fallback: estimate from constant-product AMM formula
    // price_impact ≈ inputAmount / (reserveIn + inputAmount) — but without reserves, use a small estimate
    const estimatedImpact = Math.min(inputAmount * 0.1, 15);

    return {
      priceImpact: estimatedImpact,
      severity: estimatedImpact > 10 ? 'high' as const : estimatedImpact > 3 ? 'medium' as const : 'low' as const,
    };
  }, [fromToken, toToken, fromAmount, toAmount, reserves, token0Address]);
}

// Hook to calculate TVL for a pool
export function usePoolTVL(
  token0Symbol: string,
  token1Symbol: string,
  reserve0: bigint,
  reserve1: bigint,
  token0Decimals: number = 18,
  token1Decimals: number = 18,
  prices: Record<string, number>
) {
  return useMemo(() => {
    const price0 = prices[token0Symbol] || 0;
    const price1 = prices[token1Symbol] || 0;

    const value0 = parseFloat(formatUnits(reserve0, token0Decimals)) * price0;
    const value1 = parseFloat(formatUnits(reserve1, token1Decimals)) * price1;

    return value0 + value1;
  }, [token0Symbol, token1Symbol, reserve0, reserve1, token0Decimals, token1Decimals, prices]);
}
