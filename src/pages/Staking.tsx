import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Lock, Unlock, TrendingUp, Clock, Loader2, CheckCircle, AlertCircle, Coins, Percent, Gift, Shield, Zap, ExternalLink } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useTokenBalance } from '@/hooks/useContract';
import { CONTRACTS } from '@/config/contracts';
import { useTokenPrices } from '@/hooks/usePrices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { GlowingStarsCard } from '@/components/ui/aceternity/GlowingStars';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { cn } from '@/lib/utils';

type StakingTab = 'stake' | 'unstake';

// Simulated staking pools
const STAKING_POOLS = [
  {
    id: 'dragon-single',
    name: 'DRAGON Staking',
    description: 'Stake DRAGON to earn more DRAGON',
    stakeToken: 'DRAGON',
    rewardToken: 'DRAGON',
    apr: 42.5,
    totalStaked: 1250000,
    stakeLogo: '/tokens/dragon.png',
    rewardLogo: '/tokens/dragon.png',
    lockDays: 0,
    type: 'Flexible' as const,
  },
  {
    id: 'dragon-locked-30',
    name: 'DRAGON Locked 30D',
    description: 'Lock DRAGON for 30 days for higher rewards',
    stakeToken: 'DRAGON',
    rewardToken: 'DRAGON',
    apr: 85.0,
    totalStaked: 750000,
    stakeLogo: '/tokens/dragon.png',
    rewardLogo: '/tokens/dragon.png',
    lockDays: 30,
    type: 'Locked' as const,
  },
  {
    id: 'dragon-locked-90',
    name: 'DRAGON Locked 90D',
    description: 'Lock DRAGON for 90 days for maximum rewards',
    stakeToken: 'DRAGON',
    rewardToken: 'DRAGON',
    apr: 150.0,
    totalStaked: 350000,
    stakeLogo: '/tokens/dragon.png',
    rewardLogo: '/tokens/dragon.png',
    lockDays: 90,
    type: 'Locked' as const,
  },
];

