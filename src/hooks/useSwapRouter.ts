import { useMemo } from 'react';
import { useReadContracts, useReadContract } from 'wagmi';
import { CONTRACTS, TOKEN_LIST } from '@/config/contracts';
import { FACTORY_ABI, ROUTER_ABI } from '@/config/abis';

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

// Common intermediate tokens for multi-hop routing
const BRIDGE_TOKENS: `0x${string}`[] = [
  CONTRACTS.WETH as `0x${string}`,   // WOPN - most liquid
  CONTRACTS.DRAGON as `0x${string}`, // DRAGON
  CONTRACTS.BNB as `0x${string}`,    // BNB
  CONTRACTS.ETH as `0x${string}`,    // ETH
];

export interface SwapRoute {
  path: `0x${string}`[];
  pathSymbols: string[];
  hops: number;
}

/**
 * Hook to find all possible routes between two tokens.
 * Checks direct pair first, then tries 1-hop through bridge tokens.
 */
export function useFindRoutes(
  fromAddr: `0x${string}` | undefined,
  toAddr: `0x${string}` | undefined
) {
  // Build list of candidate pairs to check
  const candidatePairs = useMemo(() => {
    if (!fromAddr || !toAddr) return [];
    const pairs: { tokenA: `0x${string}`; tokenB: `0x${string}`; label: string }[] = [];

    // Direct pair
    pairs.push({ tokenA: fromAddr, tokenB: toAddr, label: 'direct' });

    // 1-hop through each bridge token
    for (const bridge of BRIDGE_TOKENS) {
      if (bridge.toLowerCase() === fromAddr.toLowerCase() || bridge.toLowerCase() === toAddr.toLowerCase()) continue;
      pairs.push({ tokenA: fromAddr, tokenB: bridge, label: `hop-${bridge}-A` });
      pairs.push({ tokenA: bridge, tokenB: toAddr, label: `hop-${bridge}-B` });
    }

    return pairs;
  }, [fromAddr, toAddr]);

  // Batch getPair calls
  const { data: pairResults, isLoading } = useReadContracts({
    contracts: candidatePairs.map(p => ({
      address: CONTRACTS.FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getPair',
      args: [p.tokenA, p.tokenB],
    })),
    query: { enabled: candidatePairs.length > 0 },
  });

  const routes = useMemo((): SwapRoute[] => {
    if (!fromAddr || !toAddr || !pairResults) return [];

    const found: SwapRoute[] = [];
    const getSymbol = (addr: string) => {
      const t = TOKEN_LIST.find(t => {
        const tAddr = t.isNative ? CONTRACTS.WETH : t.address;
        return tAddr.toLowerCase() === addr.toLowerCase();
      });
      return t?.symbol || addr.slice(0, 6);
    };

    // Check direct pair (index 0)
    const directPair = pairResults[0]?.result as `0x${string}` | undefined;
    if (directPair && directPair !== ZERO_ADDR) {
      found.push({
        path: [fromAddr, toAddr],
        pathSymbols: [getSymbol(fromAddr), getSymbol(toAddr)],
        hops: 1,
      });
    }

    // Check bridge routes (indices 1+, in pairs of 2)
    const bridgesFiltered = BRIDGE_TOKENS.filter(
      b => b.toLowerCase() !== fromAddr.toLowerCase() && b.toLowerCase() !== toAddr.toLowerCase()
    );

    for (let i = 0; i < bridgesFiltered.length; i++) {
      const idxA = 1 + i * 2;
      const idxB = 2 + i * 2;
      const pairA = pairResults[idxA]?.result as `0x${string}` | undefined;
      const pairB = pairResults[idxB]?.result as `0x${string}` | undefined;

      if (pairA && pairA !== ZERO_ADDR && pairB && pairB !== ZERO_ADDR) {
        const bridge = bridgesFiltered[i];
        found.push({
          path: [fromAddr, bridge, toAddr],
          pathSymbols: [getSymbol(fromAddr), getSymbol(bridge), getSymbol(toAddr)],
          hops: 2,
        });
      }
    }

    return found;
  }, [fromAddr, toAddr, pairResults]);

  return { routes, isLoading };
}

/**
 * Hook to find the best route with highest output for a given input amount.
 * Uses getAmountsOut for each candidate route.
 */
export function useBestRoute(
  fromAddr: `0x${string}` | undefined,
  toAddr: `0x${string}` | undefined,
  amountIn: bigint | undefined
) {
  const { routes, isLoading: isRoutesLoading } = useFindRoutes(fromAddr, toAddr);

  // Get quotes for all routes
  const { data: quoteResults, isLoading: isQuoting } = useReadContracts({
    contracts: routes.map(route => ({
      address: CONTRACTS.ROUTER as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [amountIn!, route.path],
    })),
    query: { enabled: routes.length > 0 && !!amountIn && amountIn > 0n },
  });

  const bestRoute = useMemo(() => {
    if (!quoteResults || routes.length === 0) return null;

    let best: { route: SwapRoute; amountsOut: bigint[]; outputAmount: bigint } | null = null;

    for (let i = 0; i < routes.length; i++) {
      const result = quoteResults[i];
      if (result.status !== 'success' || !result.result) continue;

      const amounts = result.result as bigint[];
      const output = amounts[amounts.length - 1];

      if (!best || output > best.outputAmount) {
        best = { route: routes[i], amountsOut: amounts, outputAmount: output };
      }
    }

    return best;
  }, [routes, quoteResults]);

  return {
    bestRoute,
    allRoutes: routes,
    isLoading: isRoutesLoading || isQuoting,
    hasRoute: routes.length > 0,
  };
}
