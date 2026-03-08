import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Flame, Zap, TrendingUp, Gift, Loader2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlowingStarsBackgroundCard } from '@/components/ui/aceternity/GlowingStars';
import { cn } from '@/lib/utils';
import { FarmPool } from '@/hooks/useFarming';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';

interface FarmCardProps {
  farm: FarmPool;
  onStake: (pairAddress: string, amount: bigint) => void;
  onUnstake: (pairAddress: string, amount: bigint) => void;
  onHarvest: (pairAddress: string) => void;
}

export function FarmCard({ farm, onStake, onUnstake, onHarvest }: FarmCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isConnected } = useAccount();

  const userStakedNum = parseFloat(farm.userStaked);
  const pendingRewardNum = parseFloat(farm.userPendingReward);
  const lpBalanceNum = parseFloat(farm.lpBalanceFormatted);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    if (parseFloat(stakeAmount) > lpBalanceNum) {
      toast.error('Insufficient LP balance');
      return;
    }
    setIsProcessing(true);
    // Simulate tx delay
    await new Promise(r => setTimeout(r, 1500));
    onStake(farm.pairAddress, parseUnits(stakeAmount, 18));
    toast.success(`Staked ${stakeAmount} LP tokens!`, {
      description: `${farm.token0.symbol}-${farm.token1.symbol} farm`,
    });
    setStakeAmount('');
    setIsProcessing(false);
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return;
    if (parseFloat(unstakeAmount) > userStakedNum) {
      toast.error('Insufficient staked balance');
      return;
    }
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    onUnstake(farm.pairAddress, parseUnits(unstakeAmount, 18));
    toast.success(`Unstaked ${unstakeAmount} LP tokens!`);
    setUnstakeAmount('');
    setIsProcessing(false);
  };

  const handleHarvest = async () => {
    if (pendingRewardNum <= 0) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    onHarvest(farm.pairAddress);
    toast.success(`Harvested ${farm.userPendingReward} DRAGON!`, {
      description: 'Rewards sent to your wallet',
    });
    setIsProcessing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      <div className="relative bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
        {/* Main Row */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 md:p-5 flex items-center gap-4 text-left"
        >
          {/* Token Pair Icons */}
          <div className="relative flex-shrink-0">
            <img src={farm.token0.logoURI} alt={farm.token0.symbol} className="w-9 h-9 rounded-full border-2 border-card" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
            <img src={farm.token1.logoURI} alt={farm.token1.symbol} className="w-9 h-9 rounded-full border-2 border-card absolute left-6 top-0" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
          </div>

          {/* Pair Name */}
          <div className="flex-1 ml-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{farm.token0.symbol}-{farm.token1.symbol}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/15 text-primary">
                {farm.multiplier}
              </span>
              {farm.isActive && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-success/15 text-success">
                  <Zap className="w-2.5 h-2.5" /> Live
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Earn {farm.rewardToken}</p>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-6 text-right">
            <div>
              <p className="text-xs text-muted-foreground">APR</p>
              <p className="font-bold text-success flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {farm.apr}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">TVL</p>
              <p className="font-semibold text-foreground">{farm.tvl}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Earned</p>
              <p className={cn("font-semibold", pendingRewardNum > 0 ? "text-accent" : "text-muted-foreground")}>
                {pendingRewardNum > 0 ? parseFloat(farm.userPendingReward).toFixed(4) : '0'} 
              </p>
            </div>
          </div>

          <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </button>

        {/* Mobile Stats */}
        <div className="sm:hidden px-4 pb-3 flex gap-3">
          <div className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground">APR</p>
            <p className="text-sm font-bold text-success">{farm.apr}%</p>
          </div>
          <div className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground">TVL</p>
            <p className="text-sm font-semibold">{farm.tvl}</p>
          </div>
          <div className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Earned</p>
            <p className="text-sm font-semibold text-accent">{pendingRewardNum > 0 ? parseFloat(farm.userPendingReward).toFixed(4) : '0'}</p>
          </div>
        </div>

        {/* Expanded Section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 md:px-5 pb-5 pt-2 border-t border-border/30 space-y-4">
                {/* Reward Harvest */}
                {pendingRewardNum > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pending Rewards</p>
                        <p className="font-bold text-accent">{parseFloat(farm.userPendingReward).toFixed(6)} DRAGON</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleHarvest}
                      disabled={isProcessing}
                      size="sm"
                      className="btn-dragon h-9"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Flame className="w-4 h-4" /> Harvest</>}
                    </Button>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Daily Rewards</p>
                    <p className="font-semibold text-foreground">{farm.dailyReward}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Your LP Balance</p>
                    <p className="font-semibold text-foreground">{parseFloat(farm.lpBalanceFormatted).toFixed(4)}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Your Staked</p>
                    <p className="font-semibold text-foreground">{userStakedNum > 0 ? userStakedNum.toFixed(4) : '0'}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Total Staked</p>
                    <p className="font-semibold text-foreground">{parseFloat(farm.totalStaked).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Stake / Unstake Tabs */}
                {isConnected && (
                  <div className="space-y-3">
                    <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
                      <button
                        onClick={() => setActiveTab('stake')}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                          activeTab === 'stake' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Lock className="w-3.5 h-3.5" /> Stake
                      </button>
                      <button
                        onClick={() => setActiveTab('unstake')}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                          activeTab === 'unstake' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Unlock className="w-3.5 h-3.5" /> Unstake
                      </button>
                    </div>

                    {activeTab === 'stake' ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="h-11 bg-muted/30 border-border/30 pr-16"
                          />
                          <button
                            onClick={() => setStakeAmount(farm.lpBalanceFormatted)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-medium hover:text-primary/80"
                          >
                            MAX
                          </button>
                        </div>
                        <Button
                          onClick={handleStake}
                          disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) <= 0}
                          className="btn-dragon h-11 px-6"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Stake'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={unstakeAmount}
                            onChange={(e) => setUnstakeAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="h-11 bg-muted/30 border-border/30 pr-16"
                          />
                          <button
                            onClick={() => setUnstakeAmount(farm.userStaked)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-medium hover:text-primary/80"
                          >
                            MAX
                          </button>
                        </div>
                        <Button
                          onClick={handleUnstake}
                          disabled={isProcessing || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                          variant="outline"
                          className="h-11 px-6 border-primary/30 hover:bg-primary/10"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unstake'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!isConnected && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Connect wallet to stake LP tokens
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
