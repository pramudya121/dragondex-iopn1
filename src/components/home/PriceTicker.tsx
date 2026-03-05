import { Marquee } from '@/components/ui/magic/Marquee';
import { useTokenPrices, BASE_PRICES } from '@/hooks/usePrices';

function PriceTickerItem({ symbol, price, basePrice }: { symbol: string; price: number; basePrice: number }) {
  const change = basePrice > 0 ? ((price - basePrice) / basePrice) * 100 : 0;
  const isPositive = change >= 0;
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border border-border/50 mx-2">
      <span className="font-semibold">{symbol}</span>
      <span className="text-muted-foreground">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      <span className={isPositive ? 'text-success' : 'text-destructive'}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    </div>
  );
}

export function PriceTicker() {
  const { prices, isLoading } = useTokenPrices();

  const tokenList = ['OPN', 'DRAGON', 'BNB', 'ETH', 'MON', 'HYPE'];

  return (
    <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm py-2 overflow-hidden">
      <Marquee pauseOnHover speed={30}>
        {tokenList.map((symbol) => (
          <PriceTickerItem
            key={symbol}
            symbol={symbol}
            price={prices[symbol] || BASE_PRICES[symbol] || 0}
            basePrice={BASE_PRICES[symbol] || 0}
          />
        ))}
      </Marquee>
    </div>
  );
}
