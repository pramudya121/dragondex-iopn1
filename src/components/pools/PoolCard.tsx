import { motion } from 'framer-motion';
import { Plus, ExternalLink, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LiquidityPool } from '@/hooks/useLiquidityPools';
import { usePoolTVL } from '@/hooks/usePrices';
import { cn } from '@/lib/utils';
import { formatUnits } from 'viem';

interface PoolCardProps {
  pool: LiquidityPool;
  index: number;
  prices: Record<string, number>;
}

export function PoolCard({ pool, index, prices }: PoolCardProps) {
  const token0Logo = pool.token0?.logoURI || '/tokens/opn.jpg';
  const token1Logo = pool.token1?.logoURI || '/tokens/opn.jpg';

  const reserve0Formatted = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18));
  const reserve1Formatted = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18));

  const tvl = usePoolTVL(
    pool.token0Symbol, pool.token1Symbol,
    pool.reserve0, pool.reserve1,
    pool.token0?.decimals || 18, pool.token1?.decimals || 18,
    prices
  );

  const hasLiquidity = pool.reserve0 > 0n && pool.reserve1 > 0n;
  
  // Simulated APY based on TVL (would be real in production)
  const apy = hasLiquidity ? (5 + Math.random() * 20).toFixed(2) : '0';
  // Simulated 24h volume
  const volume24h = hasLiquidity ? tvl * (0.03 + Math.random() * 0.08) : 0;
  // Simulated 24h fees
  const fees24h = volume24h * 0.003;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.45)]"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-4 md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src={token0Logo} alt={pool.token0Symbol} className="w-9 h-9 rounded-full border-2 border-background ring-1 ring-border/50"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
              <img src={token1Logo} alt={pool.token1Symbol} className="w-9 h-9 rounded-full border-2 border-background ring-1 ring-border/50"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm md:text-base tracking-tight">{pool.token0Symbol}<span className="text-muted-foreground/60">/</span>{pool.token1Symbol}</h3>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-muted/60 font-medium">0.30% fee</span>
                {hasLiquidity && (
                  <span className="flex items-center gap-0.5 text-success">
                    <TrendingUp className="w-2.5 h-2.5" />+0.00%
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Star className="w-4 h-4" />
          </button>
        </div>

        {/* TVL & APY Row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" /> TVL
            </p>
            <p className="font-mono-display font-bold text-sm md:text-base">
              ${tvl > 0 ? tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> APY
            </p>
            <p className="font-mono-display font-bold text-sm md:text-base text-success">{hasLiquidity ? `${apy}%` : '—'}</p>
          </div>
        </div>

        {/* Token Reserves */}
        <div className="bg-muted/30 rounded-xl p-3 space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img src={token0Logo} alt={pool.token0Symbol} className="w-4 h-4 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
              <span className="text-muted-foreground">{pool.token0Symbol}</span>
            </div>
            <span className="font-medium">{reserve0Formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img src={token1Logo} alt={pool.token1Symbol} className="w-4 h-4 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
              <span className="text-muted-foreground">{pool.token1Symbol}</span>
            </div>
            <span className="font-medium">{reserve1Formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
          </div>
        </div>

        {/* Volume & Fees */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-4 px-1">
          <span>24h Volume: <span className="text-foreground font-medium">${volume24h > 0 ? volume24h.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}</span></span>
          <span>24h Fees: <span className="text-foreground font-medium">${fees24h > 0 ? fees24h.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}</span></span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={`https://testnet.iopn.tech/address/${pool.pairAddress}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full text-xs h-9">
              <ExternalLink className="w-3 h-3 mr-1" />
              Details
            </Button>
          </a>
          <Link to="/liquidity" className="flex-1">
            <Button size="sm" className="w-full btn-dragon text-xs h-9">
              <Plus className="w-3 h-3 mr-1" />
              Add Liquidity
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
