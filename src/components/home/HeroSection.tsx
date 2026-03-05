import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShimmerButton } from '@/components/ui/magic/ShimmerButton';
import { AnimatedGradientText } from '@/components/ui/magic/AnimatedGradientText';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { useAllPairsLength } from '@/hooks/useContract';
import { useLiquidityPools } from '@/hooks/useLiquidityPools';
import { useTokenPrices } from '@/hooks/usePrices';
import { formatUnits } from 'viem';

export function HeroSection() {
  const { data: pairsCount } = useAllPairsLength();
  const { pools } = useLiquidityPools();
  const { prices } = useTokenPrices();

  // Calculate real TVL from on-chain data
  const totalTVL = useMemo(() => {
    return pools.reduce((acc, pool) => {
      const price0 = prices[pool.token0Symbol] || 0;
      const price1 = prices[pool.token1Symbol] || 0;
      const value0 = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18)) * price0;
      const value1 = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18)) * price1;
      return acc + value0 + value1;
    }, 0);
  }, [pools, prices]);

  const activePools = useMemo(() => {
    return pools.filter(p => p.reserve0 > 0n && p.reserve1 > 0n).length;
  }, [pools]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/8 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm mb-6"
          >
            <Flame className="w-4 h-4" />
            <span>Live on OPN Testnet</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
            <AnimatedGradientText className="text-5xl md:text-6xl lg:text-7xl font-black">
              DRAGONDEX
            </AnimatedGradientText>
          </h1>

          <TextGenerateEffect
            words="The premier decentralized exchange on OPN Testnet. Swap, provide liquidity, and earn with the power of the dragon."
            className="text-lg md:text-xl text-muted-foreground font-normal mb-8 max-w-xl mx-auto"
          />

          {/* Stats - Real On-Chain Data */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
            {[
              { value: totalTVL, label: 'Total Value Locked', prefix: '$', color: 'text-primary' },
              { value: Number(pairsCount || 0), label: 'Total Pools', prefix: '', color: 'text-secondary' },
              { value: activePools, label: 'Active Pools', prefix: '', color: 'text-accent' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 overflow-hidden"
              >
                <BorderBeam size={60} duration={10} delay={idx} />
                <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                  {stat.prefix}<NumberTicker value={stat.value} decimalPlaces={stat.prefix === '$' ? 2 : 0} />
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <span className="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded bg-success/20 text-success">Live</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/swap">
              <ShimmerButton>
                <Flame className="w-5 h-5 mr-2" />
                Start Trading
              </ShimmerButton>
            </Link>

            <motion.a
              href="https://testnet.iopn.tech"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/50 transition-all font-medium"
            >
              Get Testnet OPN
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
