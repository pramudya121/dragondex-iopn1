import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatUnits, parseUnits, type Address } from 'viem';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import {
  Sprout, TrendingUp, Lock, Gift, AlertTriangle, Loader2, RefreshCw, Settings,
  Coins, Percent, DollarSign, Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { GlowOrb } from '@/components/ui/premium/GlowOrb';
import { Meteors } from '@/components/ui/magic/Meteors';
import { ParticleField } from '@/components/ui/premium/ParticleField';
import { FarmCrystal3D } from '@/components/farming/FarmCrystal3D';

import {
  FarmPool,
  calculateAPR,
  formatTokenAmount,
  useFarmingActions,
  useFarmingOwner,
  useFarmingPools,
  useUserFarmInfo,
} from '@/hooks/useFarming';
import { FARMING_CONTRACT } from '@/config/farming';
import { useTokenPrices } from '@/hooks/usePrices';

function formatUsd(v: number) {
  if (!isFinite(v) || v <= 0) return '$0';
  if (v < 0.01) return '<$0.01';
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function FarmCard({
  pool,
  prices,
  onAction,
}: {
  pool: FarmPool;
  prices: Record<string, number>;
  onAction: () => void;
}) {
  const { address } = useAccount();
  const client = usePublicClient() as any;
  const { info, refresh } = useUserFarmInfo(pool.pid);
  const { deposit, withdraw, harvest, emergencyWithdraw } = useFarmingActions();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [allowance, setAllowance] = useState<bigint>(0n);

  const { data: balanceRaw } = useReadContract({
    address: pool.stakingToken,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 12000 },
  });
  const balance = (balanceRaw as bigint | undefined) ?? 0n;

  // Track allowance live
  useEffect(() => {
    if (!address || !client) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        const a = (await client.readContract({
          address: pool.stakingToken,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, FARMING_CONTRACT],
        })) as bigint;
        if (!cancelled) setAllowance(a);
      } catch {}
    };
    fetch();
    const id = setInterval(fetch, 12000);
    return () => { cancelled = true; clearInterval(id); };
  }, [address, client, pool.stakingToken]);

  const handle = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      refresh();
      onAction();
      setAmount('');
    } catch {}
    setBusy(false);
  };

  const staked = info?.amount ?? 0n;
  const pending = info?.pending ?? 0n;

  // Derived numbers
  const stakingPrice = prices[pool.stakingSymbol] ?? 0;
  const rewardPrice = prices[pool.rewardSymbol] ?? 0;
  const apr = calculateAPR(pool, stakingPrice, rewardPrice);
  const totalStakedNum = Number(formatUnits(pool.totalStaked, pool.stakingDecimals));
  const userStakedNum = Number(formatUnits(staked, pool.stakingDecimals));
  const userSharePct = totalStakedNum > 0 ? (userStakedNum / totalStakedNum) * 100 : 0;
  const userStakedUsd = userStakedNum * stakingPrice;
  const pendingNum = Number(formatUnits(pending, pool.rewardDecimals));
  const pendingUsd = pendingNum * rewardPrice;
  const tvlUsd = totalStakedNum * stakingPrice;

  const parsedAmt = (() => {
    try { return amount ? parseUnits(amount, pool.stakingDecimals) : 0n; }
    catch { return 0n; }
  })();
  const needsApproval = parsedAmt > 0n && allowance < parsedAmt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/30">
                  <Sprout className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold">
                  Stake {pool.stakingSymbol}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Earn <span className="text-accent font-semibold">{pool.rewardSymbol}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-2 py-1 rounded-md text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                PID #{pool.pid}
              </span>
              {apr !== null && (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r from-success/20 to-accent/20 text-success border border-success/30 inline-flex items-center gap-1">
                  <Percent className="w-2.5 h-2.5" />
                  {apr.toLocaleString(undefined, { maximumFractionDigits: 2 })}% APR
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-2.5 bg-background/40 border border-border/40">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> RPB
              </div>
              <div className="font-mono text-xs font-bold text-accent mt-1 truncate">
                {formatTokenAmount(pool.rewardPerBlock, pool.rewardDecimals, 3)}
              </div>
            </div>
            <div className="rounded-lg p-2.5 bg-background/40 border border-border/40">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Staked
              </div>
              <div className="font-mono text-xs font-bold mt-1 truncate">
                {totalStakedNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="rounded-lg p-2.5 bg-background/40 border border-border/40">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-2.5 h-2.5" /> TVL
              </div>
              <div className="font-mono text-xs font-bold mt-1 truncate">{formatUsd(tvlUsd)}</div>
            </div>
          </div>

          {/* User position */}
          {address && (
            <div className="rounded-xl p-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Your Stake</span>
                <span className="text-right">
                  <div className="font-mono font-semibold">
                    {formatTokenAmount(staked, pool.stakingDecimals)} {pool.stakingSymbol}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatUsd(userStakedUsd)} · {userSharePct.toFixed(2)}% share
                  </div>
                </span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Gift className="w-3 h-3 text-accent" /> Pending
                </span>
                <span className="text-right">
                  <motion.div
                    key={pending.toString()}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="font-mono font-semibold text-accent"
                  >
                    {formatTokenAmount(pending, pool.rewardDecimals, 6)} {pool.rewardSymbol}
                  </motion.div>
                  <div className="text-[10px] text-muted-foreground">{formatUsd(pendingUsd)}</div>
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-1 border-accent/40 text-accent hover:bg-accent/10"
                disabled={busy || pending === 0n}
                onClick={() => handle(() => harvest(pool.pid))}
              >
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : (<><Gift className="w-3 h-3 mr-1" /> Harvest</>)}
              </Button>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="stake">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="unstake">Unstake</TabsTrigger>
            </TabsList>
            <TabsContent value="stake" className="space-y-2 pt-3">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16 font-mono"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
                  onClick={() => setAmount(formatUnits(balance, pool.stakingDecimals))}
                >
                  MAX
                </button>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{needsApproval ? 'Approval needed' : 'Approved ✓'}</span>
                <span>Balance: {formatTokenAmount(balance, pool.stakingDecimals)}</span>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={busy || !address || !amount || Number(amount) <= 0 || parsedAmt > balance}
                onClick={() => handle(() => deposit(pool.pid, parsedAmt, pool.stakingToken))}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> :
                  parsedAmt > balance ? 'Insufficient Balance' :
                  needsApproval ? `Approve & Stake ${pool.stakingSymbol}` :
                  `Stake ${pool.stakingSymbol}`}
              </Button>
            </TabsContent>
            <TabsContent value="unstake" className="space-y-2 pt-3">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16 font-mono"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
                  onClick={() => setAmount(formatUnits(staked, pool.stakingDecimals))}
                >
                  MAX
                </button>
              </div>
              <div className="text-[10px] text-muted-foreground text-right">
                Staked: {formatTokenAmount(staked, pool.stakingDecimals)} {pool.stakingSymbol}
              </div>
              <Button
                className="w-full"
                variant="secondary"
                disabled={busy || !address || !amount || Number(amount) <= 0 || parsedAmt > staked}
                onClick={() => handle(() => withdraw(pool.pid, parsedAmt))}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> :
                  parsedAmt > staked ? 'Exceeds Staked' : 'Unstake'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:bg-destructive/10"
                disabled={busy || staked === 0n}
                onClick={() => handle(() => emergencyWithdraw(pool.pid))}
              >
                <AlertTriangle className="w-3 h-3 mr-1" /> Emergency Withdraw (forfeit rewards)
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Farming() {
  const { pools, loading, refresh } = useFarmingPools();
  const { isAdmin } = useFarmingOwner();
  const { prices } = useTokenPrices();

  // Aggregate stats
  const summary = useMemo(() => {
    let totalTvl = 0;
    let activePools = 0;
    let bestApr = 0;
    for (const p of pools) {
      const stakeP = prices[p.stakingSymbol] ?? 0;
      const rewardP = prices[p.rewardSymbol] ?? 0;
      const staked = Number(formatUnits(p.totalStaked, p.stakingDecimals));
      totalTvl += staked * stakeP;
      if (p.totalStaked > 0n) activePools += 1;
      const apr = calculateAPR(p, stakeP, rewardP);
      if (apr && apr > bestApr) bestApr = apr;
    }
    return { totalTvl, activePools, bestApr };
  }, [pools, prices]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-24 lg:pb-12 overflow-hidden">
      <Spotlight className="hidden md:block" />
      <ParticleField particleCount={14} colorScheme="dragon" className="opacity-10" />
      <Meteors number={6} className="opacity-15" />
      <GlowOrb color="primary" size="xl" className="-top-20 -left-40 opacity-20" />
      <GlowOrb color="accent" size="lg" className="bottom-10 -right-20 opacity-15" />

      <div className="relative z-10 container mx-auto px-4 pt-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <FarmCrystal3D />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="ember-pill mb-3 mt-4">
              <Sprout className="w-3.5 h-3.5" />
              <span>Dragon Farms</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold gradient-text mb-2">
              Stake. Earn. Forge.
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Lock tokens in DragonDEX farms and earn rewards every block on OPN Testnet.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
              </Button>
              {isAdmin && (
                <Link to="/admin/farming">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                    <Settings className="w-3.5 h-3.5 mr-1.5" /> Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Summary stats */}
        {pools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mb-8"
          >
            {[
              { label: 'Total TVL', value: formatUsd(summary.totalTvl), icon: DollarSign, color: 'text-primary' },
              { label: 'Active Farms', value: `${summary.activePools} / ${pools.length}`, icon: Coins, color: 'text-accent' },
              { label: 'Best APR', value: summary.bestApr > 0 ? `${summary.bestApr.toFixed(1)}%` : '—', icon: Flame, color: 'text-success' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="p-3 sm:p-4 bg-card/60 backdrop-blur-xl border-border/40 text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <div className={`font-mono font-bold text-sm sm:text-base mt-1 ${s.color}`}>{s.value}</div>
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* Pools grid */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {!loading && pools.length === 0 && (
          <Card className="p-12 text-center max-w-md mx-auto">
            <Sprout className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No farms available yet.</p>
            {isAdmin && (
              <Link to="/admin/farming">
                <Button className="mt-4">Create First Pool</Button>
              </Link>
            )}
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {pools.map((p) => (
            <FarmCard key={p.pid} pool={p} prices={prices} onAction={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
