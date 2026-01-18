import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, TrendingUp, Plus, RefreshCw, Search, Grid, List, Star, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllPairsLength, useAllPairs, usePairReserves, usePairTokens } from '@/hooks/useContract';
import { TOKEN_LIST, getTokenByAddress } from '@/config/contracts';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { cn } from '@/lib/utils';

interface PoolCardProps {
  pairAddress: `0x${string}`;
  index: number;
}

function PoolCard({ pairAddress, index }: PoolCardProps) {
  const { token0, token1, isLoading: tokensLoading } = usePairTokens(pairAddress);
  const { data: reserves } = usePairReserves(pairAddress);
  
  const token0Info = token0 ? getTokenByAddress(token0) : null;
  const token1Info = token1 ? getTokenByAddress(token1) : null;
  
  const reserve0 = reserves?.[0] ? formatUnits(reserves[0], 18) : '0';
  const reserve1 = reserves?.[1] ? formatUnits(reserves[1], 18) : '0';
  
  // Mock APY for display
  const apy = (Math.random() * 20 + 5).toFixed(2);
  const tvl = (parseFloat(reserve0) * 2 + parseFloat(reserve1) * 2).toFixed(2);
  const isPositive = Math.random() > 0.3;

  if (tokensLoading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-12 bg-muted rounded-lg mb-4" />
        <div className="h-6 bg-muted rounded w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    );
  }

  return (
    <BackgroundGradient containerClassName="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card p-5 h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img 
                src={token0Info?.logoURI || '/tokens/opn.jpg'} 
                alt={token0Info?.symbol} 
                className="w-8 h-8 rounded-full border-2 border-background"
              />
              <img 
                src={token1Info?.logoURI || '/tokens/opn.jpg'} 
                alt={token1Info?.symbol} 
                className="w-8 h-8 rounded-full border-2 border-background"
              />
            </div>
            <div>
              <h3 className="font-bold">{token0Info?.symbol || '???'}/{token1Info?.symbol || '???'}</h3>
              <span className="text-xs text-muted-foreground">Fee: 0.3%</span>
            </div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-lg text-xs font-medium",
            isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
          )}>
            Active
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">TVL</span>
            <span className="font-semibold text-primary">
              ${parseFloat(tvl) > 0 ? parseFloat(tvl).toLocaleString() : '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">APY</span>
            <span className={cn("font-bold", isPositive ? "text-success" : "text-destructive")}>
              {apy}%
            </span>
          </div>
        </div>

        {/* Token Reserves */}
        <div className="bg-muted/50 rounded-xl p-3 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{token0Info?.symbol}</span>
            <span>{parseFloat(reserve0).toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{token1Info?.symbol}</span>
            <span>{parseFloat(reserve1).toFixed(4)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">Details</Button>
          <Button size="sm" className="flex-1 btn-dragon">Add Liquidity</Button>
        </div>
      </motion.div>
    </BackgroundGradient>
  );
}

export default function Pools() {
  const { address, isConnected } = useAccount();
  const { data: pairsCount, refetch } = useAllPairsLength();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pairAddresses, setPairAddresses] = useState<`0x${string}`[]>([]);

  // Fetch pair addresses
  const pairCount = Number(pairsCount || 0);
  
  // Stats
  const totalTVL = 694556130.78;
  const volume24h = 85467650.17;
  const avgAPY = 14.91;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Liquidity Pools</h1>
          <p className="text-muted-foreground">Explore and provide liquidity to earn trading fees</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Pools</p>
            <p className="text-2xl font-bold text-primary">
              <NumberTicker value={pairCount} />
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Total TVL</p>
            <p className="text-2xl font-bold text-success">
              $<NumberTicker value={totalTVL} decimalPlaces={2} />
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
            <p className="text-2xl font-bold text-secondary">
              $<NumberTicker value={volume24h} decimalPlaces={2} />
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Average APY</p>
            <p className="text-2xl font-bold text-accent">
              <NumberTicker value={avgAPY} decimalPlaces={2} suffix="%" />
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex bg-muted rounded-lg p-1">
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
            <Button className="btn-dragon" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Pool
            </Button>
          </div>
        </div>

        {/* Pool Grid */}
        {pairCount > 0 ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {/* Render first few pairs - in real app would paginate */}
            {Array.from({ length: Math.min(pairCount, 6) }).map((_, i) => (
              <PoolCardPlaceholder key={i} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Droplets className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Pools Yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a liquidity pool!</p>
            <Button className="btn-dragon">
              <Plus className="w-4 h-4 mr-2" />
              Create First Pool
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Placeholder component for demo
function PoolCardPlaceholder({ index }: { index: number }) {
  const pairs = [
    { token0: 'WOPN', token1: 'DRAGON', tvl: 345025.36, apy: 7.17 },
    { token0: 'BNB', token1: 'ETH', tvl: 288678555.25, apy: 20.83 },
    { token0: 'MON', token1: 'HYPE', tvl: 85090793.45, apy: 14.89 },
    { token0: 'WOPN', token1: 'BNB', tvl: 17853099.77, apy: 18.40 },
    { token0: 'ETH', token1: 'DRAGON', tvl: 708894.80, apy: 0.84 },
    { token0: 'MON', token1: 'WOPN', tvl: 3424.45, apy: 17.22 },
  ];

  const pair = pairs[index % pairs.length];
  const token0Info = TOKEN_LIST.find(t => t.symbol === pair.token0);
  const token1Info = TOKEN_LIST.find(t => t.symbol === pair.token1);

  return (
    <BackgroundGradient containerClassName="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card p-5 h-full"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src={token0Info?.logoURI} alt={pair.token0} className="w-8 h-8 rounded-full border-2 border-background" />
              <img src={token1Info?.logoURI} alt={pair.token1} className="w-8 h-8 rounded-full border-2 border-background" />
            </div>
            <div>
              <h3 className="font-bold">{pair.token0}/{pair.token1}</h3>
              <span className="text-xs text-muted-foreground">Fee: 0.3%</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-success/20 text-success">Active</span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">TVL</span>
            <span className="font-semibold text-primary">${pair.tvl.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">APY</span>
            <span className="font-bold text-success">{pair.apy}%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">Details</Button>
          <Button size="sm" className="flex-1 btn-dragon">Add Liquidity</Button>
        </div>
      </motion.div>
    </BackgroundGradient>
  );
}
