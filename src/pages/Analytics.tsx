import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Users, Layers, Droplets, ExternalLink, RefreshCw } from 'lucide-react';
import { useLiquidityPools } from '@/hooks/useLiquidityPools';
import { useTokenPrices } from '@/hooks/usePrices';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { GlowingStarsBackground } from '@/components/ui/aceternity/GlowingStars';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { StatCardSkeleton, ChartSkeleton, TableRowSkeleton } from '@/components/ui/loading/Skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatUnits } from 'viem';
import { TOKEN_LIST } from '@/config/contracts';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  isOnChain?: boolean;
}

function StatCard({ icon: Icon, label, value, prefix = '', suffix = '', delay = 0, isOnChain }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden"
    >
      <div className="stat-card relative">
        <BorderBeam size={100} duration={10} delay={delay * 2} />
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className="p-1.5 md:p-2 rounded-xl bg-primary/10">
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          {isOnChain && (
            <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">
              On-Chain
            </span>
          )}
        </div>
        <p className="text-[10px] md:text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-xl md:text-2xl lg:text-3xl font-bold">
          <NumberTicker value={value} prefix={prefix} suffix={suffix} delay={delay} decimalPlaces={value < 100 ? 2 : 0} />
        </p>
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const { pools, pairCount, isLoading, refetch } = useLiquidityPools();
  const { prices } = useTokenPrices();

  // Calculate real TVL from on-chain reserves
  const totalTVL = useMemo(() => {
    return pools.reduce((acc, pool) => {
      const price0 = prices[pool.token0Symbol] || 0;
      const price1 = prices[pool.token1Symbol] || 0;
      const value0 = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18)) * price0;
      const value1 = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18)) * price1;
      return acc + value0 + value1;
    }, 0);
  }, [pools, prices]);

  // Active pools with liquidity
  const activePools = useMemo(() => {
    return pools.filter(p => p.reserve0 > 0n && p.reserve1 > 0n).length;
  }, [pools]);

  // Unique tokens across all pools
  const uniqueTokens = useMemo(() => {
    const tokenSet = new Set<string>();
    pools.forEach(p => {
      tokenSet.add(p.token0Address.toLowerCase());
      tokenSet.add(p.token1Address.toLowerCase());
    });
    return tokenSet.size;
  }, [pools]);

  // Top pools sorted by TVL
  const topPools = useMemo(() => {
    return pools
      .map(pool => {
        const price0 = prices[pool.token0Symbol] || 0;
        const price1 = prices[pool.token1Symbol] || 0;
        const value0 = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18)) * price0;
        const value1 = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18)) * price1;
        const tvl = value0 + value1;
        const reserve0F = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18));
        const reserve1F = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18));
        return { ...pool, tvl, reserve0F, reserve1F };
      })
      .filter(p => p.reserve0 > 0n && p.reserve1 > 0n)
      .sort((a, b) => b.tvl - a.tvl);
  }, [pools, prices]);

  // Pool reserve chart data (bar chart showing each pool's reserves)
  const chartPools = topPools.slice(0, 7);
  const maxTVL = Math.max(...chartPools.map(p => p.tvl), 1);

  const stats = [
    { icon: DollarSign, label: 'Total Value Locked', value: totalTVL, prefix: '$', isOnChain: true },
    { icon: Layers, label: 'Total Pools', value: pairCount, isOnChain: true },
    { icon: Activity, label: 'Active Pools', value: activePools, isOnChain: true },
    { icon: BarChart3, label: 'Listed Tokens', value: TOKEN_LIST.length, isOnChain: true },
    { icon: Users, label: 'Unique Tokens in Pools', value: uniqueTokens, isOnChain: true },
    { icon: TrendingUp, label: 'Pool Fee', value: 0.3, suffix: '%', isOnChain: true },
  ];

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-24 lg:pb-8 relative">
      <Spotlight className="hidden md:block" />
      <GlowingStarsBackground starCount={30} className="opacity-50" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-3"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Protocol Analytics</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Analytics</h1>
          <p className="text-sm md:text-base text-muted-foreground">Real-time on-chain protocol statistics from OPN Testnet</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3" disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh Data
          </Button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {isLoading ? (
            [...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            stats.map((s, i) => (
              <StatCard 
                key={s.label}
                icon={s.icon} 
                label={s.label} 
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                isOnChain={s.isOnChain}
                delay={i * 0.1}
              />
            ))
          )}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Pool TVL Chart */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold">Pool TVL Distribution</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success">Live</span>
              </div>
              {chartPools.length > 0 ? (
                <>
                  <div className="h-40 md:h-48 flex items-end gap-1 md:gap-2">
                    {chartPools.map((pool, i) => {
                      const pct = maxTVL > 0 ? (pool.tvl / maxTVL) * 100 : 0;
                      return (
                        <motion.div
                          key={pool.pairAddress}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(pct, 5)}%` }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t-lg relative group cursor-pointer"
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                            {pool.token0Symbol}/{pool.token1Symbol}: ${pool.tvl.toFixed(2)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-4 text-[9px] md:text-xs text-muted-foreground">
                    {chartPools.map(p => (
                      <span key={p.pairAddress} className="truncate px-0.5">
                        {p.token0Symbol}/{p.token1Symbol}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-40 md:h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No active pools with liquidity
                </div>
              )}
            </motion.div>
          )}

          {/* Pool Reserves Overview */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold">Pool Reserves</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success">On-Chain</span>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {topPools.length > 0 ? topPools.map((pool, i) => (
                  <motion.div
                    key={pool.pairAddress}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="bg-muted/30 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          <img src={pool.token0?.logoURI || '/tokens/opn.jpg'} alt="" className="w-5 h-5 rounded-full border border-background" onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
                          <img src={pool.token1?.logoURI || '/tokens/opn.jpg'} alt="" className="w-5 h-5 rounded-full border border-background" onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
                        </div>
                        <span className="text-xs font-medium">{pool.token0Symbol}/{pool.token1Symbol}</span>
                      </div>
                      {pool.tvl > 0 && <span className="text-xs text-success font-medium">${pool.tvl.toFixed(2)}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>{pool.reserve0F.toLocaleString(undefined, { maximumFractionDigits: 4 })} {pool.token0Symbol}</span>
                      <span className="text-right">{pool.reserve1F.toLocaleString(undefined, { maximumFractionDigits: 4 })} {pool.token1Symbol}</span>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No active pools found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Top Pools Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-4 md:p-6 mt-4 md:mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold">All Pools</h3>
            <span className="text-xs text-muted-foreground">{pools.length} pools on-chain</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">#</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Pool</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Reserve 0</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground hidden sm:table-cell">Reserve 1</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">TVL</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground hidden lg:table-cell">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} columns={7} />)
                ) : pools.length > 0 ? (
                  [...pools]
                    .sort((a, b) => {
                      const tvlA = (parseFloat(formatUnits(a.reserve0, a.token0?.decimals || 18)) * (prices[a.token0Symbol] || 0)) + (parseFloat(formatUnits(a.reserve1, a.token1?.decimals || 18)) * (prices[a.token1Symbol] || 0));
                      const tvlB = (parseFloat(formatUnits(b.reserve0, b.token0?.decimals || 18)) * (prices[b.token0Symbol] || 0)) + (parseFloat(formatUnits(b.reserve1, b.token1?.decimals || 18)) * (prices[b.token1Symbol] || 0));
                      return tvlB - tvlA;
                    })
                    .map((pool, i) => {
                      const res0 = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18));
                      const res1 = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18));
                      const tvl = (res0 * (prices[pool.token0Symbol] || 0)) + (res1 * (prices[pool.token1Symbol] || 0));
                      const hasLiq = pool.reserve0 > 0n && pool.reserve1 > 0n;
                      return (
                        <tr key={pool.pairAddress} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{i + 1}</td>
                          <td className="py-2 md:py-3 px-2 md:px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                <img src={pool.token0?.logoURI || '/tokens/opn.jpg'} alt="" className="w-5 h-5 rounded-full border border-background" onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
                                <img src={pool.token1?.logoURI || '/tokens/opn.jpg'} alt="" className="w-5 h-5 rounded-full border border-background" onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
                              </div>
                              <span className="font-medium text-xs md:text-sm">{pool.token0Symbol}/{pool.token1Symbol}</span>
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-right text-xs md:text-sm">
                            {res0.toLocaleString(undefined, { maximumFractionDigits: 4 })} {pool.token0Symbol}
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-right text-xs md:text-sm hidden sm:table-cell">
                            {res1.toLocaleString(undefined, { maximumFractionDigits: 4 })} {pool.token1Symbol}
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-right text-xs md:text-sm font-medium">
                            {tvl > 0 ? `$${tvl.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden md:table-cell">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              hasLiq ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                            )}>
                              {hasLiq ? 'Active' : 'Empty'}
                            </span>
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden lg:table-cell">
                            <a href={`https://testnet.iopn.tech/address/${pool.pairAddress}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">No pools found on-chain</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
