import { motion } from 'framer-motion';
import { Flame, TrendingUp, Coins, Loader2, Sprout, Zap, RefreshCw } from 'lucide-react';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { GlowingStarsBackground } from '@/components/ui/aceternity/GlowingStars';
import { ParticleField } from '@/components/ui/premium/ParticleField';
import { GlowOrb } from '@/components/ui/premium/GlowOrb';
import { Meteors } from '@/components/ui/magic/Meteors';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { Button } from '@/components/ui/button';
import { FarmCard } from '@/components/farming/FarmCard';
import { useFarming } from '@/hooks/useFarming';
import { useMemo } from 'react';

export default function Farming() {
  const { farms, isLoading, stake, unstake, harvest } = useFarming();

  const totalTVL = useMemo(() => {
    return farms.reduce((sum, f) => {
      const val = parseFloat(f.tvl.replace(/[$,]/g, '')) || 0;
      return sum + val;
    }, 0);
  }, [farms]);

  const highestAPR = useMemo(() => {
    return farms.reduce((max, f) => Math.max(max, f.apr), 0);
  }, [farms]);

  const activeFarms = farms.filter(f => f.isActive).length;

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-24 lg:pb-0 overflow-hidden">
      {/* Background Effects */}
      <Spotlight className="hidden md:block" />
      <GlowingStarsBackground starCount={20} className="opacity-10" />
      <ParticleField particleCount={12} colorScheme="dragon" className="opacity-10" />
      <Meteors number={5} className="opacity-15" />
      <GlowOrb color="primary" size="xl" className="top-20 -left-40 opacity-20" />
      <GlowOrb color="accent" size="lg" className="bottom-40 -right-20 opacity-15" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4"
          >
            <Sprout className="w-4 h-4" />
            <span>Dragon Farms</span>
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold gradient-text mb-3">Yield Farming</h1>
          <TextGenerateEffect
            words="Stake LP tokens to earn DRAGON rewards. Higher multiplier = more rewards per block."
            className="text-sm md:text-base text-muted-foreground font-normal max-w-xl mx-auto"
          />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          {[
            { label: 'Total TVL', value: totalTVL, prefix: '$', icon: Coins, color: 'text-primary' },
            { label: 'Highest APR', value: highestAPR, suffix: '%', icon: TrendingUp, color: 'text-success' },
            { label: 'Active Farms', value: activeFarms, icon: Zap, color: 'text-accent' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-card border border-border/40 rounded-2xl p-5 text-center overflow-hidden"
            >
              <BorderBeam size={120} duration={8 + i * 2} />
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.prefix}
                <NumberTicker value={stat.value} />
                {stat.suffix}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Farm List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading farms from blockchain...</p>
          </div>
        ) : farms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Sprout className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No farms available yet</p>
            <p className="text-sm text-muted-foreground/70 mb-4">Liquidity pools need to be created first</p>
            <Button variant="outline" onClick={() => window.location.href = '/liquidity'}>
              Add Liquidity First
            </Button>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm text-muted-foreground">
                {farms.length} farm{farms.length !== 1 ? 's' : ''} available
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                <span>Auto-refresh every 10s</span>
              </div>
            </div>
            {farms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                onStake={stake}
                onUnstake={unstake}
                onHarvest={harvest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
