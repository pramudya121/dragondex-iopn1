import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, RefreshCw, Search, Grid, List, Filter, TrendingUp, DollarSign, BarChart3, Percent } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllPairsLength } from '@/hooks/useContract';
import { TOKEN_LIST } from '@/config/contracts';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { cn } from '@/lib/utils';

interface PoolData {
  token0: string;
  token1: string;
  tvl: number;
  apy: number;
  volume24h: number;
  fees24h: number;
  change: number;
  token0Amount: number;
  token1Amount: number;
}

const MOCK_POOLS: PoolData[] = [
  { token0: 'BNB', token1: 'ETH', tvl: 276.66, apy: 15.64, volume24h: 45000, fees24h: 135, change: 1.83, token0Amount: 100.000, token1Amount: 88.988 },
  { token0: 'ETH', token1: 'MON', tvl: 259.43, apy: 7.49, volume24h: 38000, fees24h: 114, change: 2.15, token0Amount: 100.000, token1Amount: 100.000 },
  { token0: 'WOPN', token1: 'ETH', tvl: 248.64, apy: 5.29, volume24h: 32000, fees24h: 96, change: 0.98, token0Amount: 0.01, token1Amount: 101477.87 },
  { token0: 'DRAGON', token1: 'ETH', tvl: 248.64, apy: 6.74, volume24h: 28000, fees24h: 84, change: -2.57, token0Amount: 0.01, token1Amount: 101477.87 },
  { token0: 'BNB', token1: 'MON', tvl: 46.06, apy: 21.57, volume24h: 12000, fees24h: 36, change: -2.02, token0Amount: 100.000, token1Amount: 100.000 },
  { token0: 'BNB', token1: 'HYPE', tvl: 33.50, apy: 17.55, volume24h: 9500, fees24h: 28.5, change: -0.44, token0Amount: 100.000, token1Amount: 100.000 },
  { token0: 'WOPN', token1: 'BNB', tvl: 31.61, apy: 16.97, volume24h: 8800, fees24h: 26.4, change: 1.25, token0Amount: 0.01, token1Amount: 88900.4 },
  { token0: 'DRAGON', token1: 'BNB', tvl: 31.61, apy: 23.49, volume24h: 7500, fees24h: 22.5, change: 4.88, token0Amount: 0.01, token1Amount: 88900.4 },
];

function PoolCard({ pool, index }: { pool: PoolData; index: number }) {
  const token0Info = TOKEN_LIST.find(t => t.symbol === pool.token0);
  const token1Info = TOKEN_LIST.find(t => t.symbol === pool.token1);
  const isPositive = pool.change >= 0;

  return (
    <BackgroundGradient containerClassName="h-full" animate>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 h-full border border-border/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img 
                src={token0Info?.logoURI || '/tokens/opn.jpg'} 
                alt={pool.token0} 
                className="w-8 h-8 rounded-full border-2 border-background"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <img 
                src={token1Info?.logoURI || '/tokens/opn.jpg'} 
                alt={pool.token1} 
                className="w-8 h-8 rounded-full border-2 border-background"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
            </div>
            <div>
              <h3 className="font-bold text-sm">{pool.token0}/{pool.token1}</h3>
              <span className="text-xs text-muted-foreground">0.3%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-success/20 text-success">Active</span>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">APY</span>
              <p className={cn("font-bold text-sm", "text-success")}>{pool.apy}%</p>
            </div>
          </div>
        </div>

        {/* TVL */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">TVL</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">${pool.tvl.toFixed(2)}M</span>
            <span className={cn(
              "text-xs",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? '↑' : '↓'}{Math.abs(pool.change).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Token Amounts */}
        <div className="bg-muted/50 rounded-xl p-3 space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <img 
                src={token0Info?.logoURI || '/tokens/opn.jpg'} 
                alt={pool.token0} 
                className="w-5 h-5 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <span className="text-muted-foreground">{pool.token0}</span>
            </div>
            <span className="font-medium">{pool.token0Amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <img 
                src={token1Info?.logoURI || '/tokens/opn.jpg'} 
                alt={pool.token1} 
                className="w-5 h-5 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <span className="text-muted-foreground">{pool.token1}</span>
            </div>
            <span className="font-medium">{pool.token1Amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Volume & Fees */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p className="font-semibold text-sm">${(pool.volume24h / 1000).toFixed(1)}K</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">24h Fees</p>
            <p className="font-semibold text-sm">${pool.fees24h.toFixed(0)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Details →
          </Button>
          <Link to="/liquidity" className="flex-1">
            <Button size="sm" className="w-full btn-dragon text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Liquidity
            </Button>
          </Link>
        </div>
      </motion.div>
    </BackgroundGradient>
  );
}

export default function Pools() {
  const { data: pairsCount, refetch } = useAllPairsLength();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'active' | 'empty'>('all');

  const pairCount = Number(pairsCount || MOCK_POOLS.length);
  
  // Stats calculations
  const totalTVL = MOCK_POOLS.reduce((acc, p) => acc + p.tvl, 0);
  const avgAPY = MOCK_POOLS.reduce((acc, p) => acc + p.apy, 0) / MOCK_POOLS.length;

  const filteredPools = MOCK_POOLS.filter(pool => {
    const matchesSearch = pool.token0.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pool.token1.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
            ✨ Liquidity Pools
          </span>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">Liquidity Pools</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Explore and provide liquidity to earn trading fees
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden"
          >
            <div className="stat-card flex items-center gap-3">
              <BorderBeam size={60} duration={10} />
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value Locked</p>
                <p className="text-xl font-bold">
                  $<NumberTicker value={totalTVL} decimalPlaces={2} />M
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden"
          >
            <div className="stat-card flex items-center gap-3">
              <BorderBeam size={60} duration={10} delay={1} />
              <div className="p-2 rounded-lg bg-secondary/10">
                <Droplets className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pools</p>
                <p className="text-xl font-bold">
                  <NumberTicker value={pairCount} />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden"
          >
            <div className="stat-card flex items-center gap-3">
              <BorderBeam size={60} duration={10} delay={2} />
              <div className="p-2 rounded-lg bg-success/10">
                <BarChart3 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">24h Volume</p>
                <p className="text-xl font-bold">$0</p>
                <p className="text-xs text-muted-foreground">Estimated from TVL</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative overflow-hidden"
          >
            <div className="stat-card flex items-center gap-3">
              <BorderBeam size={60} duration={10} delay={3} />
              <div className="p-2 rounded-lg bg-accent/10">
                <Percent className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Average APY</p>
                <p className="text-xl font-bold text-success">
                  <NumberTicker value={avgAPY} decimalPlaces={2} suffix="%" />
                </p>
                <p className="text-xs text-muted-foreground">Based on trading fees</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 md:w-64 bg-muted/50"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex bg-muted/50 rounded-lg p-1">
              {['all', 'active', 'empty'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                    filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f === 'all' ? `All` : f}
                </button>
              ))}
            </div>

            <div className="flex bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to="/create-pool">
              <Button className="btn-dragon" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Pool
              </Button>
            </Link>
          </div>
        </div>

        {/* Pool Grid */}
        {filteredPools.length > 0 ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
          )}>
            {filteredPools.map((pool, i) => (
              <PoolCard key={`${pool.token0}-${pool.token1}`} pool={pool} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Droplets className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Pools Found</h3>
            <p className="text-muted-foreground mb-6">Try a different search or create a new pool</p>
            <Link to="/create-pool">
              <Button className="btn-dragon">
                <Plus className="w-4 h-4 mr-2" />
                Create First Pool
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
