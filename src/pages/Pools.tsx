import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, RefreshCw, Search, Grid, List, DollarSign, BarChart3, Percent, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLiquidityPools, LiquidityPool } from '@/hooks/useLiquidityPools';
import { useTokenPrices, usePoolTVL } from '@/hooks/usePrices';
import { TOKEN_LIST } from '@/config/contracts';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { PoolCardSkeleton, StatCardSkeleton } from '@/components/ui/loading/Skeleton';
import { cn } from '@/lib/utils';
import { formatUnits } from 'viem';

function PoolCard({ pool, index, prices }: { pool: LiquidityPool; index: number; prices: Record<string, number> }) {
  const token0Logo = pool.token0?.logoURI || '/tokens/opn.jpg';
  const token1Logo = pool.token1?.logoURI || '/tokens/opn.jpg';

  // Format reserves
  const reserve0Formatted = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18));
  const reserve1Formatted = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18));
  const totalSupplyFormatted = parseFloat(formatUnits(pool.totalSupply, 18));

  // Calculate TVL with prices
  const tvl = usePoolTVL(
    pool.token0Symbol,
    pool.token1Symbol,
    pool.reserve0,
    pool.reserve1,
    pool.token0?.decimals || 18,
    pool.token1?.decimals || 18,
    prices
  );

  const hasLiquidity = pool.reserve0 > 0n && pool.reserve1 > 0n;

  return (
    <BackgroundGradient containerClassName="h-full" animate>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 md:p-5 h-full border border-border/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img 
                src={token0Logo} 
                alt={pool.token0Symbol} 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <img 
                src={token1Logo} 
                alt={pool.token1Symbol} 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">{pool.token0Symbol}/{pool.token1Symbol}</h3>
              <span className="text-xs text-muted-foreground">Fee: 0.3%</span>
            </div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            hasLiquidity ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
          )}>
            {hasLiquidity ? 'Active' : 'Empty'}
          </span>
        </div>

        {/* TVL */}
        {hasLiquidity && tvl > 0 && (
          <div className="bg-primary/10 rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Value Locked</p>
            <p className="text-lg md:text-xl font-bold text-primary">
              ${tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Reserves */}
        <div className="bg-muted/40 rounded-xl p-3 space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <img 
                src={token0Logo} 
                alt={pool.token0Symbol} 
                className="w-4 h-4 md:w-5 md:h-5 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <span className="text-muted-foreground text-xs md:text-sm">{pool.token0Symbol}</span>
            </div>
            <span className="font-medium text-xs md:text-sm">
              {reserve0Formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <img 
                src={token1Logo} 
                alt={pool.token1Symbol} 
                className="w-4 h-4 md:w-5 md:h-5 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <span className="text-muted-foreground text-xs md:text-sm">{pool.token1Symbol}</span>
            </div>
            <span className="font-medium text-xs md:text-sm">
              {reserve1Formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">LP Supply</p>
            <p className="font-semibold text-xs md:text-sm">
              {totalSupplyFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">APR</p>
            <p className="font-semibold text-xs md:text-sm text-success">
              {hasLiquidity ? '~12.5%' : '-'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a 
            href={`https://testnet.iopn.tech/address/${pool.pairAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Contract
            </Button>
          </a>
          <Link to="/liquidity" className="flex-1">
            <Button size="sm" className="w-full btn-dragon text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </Link>
        </div>
      </motion.div>
    </BackgroundGradient>
  );
}

export default function Pools() {
  const { pools, pairCount, isLoading, refetch } = useLiquidityPools();
  const { prices } = useTokenPrices();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'active' | 'empty'>('all');

  const filteredPools = pools.filter(pool => {
    const matchesSearch = 
      pool.token0Symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.token1Symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.pairAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'active') {
      return matchesSearch && pool.reserve0 > 0n && pool.reserve1 > 0n;
    }
    if (filter === 'empty') {
      return matchesSearch && (pool.reserve0 === 0n || pool.reserve1 === 0n);
    }
    return matchesSearch;
  });

  const activePools = pools.filter(p => p.reserve0 > 0n && p.reserve1 > 0n).length;

  // Calculate total TVL
  const totalTVL = useMemo(() => {
    return pools.reduce((acc, pool) => {
      const price0 = prices[pool.token0Symbol] || 0;
      const price1 = prices[pool.token1Symbol] || 0;
      const value0 = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18)) * price0;
      const value1 = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18)) * price1;
      return acc + value0 + value1;
    }, 0);
  }, [pools, prices]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-24 lg:pb-8 relative min-h-screen">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm mb-3 md:mb-4">
            ✨ Liquidity Pools
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-2 md:mb-3">Liquidity Pools</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Explore and provide liquidity to earn trading fees on OPN Testnet
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden"
              >
                <div className="stat-card flex items-center gap-2 md:gap-3">
                  <BorderBeam size={60} duration={10} />
                  <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                    <Droplets className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Total Pools</p>
                    <p className="text-lg md:text-xl font-bold">
                      <NumberTicker value={pairCount} />
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
                <div className="stat-card flex items-center gap-2 md:gap-3">
                  <BorderBeam size={60} duration={10} delay={1} />
                  <div className="p-1.5 md:p-2 rounded-lg bg-success/10">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Total TVL</p>
                    <p className="text-lg md:text-xl font-bold text-success">
                      ${totalTVL > 0 ? totalTVL.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
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
                <div className="stat-card flex items-center gap-2 md:gap-3">
                  <BorderBeam size={60} duration={10} delay={2} />
                  <div className="p-1.5 md:p-2 rounded-lg bg-secondary/10">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Tokens</p>
                    <p className="text-lg md:text-xl font-bold">
                      <NumberTicker value={TOKEN_LIST.length} />
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative overflow-hidden"
              >
                <div className="stat-card flex items-center gap-2 md:gap-3">
                  <BorderBeam size={60} duration={10} delay={3} />
                  <div className="p-1.5 md:p-2 rounded-lg bg-accent/10">
                    <Percent className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Pool Fee</p>
                    <p className="text-lg md:text-xl font-bold">0.3%</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-48 lg:w-64 bg-muted/50"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex bg-muted/50 rounded-lg p-1">
              {['all', 'active', 'empty'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-2 md:px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                    filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f}
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
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
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

        {/* Loading State with Skeletons */}
        {isLoading ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
          )}>
            {[...Array(8)].map((_, i) => (
              <PoolCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPools.length > 0 ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
          )}>
            {filteredPools.map((pool, i) => (
              <PoolCard key={pool.pairAddress} pool={pool} index={i} prices={prices} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 md:p-12 text-center">
            <Droplets className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-lg md:text-xl font-bold mb-2">
              {pairCount === 0 ? 'No Pools Yet' : 'No Pools Found'}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              {pairCount === 0 
                ? 'Be the first to create a liquidity pool!' 
                : 'Try a different search or filter'}
            </p>
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
