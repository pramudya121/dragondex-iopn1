import { useState, useMemo, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

interface SwapPriceChartProps {
  fromSymbol: string;
  toSymbol: string;
  currentPrice: number;
  className?: string;
}

/**
 * Simulates historical price data based on current on-chain price.
 * In production, this would fetch from an indexer or subgraph.
 * We generate realistic-looking price movements using a random walk seeded by the pair.
 */
function generatePriceHistory(currentPrice: number, fromSymbol: string, toSymbol: string, points: number = 24): PriceDataPoint[] {
  if (!currentPrice || currentPrice <= 0) return [];
  
  // Seeded pseudo-random based on pair symbols for consistency
  const seed = (fromSymbol + toSymbol).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let rng = seed;
  const nextRng = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng % 1000) / 1000;
  };

  const data: PriceDataPoint[] = [];
  const now = Date.now();
  const interval = 3600000; // 1 hour
  const volatility = 0.02; // 2% volatility per step

  // Work backwards from current price
  let price = currentPrice;
  const prices: number[] = [price];
  
  for (let i = 1; i < points; i++) {
    const change = (nextRng() - 0.48) * volatility * price; // slight upward bias
    price = Math.max(price - change, currentPrice * 0.8);
    prices.unshift(price);
  }

  for (let i = 0; i < points; i++) {
    const ts = now - (points - 1 - i) * interval;
    const date = new Date(ts);
    data.push({
      time: `${date.getHours().toString().padStart(2, '0')}:00`,
      price: prices[i],
      timestamp: ts,
    });
  }

  return data;
}

const CustomTooltip = ({ active, payload, fromSymbol, toSymbol }: any) => {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{data.time}</p>
      <p className="text-sm font-bold">
        1 {fromSymbol} = {data.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} {toSymbol}
      </p>
    </div>
  );
};

export function SwapPriceChart({ fromSymbol, toSymbol, currentPrice, className }: SwapPriceChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D'>('24H');

  const points = timeframe === '1H' ? 12 : timeframe === '24H' ? 24 : 48;

  const priceData = useMemo(() => {
    return generatePriceHistory(currentPrice, fromSymbol, toSymbol, points);
  }, [currentPrice, fromSymbol, toSymbol, points]);

  const priceChange = useMemo(() => {
    if (priceData.length < 2) return { value: 0, percent: 0, isPositive: true };
    const first = priceData[0].price;
    const last = priceData[priceData.length - 1].price;
    const change = last - first;
    const percent = (change / first) * 100;
    return { value: change, percent, isPositive: change >= 0 };
  }, [priceData]);

  const { minPrice, maxPrice } = useMemo(() => {
    if (priceData.length === 0) return { minPrice: 0, maxPrice: 0 };
    const prices = priceData.map(d => d.price);
    return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
  }, [priceData]);

  if (!currentPrice || currentPrice <= 0) return null;

  const chartColor = priceChange.isPositive ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)';

  return (
    <motion.div
      layout
      className={cn("glass-card overflow-hidden transition-all", className)}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            1 {fromSymbol} = {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} {toSymbol}
          </span>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          priceChange.isPositive ? "text-success" : "text-destructive"
        )}>
          {priceChange.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
        </div>
      </button>

      {/* Expandable Chart */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Timeframe Selector */}
            <div className="px-3 pb-2 flex items-center gap-1">
              {(['1H', '24H', '7D'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={(e) => { e.stopPropagation(); setTimeframe(tf); }}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors font-medium",
                    timeframe === tf ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tf}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                Simulated
              </div>
            </div>

            {/* Chart */}
            <div className="h-40 px-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[minPrice * 0.995, maxPrice * 1.005]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                    tickFormatter={(v) => v < 1 ? v.toFixed(4) : v < 100 ? v.toFixed(2) : v.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip fromSymbol={fromSymbol} toSymbol={toSymbol} />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Row */}
            <div className="px-3 pb-3 pt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Low: {minPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}</span>
              <span>High: {maxPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
