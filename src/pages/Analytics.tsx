import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Users, Layers } from 'lucide-react';
import { useAllPairsLength } from '@/hooks/useContract';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { GlowingStarsBackground } from '@/components/ui/aceternity/GlowingStars';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { StatCardSkeleton, ChartSkeleton, TableRowSkeleton } from '@/components/ui/loading/Skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, prefix = '', suffix = '', change, delay = 0 }: StatCardProps) {
  const isPositive = change && change > 0;
  
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
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg",
              isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
            )}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
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
  const { data: pairsCount, isLoading } = useAllPairsLength();

  const stats = [
    { icon: DollarSign, label: 'Total Value Locked', value: 694556130, prefix: '$', change: 5.2 },
    { icon: Activity, label: '24h Volume', value: 85467650, prefix: '$', change: -2.3 },
    { icon: TrendingUp, label: 'Total Trades', value: 1248763, change: 12.8 },
    { icon: Layers, label: 'Active Pools', value: Number(pairsCount || 0) },
    { icon: Users, label: 'Unique Traders', value: 45892, change: 8.4 },
    { icon: BarChart3, label: 'Avg Trade Size', value: 2450, prefix: '$', change: 3.1 },
  ];

  // Mock chart data
  const chartData = [40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100];

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 relative">
      <Spotlight className="hidden md:block" />
      <GlowingStarsBackground starCount={30} className="opacity-50" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Analytics</h1>
          <p className="text-sm md:text-base text-muted-foreground">Real-time protocol statistics and metrics</p>
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
                change={s.change}
                delay={i * 0.1}
              />
            ))
          )}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Volume Chart */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-4 md:p-6"
            >
              <h3 className="text-base md:text-lg font-semibold mb-4">Volume (7d)</h3>
              <div className="h-40 md:h-48 flex items-end gap-1 md:gap-2">
                {chartData.map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${value}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t-lg relative group cursor-pointer"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                      ${(value * 1000).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] md:text-xs text-muted-foreground">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </motion.div>
          )}

          {/* TVL Chart */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-4 md:p-6"
            >
              <h3 className="text-base md:text-lg font-semibold mb-4">TVL Growth</h3>
              <div className="h-40 md:h-48 relative">
                <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,120 Q30,100 60,90 T120,70 T180,50 T240,40 T300,20"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  <motion.path
                    d="M0,120 Q30,100 60,90 T120,70 T180,50 T240,40 T300,20 V150 H0 Z"
                    fill="url(#tvlGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  />
                </svg>
              </div>
              <div className="flex justify-between mt-4 text-[10px] md:text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
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
          <h3 className="text-base md:text-lg font-semibold mb-4">Top Pools</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">#</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">Pool</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">TVL</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground hidden sm:table-cell">24h Volume</th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">APY</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => <TableRowSkeleton key={i} columns={5} />)
                ) : (
                  [
                    { pool: 'WOPN/DRAGON', tvl: '$345,025', volume: '$12,450', apy: '24.5%' },
                    { pool: 'BNB/ETH', tvl: '$288,678', volume: '$45,230', apy: '18.2%' },
                    { pool: 'MON/HYPE', tvl: '$85,090', volume: '$8,120', apy: '32.1%' },
                    { pool: 'WOPN/BNB', tvl: '$17,853', volume: '$2,340', apy: '15.8%' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{i + 1}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4">
                        <span className="font-medium text-xs md:text-sm">{row.pool}</span>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-right text-xs md:text-sm">{row.tvl}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-right text-xs md:text-sm hidden sm:table-cell">{row.volume}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-right text-xs md:text-sm text-success font-medium">{row.apy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
