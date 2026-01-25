import { motion } from 'framer-motion';
import { SwapCard } from '@/components/swap/SwapCard';
import { Flame, TrendingUp, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { ShimmerButton } from '@/components/ui/magic/ShimmerButton';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { Marquee } from '@/components/ui/magic/Marquee';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { RotatingLogo } from '@/components/ui/premium/RotatingLogo';
import { HoverEffect } from '@/components/ui/aceternity/HoverEffect';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { useAllPairsLength } from '@/hooks/useContract';
import dragonLogo from '@/assets/dragon-logo.png';

const features = [
  { 
    icon: <Zap className="w-6 h-6" />, 
    title: 'Instant Swaps', 
    description: 'Lightning-fast trades powered by automated market makers on OPN Testnet' 
  },
  { 
    icon: <Shield className="w-6 h-6" />, 
    title: 'Battle-Tested Security', 
    description: 'Audited smart contracts with reentrancy guards and comprehensive validation' 
  },
  { 
    icon: <TrendingUp className="w-6 h-6" />, 
    title: 'Best Rates', 
    description: 'Optimal pricing through our advanced AMM algorithm with minimal slippage' 
  },
  { 
    icon: <Users className="w-6 h-6" />, 
    title: 'Earn Rewards', 
    description: 'Provide liquidity and earn 0.3% on every trade in your pools' 
  },
  { 
    icon: <BarChart3 className="w-6 h-6" />, 
    title: 'Real Analytics', 
    description: 'Track your positions, volume, and returns with our comprehensive dashboard' 
  },
  { 
    icon: <Flame className="w-6 h-6" />, 
    title: 'Dragon Power', 
    description: 'Unleash the power of decentralized finance on OPN Testnet' 
  },
];

// Mock price data for marquee
const priceData = [
  { symbol: 'OPN', price: 1.00, change: 2.5 },
  { symbol: 'DRAGON', price: 0.25, change: 12.3 },
  { symbol: 'BNB', price: 580.00, change: -1.2 },
  { symbol: 'ETH', price: 3200.00, change: 3.8 },
  { symbol: 'MON', price: 2.50, change: 8.4 },
  { symbol: 'HYPE', price: 15.00, change: -0.5 },
];

function PriceTicker({ symbol, price, change }: { symbol: string; price: number; change: number }) {
  const isPositive = change > 0;
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border border-border/50">
      <span className="font-semibold">{symbol}</span>
      <span className="text-muted-foreground">${price.toLocaleString()}</span>
      <span className={isPositive ? 'text-success' : 'text-destructive'}>
        {isPositive ? '+' : ''}{change}%
      </span>
    </div>
  );
}

export default function Index() {
  const { data: pairsCount } = useAllPairsLength();

  return (
    <div className="relative min-h-screen">
      <Spotlight className="hidden md:block" />
      
      {/* Price Ticker Marquee */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm py-2 overflow-hidden">
        <Marquee pauseOnHover speed={30}>
          {priceData.map((token) => (
            <PriceTicker key={token.symbol} {...token} />
          ))}
        </Marquee>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6">
            <RotatingLogo src={dragonLogo} alt="DragonDEX" size={60} className="md:w-20 md:h-20" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black gradient-text dragon-glow-text">
              DRAGONDEX
            </h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            The premier decentralized exchange on OPN Testnet. 
            Swap, provide liquidity, and earn with the power of the dragon.
          </motion.p>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8"
          >
            <div className="stat-card text-center relative overflow-hidden">
              <BorderBeam size={60} duration={10} />
              <p className="text-2xl md:text-3xl font-bold text-primary">
                $<NumberTicker value={694556130} />
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Value Locked</p>
            </div>
            <div className="stat-card text-center relative overflow-hidden">
              <BorderBeam size={60} duration={10} delay={1} />
              <p className="text-2xl md:text-3xl font-bold text-secondary">
                <NumberTicker value={Number(pairsCount || 0)} />
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Active Pools</p>
            </div>
            <div className="stat-card text-center relative overflow-hidden">
              <BorderBeam size={60} duration={10} delay={2} />
              <p className="text-2xl md:text-3xl font-bold text-accent">
                <NumberTicker value={45892} />
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Traders</p>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <ShimmerButton onClick={() => document.getElementById('swap-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <Flame className="w-5 h-5 mr-2" />
              Start Trading
            </ShimmerButton>
            <motion.a
              href="https://testnet.iopn.tech"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 md:px-6 py-3 rounded-xl border border-border hover:border-primary/50 transition-colors font-medium text-sm md:text-base"
            >
              Get Testnet OPN
            </motion.a>
          </div>
        </motion.div>

        {/* Swap Card - Centered */}
        <div id="swap-section" className="flex justify-center mb-16 md:mb-24">
          <SwapCard />
        </div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }} 
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Why DRAGONDEX?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for speed, security, and simplicity. Experience DeFi the way it should be.
            </p>
          </div>
          <HoverEffect items={features} />
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 md:mt-24 text-center"
        >
          <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <div className="relative z-10">
              <Flame className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl md:text-2xl font-bold mb-4">Ready to breathe fire?</h3>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                Join thousands of traders on the most powerful DEX on OPN Testnet
              </p>
              <ShimmerButton onClick={() => document.getElementById('swap-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Launch App
              </ShimmerButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
