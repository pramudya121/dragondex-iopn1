import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatUnits, parseUnits, type Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { Sprout, TrendingUp, Lock, Gift, AlertTriangle, Loader2, RefreshCw, Settings } from 'lucide-react';
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
  formatTokenAmount,
  useFarmingActions,
  useFarmingOwner,
  useFarmingPools,
  useUserFarmInfo,
} from '@/hooks/useFarming';

function FarmCard({ pool, onAction }: { pool: FarmPool; onAction: () => void }) {
  const { address } = useAccount();
  const { info, refresh } = useUserFarmInfo(pool.pid);
  const { deposit, withdraw, harvest, emergencyWithdraw } = useFarmingActions();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: balanceRaw } = useReadContract({
    address: pool.stakingToken,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const balance = (balanceRaw as bigint | undefined) ?? 0n;

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
            <span className="px-2 py-1 rounded-md text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              PID #{pool.pid}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-3 bg-background/40 border border-border/40">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Reward / Block
              </div>
              <div className="font-mono text-sm font-bold text-accent mt-1">
                {formatTokenAmount(pool.rewardPerBlock, pool.rewardDecimals, 4)}
              </div>
            </div>
            <div className="rounded-lg p-3 bg-background/40 border border-border/40">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Total Staked
              </div>
              <div className="font-mono text-sm font-bold mt-1">
                {formatTokenAmount(pool.totalStaked, pool.stakingDecimals, 2)}
              </div>
            </div>
          </div>

          {/* User position */}
          {address && (
            <div className="rounded-xl p-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Your Stake</span>
                <span className="font-mono font-semibold">
                  {formatTokenAmount(staked, pool.stakingDecimals)} {pool.stakingSymbol}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Gift className="w-3 h-3 text-accent" /> Pending Reward
                </span>
                <span className="font-mono font-semibold text-accent">
                  {formatTokenAmount(pending, pool.rewardDecimals)} {pool.rewardSymbol}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-1 border-accent/40 text-accent hover:bg-accent/10"
                disabled={busy || pending === 0n}
                onClick={() => handle(() => harvest(pool.pid))}
              >
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Harvest'}
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
              <div className="text-[10px] text-muted-foreground text-right">
                Balance: {formatTokenAmount(balance, pool.stakingDecimals)} {pool.stakingSymbol}
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={busy || !address || !amount || Number(amount) <= 0}
                onClick={() => handle(() => deposit(pool.pid, parseUnits(amount, pool.stakingDecimals), pool.stakingToken))}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Stake'}
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
              <Button
                className="w-full"
                variant="secondary"
                disabled={busy || !address || !amount || Number(amount) <= 0}
                onClick={() => handle(() => withdraw(pool.pid, parseUnits(amount, pool.stakingDecimals)))}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unstake'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:bg-destructive/10"
                disabled={busy || staked === 0n}
                onClick={() => handle(() => emergencyWithdraw(pool.pid))}
              >
                <AlertTriangle className="w-3 h-3 mr-1" /> Emergency Withdraw
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

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-24 lg:pb-12 overflow-hidden">
      <Spotlight className="hidden md:block" />
      <ParticleField particleCount={14} colorScheme="dragon" className="opacity-10" />
      <Meteors number={6} className="opacity-15" />
      <GlowOrb color="primary" size="xl" className="-top-20 -left-40 opacity-20" />
      <GlowOrb color="accent" size="lg" className="bottom-10 -right-20 opacity-15" />

      <div className="relative z-10 container mx-auto px-4 pt-6">
        {/* Hero */}
        <div className="text-center mb-10">
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
            <FarmCard key={p.pid} pool={p} onAction={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
