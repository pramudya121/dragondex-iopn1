import { motion, AnimatePresence } from 'framer-motion';
import { Route, ChevronDown, ChevronUp, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { formatUnits } from 'viem';
import { cn } from '@/lib/utils';
import type { SwapRoute } from '@/hooks/useSwapRouter';

interface RouteComparisonProps {
  bestRoute: {
    route: SwapRoute;
    amountsOut: bigint[];
    outputAmount: bigint;
  } | null;
  allRoutes: SwapRoute[];
  allQuotes?: { route: SwapRoute; output: bigint }[];
  toDecimals: number;
  toSymbol: string;
}

export function RouteComparison({ bestRoute, allRoutes, allQuotes, toDecimals, toSymbol }: RouteComparisonProps) {
  const [expanded, setExpanded] = useState(false);

  if (!bestRoute || allRoutes.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm">
          <Route className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">
            {allRoutes.length} routes found
          </span>
          {bestRoute.route.hops > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              Best: Multi-hop
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Routes */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 space-y-2"
          >
            {allQuotes && allQuotes.length > 0 ? (
              allQuotes.map((quote, idx) => {
                const isBest = quote.route.path.join() === bestRoute.route.path.join();
                const outputFormatted = parseFloat(formatUnits(quote.output, toDecimals)).toFixed(6);
                const bestOutput = parseFloat(formatUnits(bestRoute.outputAmount, toDecimals));
                const diff = bestOutput > 0
                  ? ((parseFloat(formatUnits(quote.output, toDecimals)) - bestOutput) / bestOutput * 100)
                  : 0;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-2.5 rounded-lg border transition-colors",
                      isBest
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/50 bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs">
                        {isBest && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                        {quote.route.pathSymbols.map((sym, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-muted-foreground">→</span>}
                            <span className={cn(
                              "font-medium",
                              i > 0 && i < quote.route.pathSymbols.length - 1 ? 'text-primary' : 'text-foreground'
                            )}>
                              {sym}
                            </span>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{outputFormatted} {toSymbol}</span>
                        {!isBest && diff !== 0 && (
                          <span className="text-[10px] text-destructive font-medium">
                            {diff.toFixed(2)}%
                          </span>
                        )}
                        {isBest && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> Best
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {quote.route.hops === 1 ? 'Direct' : `${quote.route.hops} hops`}
                      </span>
                      {quote.route.hops === 1 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> Lower gas
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              allRoutes.map((route, idx) => {
                const isBest = route.path.join() === bestRoute.route.path.join();
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-2.5 rounded-lg border",
                      isBest ? "border-primary/40 bg-primary/10" : "border-border/50 bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      {isBest && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                      {route.pathSymbols.map((sym, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-muted-foreground">→</span>}
                          <span className="font-medium">{sym}</span>
                        </span>
                      ))}
                      {isBest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium ml-auto">Best</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
