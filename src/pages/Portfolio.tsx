import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Coins, ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useTokenBalance, useAllPairsLength } from '@/hooks/useContract';
import { CONTRACTS, TOKEN_LIST } from '@/config/contracts';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { Button } from '@/components/ui/button';
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
    { symbol: 'OPN', name: 'OPN', balance: opnBalance ? formatEther(opnBalance.value) : '0', logo: '/tokens/opn.jpg', price: 1.00 },
    { symbol: 'WOPN', name: 'Wrapped OPN', balance: wopnBalance ? formatEther(wopnBalance) : '0', logo: '/tokens/opn.jpg', price: 1.00 },
    { symbol: 'DRAGON', name: 'Dragon Token', balance: dragonBalance ? formatEther(dragonBalance) : '0', logo: '/tokens/dragon.png', price: 0.25 },
    { symbol: 'BNB', name: 'Binance Coin', balance: bnbBalance ? formatEther(bnbBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', price: 580.00 },
    { symbol: 'ETH', name: 'Ethereum', balance: ethBalance ? formatEther(ethBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', price: 3200.00 },
    { symbol: 'MON', name: 'Monad', balance: monBalance ? formatEther(monBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/33498.png', price: 2.50 },
    { symbol: 'HYPE', name: 'Hyperliquid', balance: hypeBalance ? formatEther(hypeBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png', price: 15.00 },
  ];

  const totalValue = tokens.reduce((acc, token) => {
    return acc + parseFloat(token.balance) * token.price;
  }, 0);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Spotlight className="hidden md:block" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-md mx-auto text-center relative overflow-hidden"
        >
          <BorderBeam size={150} duration={12} />
          <div className="p-4 rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect your wallet to view your portfolio and track your assets</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Portfolio</h1>
          <p className="text-muted-foreground">Track your assets and positions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="stat-card">
              <BorderBeam size={80} duration={10} />
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Balance</span>
              </div>
              <p className="text-3xl font-bold">
                $<NumberTicker value={totalValue} decimalPlaces={2} />
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="stat-card">
              <BorderBeam size={80} duration={10} delay={2} />
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">24h Change</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-success">+$45.23</p>
                <span className="text-success text-sm flex items-center">
                  <ArrowUpRight className="w-4 h-4" />2.4%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="stat-card">
              <BorderBeam size={80} duration={10} delay={4} />
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Assets</span>
              </div>
              <p className="text-3xl font-bold">{tokens.filter(t => parseFloat(t.balance) > 0).length}</p>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mb-4 max-w-4xl mx-auto">
          <Button variant="outline" size="sm" onClick={() => refetchOpn()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Token List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {tokens.map((token, i) => {
            const balance = parseFloat(token.balance);
            const value = balance * token.price;
            const hasBalance = balance > 0.0001;

            return (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <BackgroundGradient 
                  containerClassName={cn("transition-opacity", !hasBalance && "opacity-50")}
                  animate={hasBalance}
                >
                  <div className="glass-card p-4 flex items-center gap-4">
                    <img 
                      src={token.logo} 
                      alt={token.symbol} 
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/tokens/opn.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-sm text-muted-foreground">{token.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{balance.toFixed(4)}</p>
                      <p className="text-sm text-muted-foreground">${value.toFixed(2)}</p>
                    </div>
                    <a
                      href={`https://testnet.iopn.tech/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>
                </BackgroundGradient>
              </motion.div>
            );
          })}
        </div>

        {/* LP Positions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <h2 className="text-xl font-bold mb-4">Liquidity Positions</h2>
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No active liquidity positions found</p>
            <Button className="btn-dragon mt-4">Add Liquidity</Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
