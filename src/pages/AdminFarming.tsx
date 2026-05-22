import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseUnits, type Address, isAddress } from 'viem';
import { Link, Navigate } from 'react-router-dom';
import {
  Shield, ArrowLeft, Plus, RefreshCw, Loader2, Crown, Sprout, Zap, Edit3, Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { GlowOrb } from '@/components/ui/premium/GlowOrb';
import { toast } from 'sonner';

import { FARMING_CONTRACT } from '@/config/farming';
import {
  formatTokenAmount,
  useFarmingActions,
  useFarmingOwner,
  useFarmingPools,
} from '@/hooks/useFarming';
import { useWallet } from '@/hooks/useWallet';

export default function AdminFarming() {
  const { isAdmin, owner } = useFarmingOwner();
  const { isConnected, address } = useWallet();
  const { pools, loading, refresh } = useFarmingPools();
  const { addPool, updateRewardPerBlock, updatePool, massUpdatePools, transferOwnership } = useFarmingActions();

  const [busy, setBusy] = useState(false);

  // Add pool form
  const [stakingToken, setStakingToken] = useState('');
  const [rewardToken, setRewardToken] = useState('');
  const [rewardPerBlock, setRewardPerBlock] = useState('');

  // Update reward form (per pool)
  const [editing, setEditing] = useState<{ pid: number; value: string } | null>(null);

  // Transfer ownership
  const [newOwner, setNewOwner] = useState('');

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Connect Wallet</h1>
        <p className="text-muted-foreground">Connect your wallet to access the admin panel.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-2">Only the contract owner can access this panel.</p>
        <p className="text-xs text-muted-foreground font-mono break-all">
          Owner: {owner ?? '...'}<br />
          You: {address}
        </p>
        <Link to="/farming">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Farms
          </Button>
        </Link>
      </div>
    );
  }

  const handle = async (fn: () => Promise<unknown>, onSuccess?: () => void) => {
    setBusy(true);
    try {
      await fn();
      onSuccess?.();
      refresh();
    } catch {}
    setBusy(false);
  };

  const handleAddPool = () => {
    if (!isAddress(stakingToken) || !isAddress(rewardToken)) {
      toast.error('Invalid token address');
      return;
    }
    if (!rewardPerBlock || Number(rewardPerBlock) <= 0) {
      toast.error('Invalid reward per block');
      return;
    }
    const rpb = parseUnits(rewardPerBlock, 18);
    handle(
      () => addPool(stakingToken as Address, rewardToken as Address, rpb),
      () => {
        setStakingToken('');
        setRewardToken('');
        setRewardPerBlock('');
      }
    );
  };

  const handleUpdateReward = () => {
    if (!editing) return;
    if (!editing.value || Number(editing.value) < 0) {
      toast.error('Invalid amount');
      return;
    }
    const rpb = parseUnits(editing.value, 18);
    handle(() => updateRewardPerBlock(editing.pid, rpb), () => setEditing(null));
  };

  const handleTransfer = () => {
    if (!isAddress(newOwner)) {
      toast.error('Invalid address');
      return;
    }
    handle(() => transferOwnership(newOwner as Address), () => setNewOwner(''));
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-24 lg:pb-12 overflow-hidden">
      <Spotlight className="hidden md:block" />
      <GlowOrb color="primary" size="xl" className="-top-20 -left-40 opacity-20" />
      <GlowOrb color="accent" size="lg" className="bottom-10 -right-20 opacity-15" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/farming" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Farms
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold gradient-text">
                Farming Admin
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
                Contract: {FARMING_CONTRACT}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Add Pool */}
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold">Add New Pool</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Staking Token Address</Label>
                <Input
                  placeholder="0x..."
                  value={stakingToken}
                  onChange={(e) => setStakingToken(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Reward Token Address</Label>
                <Input
                  placeholder="0x..."
                  value={rewardToken}
                  onChange={(e) => setRewardToken(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Reward Per Block (in token units)</Label>
                <Input
                  type="number"
                  placeholder="0.1"
                  value={rewardPerBlock}
                  onChange={(e) => setRewardPerBlock(e.target.value)}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Assumed 18 decimals.</p>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent"
                disabled={busy}
                onClick={handleAddPool}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Plus className="w-4 h-4 mr-2" /> Create Pool</>)}
              </Button>
            </div>
          </Card>

          {/* Maintenance */}
          <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-accent/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-display text-lg font-bold">Maintenance</h2>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={() => handle(() => massUpdatePools())}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Mass Update All Pools
              </Button>

              <div className="pt-4 border-t border-border/40">
                <Label className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" /> Transfer Ownership
                </Label>
                <Input
                  placeholder="0x... new owner"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="font-mono text-xs mt-1"
                />
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  disabled={busy}
                  onClick={handleTransfer}
                >
                  Transfer Ownership
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Pool list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" /> Managed Pools ({pools.length})
          </h2>
          <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : pools.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">No pools yet. Create one above.</Card>
        ) : (
          <div className="space-y-3">
            {pools.map((p) => (
              <Card key={p.pid} className="p-4 bg-card/60 backdrop-blur-xl border-border/40">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary border border-primary/30 font-mono">
                        PID #{p.pid}
                      </span>
                      <span className="font-display font-bold">
                        Stake {p.stakingSymbol} → Earn {p.rewardSymbol}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono break-all">
                      Stake: {p.stakingToken}<br />
                      Reward: {p.rewardToken}
                    </div>
                    <div className="flex gap-4 text-xs mt-2">
                      <span>
                        <span className="text-muted-foreground">RPB:</span>{' '}
                        <span className="font-mono text-accent">
                          {formatTokenAmount(p.rewardPerBlock, p.rewardDecimals, 6)}
                        </span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Total Staked:</span>{' '}
                        <span className="font-mono">
                          {formatTokenAmount(p.totalStaked, p.stakingDecimals, 2)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {editing?.pid === p.pid ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="New RPB"
                          value={editing.value}
                          onChange={(e) => setEditing({ pid: p.pid, value: e.target.value })}
                          className="w-32 font-mono text-xs"
                        />
                        <Button size="sm" onClick={handleUpdateReward} disabled={busy}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing({ pid: p.pid, value: '' })}
                        >
                          <Edit3 className="w-3 h-3 mr-1" /> Set Reward
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => handle(() => updatePool(p.pid))}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Update
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