function StakingPoolCard({ pool, index }: { pool: typeof STAKING_POOLS[0]; index: number }) {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<StakingTab>('stake');
  const [amount, setAmount] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Simulated user staking data
  const userStaked = 0;
  const pendingRewards = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <BackgroundGradient containerClassName="h-full" animate>
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={pool.stakeLogo} alt={pool.stakeToken} className="w-12 h-12 rounded-full border-2 border-background shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
                  {pool.lockDays > 0 && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-card border border-border">
                      <Lock className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base">{pool.name}</h3>
                  <p className="text-xs text-muted-foreground">{pool.description}</p>
                </div>
              </div>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                pool.type === 'Flexible' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
              )}>
                {pool.type}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">APR</p>
                <p className="font-bold text-success text-lg">{pool.apr}%</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Total Staked</p>
                <p className="font-bold text-sm">{(pool.totalStaked / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Lock Period</p>
                <p className="font-bold text-sm">{pool.lockDays > 0 ? `${pool.lockDays} Days` : 'None'}</p>
              </div>
            </div>

            {/* Expand toggle */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide' : 'Stake / Unstake'}
            </Button>
          </div>

          {/* Expanded Staking Form */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-border/50 pt-4">
                  {/* Tabs */}
                  <div className="flex bg-muted/50 rounded-lg p-1 mb-4">
                    {(['stake', 'unstake'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors capitalize",
                          activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {tab === 'stake' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Amount Input */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-muted-foreground">
                        {activeTab === 'stake' ? 'Stake Amount' : 'Unstake Amount'}
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        Available: 0.00 {pool.stakeToken}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-muted/50 pr-20"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button className="text-[10px] font-bold text-primary hover:text-primary/80 px-1.5 py-0.5 rounded bg-primary/10">
                          MAX
                        </button>
                        <img src={pool.stakeLogo} alt="" className="w-5 h-5 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="bg-muted/20 rounded-xl p-3 space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Stake</span>
                      <span className="font-medium">{userStaked.toFixed(2)} {pool.stakeToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending Rewards</span>
                      <span className="font-medium text-success">{pendingRewards.toFixed(4)} {pool.rewardToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Earnings</span>
                      <span className="font-medium text-primary">~0.00 {pool.rewardToken}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {pendingRewards > 0 && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Gift className="w-3 h-3 mr-1" />
                        Harvest
                      </Button>
                    )}
                    <Button
                      className={cn("flex-1", isConnected ? "btn-dragon" : "")}
                      size="sm"
                      disabled={!isConnected || !amount || parseFloat(amount) <= 0}
                    >
                      {!isConnected ? 'Connect Wallet' : activeTab === 'stake' ? (
                        <><Lock className="w-3 h-3 mr-1" />Stake {pool.stakeToken}</>
                      ) : (
                        <><Unlock className="w-3 h-3 mr-1" />Unstake {pool.stakeToken}</>
                      )}
                    </Button>
                  </div>

                  {pool.lockDays > 0 && activeTab === 'stake' && (
                    <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Tokens will be locked for {pool.lockDays} days after staking
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BackgroundGradient>
    </motion.div>
  );
}

export default function Staking() {
  const { address, isConnected } = useAccount();
  const { data: dragonBalance } = useTokenBalance(CONTRACTS.DRAGON as `0x${string}`, address);
  const { prices } = useTokenPrices();

  const dragonBal = dragonBalance ? parseFloat(formatEther(dragonBalance)) : 0;
  const dragonPrice = prices['DRAGON'] || 0.25;
  const dragonValue = dragonBal * dragonPrice;

  // Simulated total staking stats
  const totalStakedUSD = STAKING_POOLS.reduce((acc, p) => acc + p.totalStaked * dragonPrice, 0);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-24 lg:pb-8 relative min-h-screen">
      <Spotlight className="hidden md:block" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-orange-500/20 border border-primary/30 mb-3"
          >
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">DRAGON Staking</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-3">Staking</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Stake your DRAGON tokens to earn rewards. Choose between flexible and locked staking for higher APR.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="relative overflow-hidden glass-card p-4 text-center">
            <BorderBeam size={60} duration={10} />
            <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">${(totalStakedUSD / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-muted-foreground">Total Staked</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative overflow-hidden glass-card p-4 text-center">
            <BorderBeam size={60} duration={10} delay={1} />
            <Percent className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">150%</p>
            <p className="text-[10px] text-muted-foreground">Max APR</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative overflow-hidden glass-card p-4 text-center">
            <BorderBeam size={60} duration={10} delay={2} />
            <Coins className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold">{dragonBal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-muted-foreground">Your DRAGON</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="relative overflow-hidden glass-card p-4 text-center">
            <BorderBeam size={60} duration={10} delay={3} />
            <Gift className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">0.00</p>
            <p className="text-[10px] text-muted-foreground">Pending Rewards</p>
          </motion.div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 mb-6 flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Staking on OPN Testnet</p>
            <p className="text-xs text-muted-foreground">
              Staking contracts are under development. Current APR values are estimated. 
              Flexible staking allows withdrawal at any time. Locked staking provides higher rewards but tokens cannot be withdrawn until the lock period ends.
            </p>
          </div>
        </motion.div>

        {/* Staking Pools */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STAKING_POOLS.map((pool, i) => (
            <StakingPoolCard key={pool.id} pool={pool} index={i} />
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass-card p-5"
        >
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            How Staking Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="text-sm font-medium mb-1">Choose a Pool</p>
              <p className="text-xs text-muted-foreground">Select flexible or locked staking based on your preference</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="text-sm font-medium mb-1">Stake DRAGON</p>
              <p className="text-xs text-muted-foreground">Enter the amount and confirm the staking transaction</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-bold">3</span>
              </div>
              <p className="text-sm font-medium mb-1">Earn Rewards</p>
              <p className="text-xs text-muted-foreground">Claim your DRAGON rewards anytime or let them compound</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
