import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Coins, ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw, PieChart, Activity, Zap, Crown, Shield, History, Droplets } from 'lucide-react';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useTokenBalance } from '@/hooks/useContract';
import { CONTRACTS, TOKEN_LIST } from '@/config/contracts';
import { useLiquidityPools } from '@/hooks/useLiquidityPools';
import { useTokenPrices } from '@/hooks/usePrices';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { GlowingStarsCard } from '@/components/ui/aceternity/GlowingStars';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AssetCardSkeleton, StatCardSkeleton } from '@/components/ui/loading/Skeleton';
import { TransactionHistory, useTransactionHistory } from '@/components/history/TransactionHistory';
import { PAIR_ABI } from '@/config/abis';
import { cn } from '@/lib/utils';

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { data: opnBalance, refetch: refetchOpn, isLoading } = useBalance({ address });
  const { data: wopnBalance } = useTokenBalance(CONTRACTS.WETH as `0x${string}`, address);
  const { data: dragonBalance } = useTokenBalance(CONTRACTS.DRAGON as `0x${string}`, address);
  const { data: bnbBalance } = useTokenBalance(CONTRACTS.BNB as `0x${string}`, address);
  const { data: ethBalance } = useTokenBalance(CONTRACTS.ETH as `0x${string}`, address);
  const { data: monBalance } = useTokenBalance(CONTRACTS.MON as `0x${string}`, address);
  const { data: hypeBalance } = useTokenBalance(CONTRACTS.HYPE as `0x${string}`, address);

  const { transactions } = useTransactionHistory();
  const { pools, isLoading: poolsLoading } = useLiquidityPools();
  const { prices } = useTokenPrices();

  // Fetch LP balances for all pools
  const lpBalanceResults = useReadContracts({
    contracts: pools.map(pool => ({
      address: pool.pairAddress,
      abi: PAIR_ABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
    })),
    query: { enabled: pools.length > 0 && !!address },
  });

  // Build LP positions from on-chain data
  const lpPositions = useMemo(() => {
    if (!lpBalanceResults.data || pools.length === 0) return [];
    
    return pools
      .map((pool, i) => {
        const balance = lpBalanceResults.data?.[i]?.result as bigint | undefined;
        if (!balance || balance === 0n) return null;
        
        const balanceFormatted = parseFloat(formatUnits(balance, 18));
        const totalSupply = parseFloat(formatUnits(pool.totalSupply || 1n, 18));
        const share = totalSupply > 0 ? (balanceFormatted / totalSupply) * 100 : 0;
        
        const res0 = parseFloat(formatUnits(pool.reserve0, pool.token0?.decimals || 18));
        const res1 = parseFloat(formatUnits(pool.reserve1, pool.token1?.decimals || 18));
        const myToken0 = res0 * (share / 100);
        const myToken1 = res1 * (share / 100);
        
        const price0 = prices[pool.token0Symbol] || 0;
        const price1 = prices[pool.token1Symbol] || 0;
        const value = (myToken0 * price0) + (myToken1 * price1);
        
        return {
          ...pool,
          lpBalance: balance,
          lpBalanceFormatted: balanceFormatted,
          share,
          myToken0,
          myToken1,
          value,
        };
      })
      .filter(Boolean) as any[];
  }, [pools, lpBalanceResults.data, prices]);

  const tokens = [
    { symbol: 'OPN', name: 'OPN', balance: opnBalance ? formatEther(opnBalance.value) : '0', logo: '/tokens/opn.jpg', price: prices['OPN'] || 1.00 },
    { symbol: 'WOPN', name: 'Wrapped OPN', balance: wopnBalance ? formatEther(wopnBalance) : '0', logo: '/tokens/opn.jpg', price: prices['WOPN'] || 1.00 },
    { symbol: 'DRAGON', name: 'Dragon Token', balance: dragonBalance ? formatEther(dragonBalance) : '0', logo: '/tokens/dragon.png', price: prices['DRAGON'] || 0.25 },
    { symbol: 'BNB', name: 'Binance Coin', balance: bnbBalance ? formatEther(bnbBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', price: prices['BNB'] || 580 },
    { symbol: 'ETH', name: 'Ethereum', balance: ethBalance ? formatEther(ethBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', price: prices['ETH'] || 3200 },
    { symbol: 'MON', name: 'Monad', balance: monBalance ? formatEther(monBalance) : '0', logo: '/tokens/mon.jpg', price: prices['MON'] || 2.50 },
    { symbol: 'HYPE', name: 'Hyperliquid', balance: hypeBalance ? formatEther(hypeBalance) : '0', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png', price: prices['HYPE'] || 15 },
  ];

  const totalTokenValue = tokens.reduce((acc, token) => acc + parseFloat(token.balance) * token.price, 0);
  const totalLPValue = lpPositions.reduce((acc: number, lp: any) => acc + lp.value, 0);
  const totalValue = totalTokenValue + totalLPValue;
  const tokensWithBalance = tokens.filter(t => parseFloat(t.balance) > 0.0001);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Spotlight className="hidden md:block" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <GlowingStarsCard className="bg-card border border-border">
            <div className="text-center p-6 md:p-8">
              <div className="p-4 rounded-full bg-primary/10 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Wallet className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6">Connect your wallet to view your portfolio and track your assets</p>
            </div>
          </GlowingStarsCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 relative min-h-screen">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 mb-3 md:mb-4"
          >
            <Crown className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium">On-Chain Portfolio</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-2">Your Portfolio</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your assets and LP positions on OPN Testnet</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 max-w-5xl mx-auto">
          {isLoading ? (
            <>
              <div className="col-span-2"><StatCardSkeleton /></div>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-2 relative">
                <BackgroundGradient containerClassName="h-full" animate>
                  <div className="glass-card p-4 md:p-6 h-full">
                    <BorderBeam size={100} duration={10} />
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                        <Coins className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Total Balance</p>
                        <p className="text-2xl md:text-3xl font-bold">
                          $<NumberTicker value={totalValue} decimalPlaces={2} />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Tokens: ${totalTokenValue.toFixed(2)}</span>
                      <span>•</span>
                      <span>LP: ${totalLPValue.toFixed(2)}</span>
                    </div>
                  </div>
                </BackgroundGradient>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative">
                <div className="stat-card h-full flex flex-col justify-center">
                  <BorderBeam size={80} duration={10} delay={2} />
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                    <span className="text-[10px] md:text-sm text-muted-foreground">Assets</span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold">{tokensWithBalance.length}</p>
                  <span className="text-muted-foreground text-xs md:text-sm">Active tokens</span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative">
                <div className="stat-card h-full flex flex-col justify-center">
                  <BorderBeam size={80} duration={10} delay={4} />
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span className="text-[10px] md:text-sm text-muted-foreground">LP Positions</span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold">{lpPositions.length}</p>
                  <span className="text-muted-foreground text-xs md:text-sm">Active pools</span>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <a href={`https://testnet.iopn.tech/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchOpn()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {/* Token List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                Your Assets
              </h2>
            </div>

            <div className="grid gap-2 md:gap-3">
              {isLoading ? (
                [...Array(4)].map((_, i) => <AssetCardSkeleton key={i} />)
              ) : (
                tokens.map((token, i) => {
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
                      <div className={cn(
                        "glass-card p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:border-primary/50 transition-all",
                        !hasBalance && "opacity-50"
                      )}>
                        <img 
                          src={token.logo} 
                          alt={token.symbol} 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-border"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm md:text-base">{token.symbol}</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{token.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm md:text-base">{balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">${value.toFixed(2)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* LP Positions & Transaction History */}
          <div className="space-y-4 md:space-y-6">
            {/* LP Positions - On-Chain */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
                <Droplets className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                LP Positions
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-normal">On-Chain</span>
              </h2>
              
              {poolsLoading ? (
                <div className="glass-card p-6 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading LP positions...</p>
                </div>
              ) : lpPositions.length > 0 ? (
                <div className="space-y-3">
                  {lpPositions.map((lp: any) => (
                    <div key={lp.pairAddress} className="glass-card p-4 hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-1">
                          <img src={lp.token0?.logoURI || '/tokens/opn.jpg'} alt="" className="w-6 h-6 rounded-full border border-background" onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
                          <img src={lp.token1?.logoURI || '/tokens/opn.jpg'} alt="" className="w-6 h-6 rounded-full border border-background" onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }} />
                        </div>
                        <span className="font-medium text-sm">{lp.token0Symbol}/{lp.token1Symbol}</span>
                        {lp.value > 0 && <span className="ml-auto text-sm font-bold text-success">${lp.value.toFixed(2)}</span>}
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>LP Balance</span>
                          <span className="font-medium text-foreground">{lp.lpBalanceFormatted.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pool Share</span>
                          <span className="font-medium text-foreground">{lp.share.toFixed(4)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{lp.token0Symbol}</span>
                          <span className="font-medium text-foreground">{lp.myToken0.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{lp.token1Symbol}</span>
                          <span className="font-medium text-foreground">{lp.myToken1.toFixed(4)}</span>
                        </div>
                      </div>
                      <a href={`https://testnet.iopn.tech/address/${lp.pairAddress}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline mt-2 inline-flex items-center gap-1">
                        View Contract <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <GlowingStarsCard className="bg-card border border-border">
                  <div className="p-6 md:p-8 text-center">
                    <p className="text-sm text-muted-foreground mb-4">No active liquidity positions</p>
                    <Link to="/liquidity">
                      <Button className="btn-dragon" size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Add Liquidity
                      </Button>
                    </Link>
                  </div>
                </GlowingStarsCard>
              )}
            </motion.div>

            {/* Transaction History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <TransactionHistory transactions={transactions} maxDisplay={3} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
