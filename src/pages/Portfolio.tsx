import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Coins, ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw, PieChart, Activity, Zap, Crown, Shield } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useTokenBalance } from '@/hooks/useContract';
import { CONTRACTS, TOKEN_LIST } from '@/config/contracts';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { GlowingStarsCard } from '@/components/ui/aceternity/GlowingStars';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { data: opnBalance, refetch: refetchOpn } = useBalance({ address });
  const { data: wopnBalance } = useTokenBalance(CONTRACTS.WETH as `0x${string}`, address);
  const { data: dragonBalance } = useTokenBalance(CONTRACTS.DRAGON as `0x${string}`, address);
  const { data: bnbBalance } = useTokenBalance(CONTRACTS.BNB as `0x${string}`, address);
  const { data: ethBalance } = useTokenBalance(CONTRACTS.ETH as `0x${string}`, address);
  const { data: monBalance } = useTokenBalance(CONTRACTS.MON as `0x${string}`, address);
  const { data: hypeBalance } = useTokenBalance(CONTRACTS.HYPE as `0x${string}`, address);

  const tokens = [
    { symbol: 'OPN', name: 'OPN', balance: opnBalance ? formatEther(opnBalance.value) : '0', logo: '/tokens/opn.jpg', price: 1.00, change: 2.4 },
    { symbol: 'WOPN', name: 'Wrapped OPN', balance: wopnBalance ? formatEther(wopnBalance) : '0', logo: '/tokens/opn.jpg', price: 1.00, change: 2.4 },
    { symbol: 'DRAGON', name: 'Dragon Token', balance: dragonBalance ? formatEther(dragonBalance) : '0', logo: '/tokens/dragon.png', price: 0.25, change: 5.8 },
    { symbol: 'BNB', name: 'Binance Coin', balance: bnbBalance ? formatEther(bnbBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', price: 580.00, change: -1.2 },
    { symbol: 'ETH', name: 'Ethereum', balance: ethBalance ? formatEther(ethBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', price: 3200.00, change: 3.1 },
    { symbol: 'MON', name: 'Monad', balance: monBalance ? formatEther(monBalance) : '0', logo: '/tokens/mon.jpg', price: 2.50, change: 12.5 },
    { symbol: 'HYPE', name: 'Hyperliquid', balance: hypeBalance ? formatEther(hypeBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png', price: 15.00, change: -0.8 },
  ];

  const totalValue = tokens.reduce((acc, token) => acc + parseFloat(token.balance) * token.price, 0);
  const tokensWithBalance = tokens.filter(t => parseFloat(t.balance) > 0.0001);
  const totalChange = tokens.reduce((acc, token) => {
    const value = parseFloat(token.balance) * token.price;
    return acc + (value * token.change / 100);
  }, 0);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Spotlight className="hidden md:block" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlowingStarsCard className="max-w-md mx-auto bg-card border border-border">
            <div className="text-center p-8">
              <div className="p-4 rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">Connect your wallet to view your portfolio and track your assets</p>
            </div>
          </GlowingStarsCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        {/* Premium Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 mb-4"
          >
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Premium Portfolio</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">Your Portfolio</h1>
          <p className="text-muted-foreground">Track your assets and positions on OPN Testnet</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
          {/* Total Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 relative"
          >
            <BackgroundGradient containerClassName="h-full" animate>
              <div className="glass-card p-6 h-full">
                <BorderBeam size={100} duration={10} />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                    <Coins className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-3xl font-bold">
                      $<NumberTicker value={totalValue} decimalPlaces={2} />
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  totalChange >= 0 ? "text-success" : "text-destructive"
                )}>
                  {totalChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>${Math.abs(totalChange).toFixed(2)} ({((totalChange / totalValue) * 100).toFixed(2) || 0}%)</span>
                  <span className="text-muted-foreground">24h</span>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="stat-card h-full flex flex-col justify-center">
              <BorderBeam size={80} duration={10} delay={2} />
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">24h Change</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-success">+$45.23</p>
              </div>
              <span className="text-success text-sm flex items-center">
                <ArrowUpRight className="w-4 h-4" />2.4%
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="stat-card h-full flex flex-col justify-center">
              <BorderBeam size={80} duration={10} delay={4} />
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Assets</span>
              </div>
              <p className="text-2xl font-bold">{tokensWithBalance.length}</p>
              <span className="text-muted-foreground text-sm">Active tokens</span>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchOpn()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Balances
          </Button>
        </div>

        {/* Token List */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Your Assets
            </h2>
          </div>

          <div className="grid gap-3">
            {tokens.map((token, i) => {
              const balance = parseFloat(token.balance);
              const value = balance * token.price;
              const hasBalance = balance > 0.0001;
              const isPositive = token.change >= 0;

              return (
                <motion.div
                  key={token.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <div className={cn(
                    "glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all",
                    !hasBalance && "opacity-50"
                  )}>
                    <img 
                      src={token.logo} 
                      alt={token.symbol} 
                      className="w-12 h-12 rounded-full border-2 border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/tokens/opn.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{token.symbol}</p>
                        {hasBalance && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                          )}>
                            {isPositive ? '+' : ''}{token.change}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{token.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                      <p className="text-sm text-muted-foreground">${value.toFixed(2)}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">@ ${token.price}</span>
                      <a
                        href={`https://testnet.iopn.tech/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* LP Positions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-5xl mx-auto"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" />
            Liquidity Positions
          </h2>
          <GlowingStarsCard className="bg-card border border-border">
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No active liquidity positions found</p>
              <Link to="/liquidity">
                <Button className="btn-dragon">
                  <Zap className="w-4 h-4 mr-2" />
                  Add Liquidity
                </Button>
              </Link>
            </div>
          </GlowingStarsCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
