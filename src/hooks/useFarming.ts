/**
 * Farming/Staking hooks for DragonDEX
 * Currently uses simulated reward data — ready to connect to MasterChef contract
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { PAIR_ABI, FACTORY_ABI } from '@/config/abis';
import { CONTRACTS, TOKEN_LIST, getTokenByAddress } from '@/config/contracts';
import { formatUnits } from 'viem';

export interface FarmPool {
  id: string;
  pairAddress: `0x${string}`;
  token0: { address: string; symbol: string; logoURI: string };
  token1: { address: string; symbol: string; logoURI: string };
  lpBalance: bigint;
  lpBalanceFormatted: string;
  totalStaked: string;
  apr: number;
  rewardToken: string;
  dailyReward: string;
  multiplier: string;
  tvl: string;
  isActive: boolean;
  userStaked: string;
  userPendingReward: string;
}

// Simulated farm configs — maps pair tokens to APR/multiplier
const FARM_CONFIGS: Record<string, { apr: number; multiplier: string; dailyReward: string }> = {
  'OPN-DRAGON': { apr: 245, multiplier: '40x', dailyReward: '1,200 DRAGON' },
  'OPN-ETH': { apr: 120, multiplier: '20x', dailyReward: '600 DRAGON' },
  'OPN-BNB': { apr: 95, multiplier: '15x', dailyReward: '450 DRAGON' },
  'OPN-MON': { apr: 180, multiplier: '30x', dailyReward: '900 DRAGON' },
  'OPN-HYPE': { apr: 150, multiplier: '25x', dailyReward: '750 DRAGON' },
  'DRAGON-ETH': { apr: 200, multiplier: '35x', dailyReward: '1,000 DRAGON' },
};

function getTokenInfo(address: string) {
  // Check if it matches WOPN → show as OPN
  const wopn = CONTRACTS.WETH.toLowerCase();
  if (address.toLowerCase() === wopn) {
    return { address, symbol: 'OPN', logoURI: '/tokens/opn.jpg' };
  }
  const token = getTokenByAddress(address);
  if (token) return { address, symbol: token.symbol, logoURI: token.logoURI };
  return { address, symbol: address.slice(0, 6), logoURI: '/tokens/opn.jpg' };
}

function getFarmConfig(sym0: string, sym1: string) {
  const key1 = `${sym0}-${sym1}`;
  const key2 = `${sym1}-${sym0}`;
  return FARM_CONFIGS[key1] || FARM_CONFIGS[key2] || { apr: 50, multiplier: '5x', dailyReward: '150 DRAGON' };
}

// Staked positions stored in localStorage
const STAKED_KEY = 'dragondex_staked_positions';

interface StakedPosition {
  pairAddress: string;
  amount: string; // in wei
  stakedAt: number;
}

function getStakedPositions(): StakedPosition[] {
  try {
    return JSON.parse(localStorage.getItem(STAKED_KEY) || '[]');
  } catch { return []; }
}

function saveStakedPositions(positions: StakedPosition[]) {
  localStorage.setItem(STAKED_KEY, JSON.stringify(positions));
}

export function useFarming() {
  const { address } = useAccount();
  const [stakedPositions, setStakedPositions] = useState<StakedPosition[]>(getStakedPositions());

  // Read pair count from factory
  const { data: pairCount } = useReadContracts({
    contracts: [{
      address: CONTRACTS.FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'allPairsLength',
    }],
    query: { enabled: true },
  });

  const count = pairCount?.[0]?.result ? Number(pairCount[0].result) : 0;
  const pairIndices = useMemo(() => Array.from({ length: Math.min(count, 20) }, (_, i) => i), [count]);

  // Read all pair addresses
  const { data: pairAddresses } = useReadContracts({
    contracts: pairIndices.map(i => ({
      address: CONTRACTS.FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'allPairs',
      args: [BigInt(i)],
    })),
    query: { enabled: count > 0 },
  });

  const validPairs = useMemo(() => {
    if (!pairAddresses) return [];
    return pairAddresses
      .map(r => r.result as `0x${string}` | undefined)
      .filter((a): a is `0x${string}` => !!a && a !== '0x0000000000000000000000000000000000000000');
  }, [pairAddresses]);

  // Read token0, token1, totalSupply, and user LP balance for each pair
  const { data: pairData, isLoading } = useReadContracts({
    contracts: validPairs.flatMap(pair => [
      { address: pair, abi: PAIR_ABI, functionName: 'token0' },
      { address: pair, abi: PAIR_ABI, functionName: 'token1' },
      { address: pair, abi: PAIR_ABI, functionName: 'totalSupply' },
      ...(address ? [{ address: pair, abi: PAIR_ABI, functionName: 'balanceOf', args: [address] }] : []),
      { address: pair, abi: PAIR_ABI, functionName: 'getReserves' },
    ]),
    query: { enabled: validPairs.length > 0 },
  });

  const farms: FarmPool[] = useMemo(() => {
    if (!pairData || validPairs.length === 0) return [];
    const stride = address ? 5 : 4;

    return validPairs.map((pairAddr, i) => {
      const base = i * stride;
      const t0 = pairData[base]?.result as string | undefined;
      const t1 = pairData[base + 1]?.result as string | undefined;
      const totalSupply = pairData[base + 2]?.result as bigint | undefined;
      const lpBal = address ? (pairData[base + 3]?.result as bigint | undefined) : 0n;
      const reserves = pairData[base + (address ? 4 : 3)]?.result as [bigint, bigint, number] | undefined;

      if (!t0 || !t1) return null;

      const token0 = getTokenInfo(t0);
      const token1 = getTokenInfo(t1);
      const config = getFarmConfig(token0.symbol, token1.symbol);

      // Simulated TVL from reserves
      const r0 = reserves?.[0] || 0n;
      const r1 = reserves?.[1] || 0n;
      const tvlNum = parseFloat(formatUnits(r0 + r1, 18)) * 0.5; // rough USD estimate

      // Check staked
      const staked = stakedPositions.find(s => s.pairAddress.toLowerCase() === pairAddr.toLowerCase());
      const stakedAmount = staked ? BigInt(staked.amount) : 0n;

      // Simulated pending rewards based on time staked
      let pendingReward = '0';
      if (staked) {
        const hoursStaked = (Date.now() - staked.stakedAt) / (1000 * 60 * 60);
        const dailyRate = config.apr / 365 / 100;
        const stakedVal = parseFloat(formatUnits(stakedAmount, 18));
        pendingReward = (stakedVal * dailyRate * (hoursStaked / 24)).toFixed(6);
      }

      return {
        id: pairAddr,
        pairAddress: pairAddr,
        token0,
        token1,
        lpBalance: lpBal || 0n,
        lpBalanceFormatted: formatUnits(lpBal || 0n, 18),
        totalStaked: formatUnits(totalSupply || 0n, 18),
        apr: config.apr,
        rewardToken: 'DRAGON',
        dailyReward: config.dailyReward,
        multiplier: config.multiplier,
        tvl: tvlNum > 0 ? `$${tvlNum.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0',
        isActive: true,
        userStaked: formatUnits(stakedAmount, 18),
        userPendingReward: pendingReward,
      } as FarmPool;
    }).filter((f): f is FarmPool => f !== null);
  }, [pairData, validPairs, address, stakedPositions]);

  const stake = useCallback((pairAddress: string, amount: bigint) => {
    const positions = getStakedPositions();
    const existing = positions.find(p => p.pairAddress.toLowerCase() === pairAddress.toLowerCase());
    if (existing) {
      existing.amount = (BigInt(existing.amount) + amount).toString();
    } else {
      positions.push({ pairAddress, amount: amount.toString(), stakedAt: Date.now() });
    }
    saveStakedPositions(positions);
    setStakedPositions([...positions]);
  }, []);

  const unstake = useCallback((pairAddress: string, amount: bigint) => {
    const positions = getStakedPositions();
    const existing = positions.find(p => p.pairAddress.toLowerCase() === pairAddress.toLowerCase());
    if (existing) {
      const newAmount = BigInt(existing.amount) - amount;
      if (newAmount <= 0n) {
        const filtered = positions.filter(p => p.pairAddress.toLowerCase() !== pairAddress.toLowerCase());
        saveStakedPositions(filtered);
        setStakedPositions(filtered);
      } else {
        existing.amount = newAmount.toString();
        saveStakedPositions(positions);
        setStakedPositions([...positions]);
      }
    }
  }, []);

  const harvest = useCallback((pairAddress: string) => {
    // Simulate harvest by resetting stakedAt
    const positions = getStakedPositions();
    const existing = positions.find(p => p.pairAddress.toLowerCase() === pairAddress.toLowerCase());
    if (existing) {
      existing.stakedAt = Date.now();
      saveStakedPositions(positions);
      setStakedPositions([...positions]);
    }
  }, []);

  return { farms, isLoading, stake, unstake, harvest };
}
