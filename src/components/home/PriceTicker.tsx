 import { Marquee } from '@/components/ui/magic/Marquee';
 
 const priceData = [
   { symbol: 'OPN', price: 1.00, change: 2.5 },
   { symbol: 'DRAGON', price: 0.25, change: 12.3 },
   { symbol: 'BNB', price: 580.00, change: -1.2 },
   { symbol: 'ETH', price: 3200.00, change: 3.8 },
   { symbol: 'MON', price: 2.50, change: 8.4 },
   { symbol: 'HYPE', price: 15.00, change: -0.5 },
 ];
 
 function PriceTickerItem({ symbol, price, change }: { symbol: string; price: number; change: number }) {
   const isPositive = change > 0;
   return (
     <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border border-border/50 mx-2">
       <span className="font-semibold">{symbol}</span>
       <span className="text-muted-foreground">${price.toLocaleString()}</span>
       <span className={isPositive ? 'text-success' : 'text-destructive'}>
         {isPositive ? '+' : ''}{change}%
       </span>
     </div>
   );
 }
 
 export function PriceTicker() {
   return (
     <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm py-2 overflow-hidden">
       <Marquee pauseOnHover speed={30}>
         {priceData.map((token) => (
           <PriceTickerItem key={token.symbol} {...token} />
         ))}
       </Marquee>
     </div>
   );
 }