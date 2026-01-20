import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, RefreshCw, Search, Grid, List, TrendingUp, DollarSign, BarChart3, Percent, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLiquidityPools, LiquidityPool } from '@/hooks/useLiquidityPools';
import { TOKEN_LIST } from '@/config/contracts';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { cn } from '@/lib/utils';
import { formatUnits } from 'viem';

function PoolCard({ pool, index }: { pool: LiquidityPool; index: number }) {
  const token0Logo = pool.token0?.logoURI || '/tokens/opn.jpg';
  const token1Logo = pool.token1?.logoURI || '/tokens/opn.jpg';

  // Format reserves
  const reserve0Formatted = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18));
  const reserve1Formatted = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18));
  const totalSupplyFormatted = parseFloat(formatUnits(pool.totalSupply, 18));

  // Estimate TVL (simplified - would need price data for accurate calculation)
  const hasLiquidity = pool.reserve0 > 0n && pool.reserve1 > 0n;

  return (
    <BackgroundGradient containerClassName="h-full" animate>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-card/95 backdrop-blur-sm rounded-2xl p-5 h-full border border-border/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img 
                src={token0Logo} 
                alt={pool.token0Symbol} 
                className="w-10 h-10 rounded-full border-2 border-background"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <img 
                src={token1Logo} 
                alt={pool.token1Symbol} 
                className="w-10 h-10 rounded-full border-2 border-background"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{pool.token0Symbol}/{pool.token1Symbol}</h3>
              <span className="text-xs text-muted-foreground">Fee: 0.3%</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              hasLiquidity ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
            )}>
              {hasLiquidity ? 'Active' : 'Empty'}
            </span>
          </div>
        </div>

        {/* Reserves */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={token0Logo} 
                alt={pool.token0Symbol} 
                className="w-6 h-6 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <span className="text-sm text-muted-foreground">{pool.token0Symbol}</span>
            </div>
            <span className="font-semibold">
              {reserve0Formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={token1Logo} 
                alt={pool.token1Symbol} 
                className="w-6 h-6 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
              />
              <span className="text-sm text-muted-foreground">{pool.token1Symbol}</span>
            </div>
            <span className="font-semibold">
              {reserve1Formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
            <p className="font-semibold text-sm">
              {totalSupplyFormatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className={cn(
              "font-semibold text-sm",
              hasLiquidity ? "text-success" : "text-muted-foreground"
            )}>
              {hasLiquidity ? 'Has Liquidity' : 'No Liquidity'}
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
              View Contract
            </Button>
          </a>
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
  const { pools, pairCount, isLoading, refetch } = useLiquidityPools();
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
            Explore and provide liquidity to earn trading fees on OPN Testnet
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
                <Droplets className="w-5 h-5 text-primary" />
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
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden"
          >
            <div className="stat-card flex items-center gap-3">
              <BorderBeam size={60} duration={10} delay={1} />
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Pools</p>
                <p className="text-xl font-bold text-success">
                  <NumberTicker value={activePools} />
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
              <div className="p-2 rounded-lg bg-secondary/10">
                <BarChart3 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tokens Listed</p>
                <p className="text-xl font-bold">
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
            <div className="stat-card flex items-center gap-3">
              <BorderBeam size={60} duration={10} delay={3} />
              <div className="p-2 rounded-lg bg-accent/10">
                <Percent className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pool Fee</p>
                <p className="text-xl font-bold">0.3%</p>
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

        {/* Loading State */}
        {isLoading ? (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-xl font-bold mb-2">Loading Pools</h3>
            <p className="text-muted-foreground">Fetching data from blockchain...</p>
          </div>
        ) : filteredPools.length > 0 ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
          )}>
            {filteredPools.map((pool, i) => (
              <PoolCard key={pool.pairAddress} pool={pool} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Droplets className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-bold mb-2">
              {pairCount === 0 ? 'No Pools Yet' : 'No Pools Found'}
            </h3>
            <p className="text-muted-foreground mb-6">
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
