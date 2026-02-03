import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Loader2, Check, ExternalLink, Droplets, Info, Calculator, TrendingUp, Wallet, Shield, AlertCircle } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTokenBalance, useRouter, useApprove, useTokenAllowance, useGetPair, usePairReserves, useApprovePair, usePairBalance, usePairAllowance } from '@/hooks/useContract';
import { CONTRACTS, TOKEN_LIST, TokenInfo } from '@/config/contracts';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { MovingBorder } from '@/components/ui/aceternity/MovingBorder';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { GlowingStarsBackground } from '@/components/ui/aceternity/GlowingStars';
import { ParticleField } from '@/components/ui/premium/ParticleField';
import { GlowOrb } from '@/components/ui/premium/GlowOrb';
import { cn } from '@/lib/utils';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('add');
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Add Liquidity state
  const [tokenA, setTokenA] = useState<TokenInfo | null>(TOKEN_LIST[1]); // WOPN
  const [tokenB, setTokenB] = useState<TokenInfo | null>(TOKEN_LIST[2]); // DRAGON
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);
  const [lastEditedField, setLastEditedField] = useState<'A' | 'B' | null>(null);
  const [approvalStepA, setApprovalStepA] = useState<'idle' | 'approving' | 'approved'>('idle');
  const [approvalStepB, setApprovalStepB] = useState<'idle' | 'approving' | 'approved'>('idle');
  
  // Remove Liquidity state
  const [removePercent, setRemovePercent] = useState(25);
  
  // Token balances
  const { data: tokenABalance } = useTokenBalance(
    tokenA && !tokenA.isNative ? (tokenA.address as `0x${string}`) : undefined,
    address
  );
  const { data: tokenBBalance } = useTokenBalance(
    tokenB && !tokenB.isNative ? (tokenB.address as `0x${string}`) : undefined,
    address
  );
  
  // Native balance for OPN
  const { data: nativeOPNBalance } = useBalance({ address });
  
  // Get display balance for token A
  const getTokenADisplayBalance = () => {
    if (!tokenA) return '0';
    if (tokenA.isNative) {
      return nativeOPNBalance ? parseFloat(formatEther(nativeOPNBalance.value)).toFixed(4) : '0';
    }
    return tokenABalance ? parseFloat(formatUnits(tokenABalance, tokenA.decimals)).toFixed(4) : '0';
  };
  
  // Get display balance for token B
  const getTokenBDisplayBalance = () => {
    if (!tokenB) return '0';
    if (tokenB.isNative) {
      return nativeOPNBalance ? parseFloat(formatEther(nativeOPNBalance.value)).toFixed(4) : '0';
    }
    return tokenBBalance ? parseFloat(formatUnits(tokenBBalance, tokenB.decimals)).toFixed(4) : '0';
  };
  
  // Allowances
  const { data: allowanceA } = useTokenAllowance(
    tokenA && !tokenA.isNative ? (tokenA.address as `0x${string}`) : undefined,
    address,
    CONTRACTS.ROUTER as `0x${string}`
  );
  const { data: allowanceB } = useTokenAllowance(
    tokenB && !tokenB.isNative ? (tokenB.address as `0x${string}`) : undefined,
    address,
    CONTRACTS.ROUTER as `0x${string}`
  );
  
  // Get pair info
  const { data: pairAddress } = useGetPair(
    tokenA && !tokenA.isNative ? (tokenA.address as `0x${string}`) : (CONTRACTS.WETH as `0x${string}`),
    tokenB && !tokenB.isNative ? (tokenB.address as `0x${string}`) : (CONTRACTS.WETH as `0x${string}`)
  );
  const { data: reserves } = usePairReserves(pairAddress);
  const { data: lpBalance } = usePairBalance(pairAddress, address);
  const { data: lpAllowance } = usePairAllowance(pairAddress, address);
  
  // Router & Approve hooks
  const router = useRouter();
  const { approve: approveToken, isPending: approvePending } = useApprove();
  const { approve: approvePair, isPending: pairApprovePending } = useApprovePair();

  // Check if approvals needed
  const amountABigInt = amountA ? parseUnits(amountA, tokenA?.decimals || 18) : 0n;
  const amountBBigInt = amountB ? parseUnits(amountB, tokenB?.decimals || 18) : 0n;
  const needsApprovalA = tokenA && !tokenA.isNative && allowanceA !== undefined && allowanceA < amountABigInt;
  const needsApprovalB = tokenB && !tokenB.isNative && allowanceB !== undefined && allowanceB < amountBBigInt;

  // Auto-calculate the second token amount based on pool reserves
  const calculateOptimalAmount = useCallback((inputAmount: string, isTokenA: boolean): string => {
    if (!inputAmount || parseFloat(inputAmount) === 0 || !reserves) return '';
    
    const [reserve0, reserve1] = reserves;
    if (reserve0 === 0n || reserve1 === 0n) return '';
    
    try {
      const inputBigInt = parseUnits(inputAmount, isTokenA ? (tokenA?.decimals || 18) : (tokenB?.decimals || 18));
      
      let optimalAmount: bigint;
      if (isTokenA) {
        optimalAmount = (inputBigInt * reserve1) / reserve0;
      } else {
        optimalAmount = (inputBigInt * reserve0) / reserve1;
      }
      
      const decimals = isTokenA ? (tokenB?.decimals || 18) : (tokenA?.decimals || 18);
      return parseFloat(formatUnits(optimalAmount, decimals)).toFixed(6);
    } catch {
      return '';
    }
  }, [reserves, tokenA, tokenB]);

  // Handle amount changes with auto-calculation
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    setLastEditedField('A');
    
    if (value && reserves && reserves[0] > 0n) {
      setIsAutoCalculating(true);
      const calculatedB = calculateOptimalAmount(value, true);
      if (calculatedB) setAmountB(calculatedB);
      setTimeout(() => setIsAutoCalculating(false), 300);
    }
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    setLastEditedField('B');
    
    if (value && reserves && reserves[0] > 0n) {
      setIsAutoCalculating(true);
      const calculatedA = calculateOptimalAmount(value, false);
      if (calculatedA) setAmountA(calculatedA);
      setTimeout(() => setIsAutoCalculating(false), 300);
    }
  };

  // Pool price ratio
  const priceRatio = useMemo(() => {
    if (!reserves || reserves[0] === 0n || reserves[1] === 0n) return null;
    const reserve0 = parseFloat(formatUnits(reserves[0], tokenA?.decimals || 18));
    const reserve1 = parseFloat(formatUnits(reserves[1], tokenB?.decimals || 18));
    return { aPerB: reserve0 / reserve1, bPerA: reserve1 / reserve0 };
  }, [reserves, tokenA, tokenB]);

  // Pool share calculation
  const poolShare = useMemo(() => {
    if (!amountA || !amountB || !reserves || reserves[0] === 0n) return null;
    const inputA = parseFloat(amountA);
    const currentA = parseFloat(formatUnits(reserves[0], tokenA?.decimals || 18));
    return ((inputA / (currentA + inputA)) * 100).toFixed(2);
  }, [amountA, amountB, reserves, tokenA]);

  // Handlers
  const handleApproveA = () => {
    if (!tokenA || tokenA.isNative) return;
    setApprovalStepA('approving');
    approveToken(tokenA.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, parseUnits('999999999', tokenA.decimals));
  };

  const handleApproveB = () => {
    if (!tokenB || tokenB.isNative) return;
    setApprovalStepB('approving');
    approveToken(tokenB.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, parseUnits('999999999', tokenB.decimals));
  };

  const handleAddLiquidity = () => {
    if (!address || !tokenA || !tokenB || !amountA || !amountB) return;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    
    if (tokenA.isNative || tokenB.isNative) {
      const token = tokenA.isNative ? tokenB : tokenA;
      const tokenAmount = tokenA.isNative ? amountBBigInt : amountABigInt;
      const ethAmount = tokenA.isNative ? amountABigInt : amountBBigInt;
      
      router.addLiquidityETH(
        token.address as `0x${string}`,
        tokenAmount,
        (tokenAmount * 95n) / 100n,
        (ethAmount * 95n) / 100n,
        address,
        deadline,
        ethAmount
      );
    } else {
      router.addLiquidity(
        tokenA.address as `0x${string}`,
        tokenB.address as `0x${string}`,
        amountABigInt,
        amountBBigInt,
        (amountABigInt * 95n) / 100n,
        (amountBBigInt * 95n) / 100n,
        address,
        deadline
      );
    }
  };

  const handleApproveLPTokens = () => {
    if (!pairAddress || !lpBalance) return;
    approvePair(pairAddress, lpBalance);
  };

  const handleRemoveLiquidity = () => {
    if (!address || !tokenA || !tokenB || !lpBalance || !pairAddress) return;
    const liquidityToRemove = (lpBalance * BigInt(removePercent)) / 100n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    
    if (tokenA.isNative || tokenB.isNative) {
      const token = tokenA.isNative ? tokenB : tokenA;
      router.removeLiquidityETH(token.address as `0x${string}`, liquidityToRemove, 0n, 0n, address, deadline);
    } else {
      router.removeLiquidity(tokenA.address as `0x${string}`, tokenB.address as `0x${string}`, liquidityToRemove, 0n, 0n, address, deadline);
    }
  };

  const needsLPApproval = lpBalance && lpAllowance !== undefined && lpAllowance < (lpBalance * BigInt(removePercent)) / 100n;
  const isLoading = router.isPending || router.isConfirming;

  return (
    <main 
      className="container mx-auto px-4 py-8 relative min-h-[calc(100vh-80px)]"
      role="main"
      aria-label="Liquidity Management"
    >
      {/* Background effects - lazy loaded for performance */}
      <Spotlight className="hidden md:block" />
      <GlowingStarsBackground starCount={30} className="opacity-20" />
      <ParticleField particleCount={30} colorScheme="dragon" className="opacity-30" />
      
      {/* Decorative glow orbs */}
      <GlowOrb color="primary" size="xl" className="top-20 -left-20 opacity-30" />
      <GlowOrb color="accent" size="lg" className="bottom-40 -right-10 opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto relative z-10"
      >
        {/* Hero Section with accessibility */}
        <header className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4"
          >
            <Droplets className="w-4 h-4" aria-hidden="true" />
            <span>Liquidity Management</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-3">Manage Liquidity</h1>
          <TextGenerateEffect 
            words="Provide liquidity and earn 0.3% on every trade. Auto-calculation ensures perfect token ratios."
            className="text-sm md:text-base text-muted-foreground font-normal"
          />
          
          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-success/10 text-success text-xs"
          >
            <Shield className="w-3 h-3" aria-hidden="true" />
            <span>Secure & Audited</span>
          </motion.div>
        </header>

        {/* Main Card with MovingBorder */}
        <MovingBorder duration={4000} borderRadius="1.5rem">
          <div className="p-6 bg-card/95 backdrop-blur-sm rounded-3xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList 
                className="w-full mb-6 bg-muted/50 grid grid-cols-2 h-12 rounded-xl p-1"
                aria-label="Liquidity actions"
              >
                <TabsTrigger 
                  value="add" 
                  className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="remove" 
                  className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground transition-all"
                >
                  <Minus className="w-4 h-4" />
                  <span>Remove</span>
                </TabsTrigger>
              </TabsList>

              {/* ============ ADD LIQUIDITY TAB ============ */}
              <TabsContent value="add" className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Add Liquidity
                        {isAutoCalculating && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                          >
                            <Calculator className="w-3 h-3 animate-pulse" />
                            Auto
                          </motion.span>
                        )}
                      </h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                        <Info className="w-3 h-3" />
                        Earn 0.3% fees
                      </span>
                    </div>

                    {/* Pool Rate Info */}
                    {priceRatio && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Current Pool Rate</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-background/60 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">1 {tokenA?.symbol} =</p>
                            <p className="font-bold text-sm">{priceRatio.bPerA.toFixed(4)} {tokenB?.symbol}</p>
                          </div>
                          <div className="bg-background/60 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">1 {tokenB?.symbol} =</p>
                            <p className="font-bold text-sm">{priceRatio.aPerB.toFixed(4)} {tokenA?.symbol}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Token A Input */}
                    <div className={cn(
                      "bg-muted/30 rounded-xl p-4 border-2 transition-all duration-200",
                      lastEditedField === 'A' ? "border-primary/50" : "border-transparent"
                    )}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-muted-foreground">First Token</span>
                        <button 
                          onClick={() => handleAmountAChange(getTokenADisplayBalance())}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <Wallet className="w-3 h-3" />
                          Balance: {getTokenADisplayBalance()}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number" 
                          placeholder="0.0" 
                          value={amountA} 
                          onChange={(e) => handleAmountAChange(e.target.value)} 
                          className="flex-1 text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0" 
                        />
                        <TokenSelector selectedToken={tokenA} onSelect={setTokenA} disabledToken={tokenB} />
                      </div>
                    </div>
                    
                    {/* Plus Icon Separator */}
                    <div className="flex justify-center relative py-1">
                      <motion.div 
                        animate={{ rotate: isAutoCalculating ? 180 : 0 }}
                        className={cn(
                          "p-2.5 rounded-full bg-muted border-4 border-background transition-colors z-10",
                          isAutoCalculating && "bg-primary/20"
                        )}
                      >
                        <Plus className={cn(
                          "w-5 h-5 transition-colors",
                          isAutoCalculating ? "text-primary" : "text-muted-foreground"
                        )} />
                      </motion.div>
                      {priceRatio && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                          <Calculator className="w-3 h-3" />
                          Auto-sync
                        </div>
                      )}
                    </div>
                    
                    {/* Token B Input */}
                    <div className={cn(
                      "bg-muted/30 rounded-xl p-4 border-2 transition-all duration-200",
                      lastEditedField === 'B' ? "border-primary/50" : "border-transparent"
                    )}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-muted-foreground">Second Token</span>
                        <button 
                          onClick={() => handleAmountBChange(getTokenBDisplayBalance())}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <Wallet className="w-3 h-3" />
                          Balance: {getTokenBDisplayBalance()}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number" 
                          placeholder="0.0" 
                          value={amountB} 
                          onChange={(e) => handleAmountBChange(e.target.value)} 
                          className="flex-1 text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0" 
                        />
                        <TokenSelector selectedToken={tokenB} onSelect={setTokenB} disabledToken={tokenA} />
                      </div>
                    </div>

                    {/* Pool Share Preview */}
                    {poolShare && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-center"
                      >
                        <p className="text-xs text-muted-foreground mb-1">Your Pool Share</p>
                        <p className="text-2xl font-bold text-primary">{poolShare}%</p>
                      </motion.div>
                    )}

                    {/* Approval Steps */}
                    {isConnected && (needsApprovalA || needsApprovalB) && (
                      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-warning" />
                          Token Approval Required
                        </p>
                        <div className="grid gap-2">
                          {needsApprovalA && (
                            <Button 
                              onClick={handleApproveA} 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                              disabled={approvePending || approvalStepA === 'approved'}
                            >
                              {approvalStepA === 'approving' ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving {tokenA?.symbol}...</>
                              ) : approvalStepA === 'approved' ? (
                                <><Check className="w-4 h-4 mr-2 text-success" /> {tokenA?.symbol} Approved</>
                              ) : (
                                <>Approve {tokenA?.symbol}</>
                              )}
                            </Button>
                          )}
                          {needsApprovalB && (
                            <Button 
                              onClick={handleApproveB} 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                              disabled={approvePending || approvalStepB === 'approved'}
                            >
                              {approvalStepB === 'approving' ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving {tokenB?.symbol}...</>
                              ) : approvalStepB === 'approved' ? (
                                <><Check className="w-4 h-4 mr-2 text-success" /> {tokenB?.symbol} Approved</>
                              ) : (
                                <>Approve {tokenB?.symbol}</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add Liquidity Button or Connect Wallet */}
                    {!isConnected ? (
                      <Button onClick={() => setShowWalletModal(true)} className="w-full h-12 text-base btn-dragon">
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleAddLiquidity}
                        className="w-full h-12 text-base btn-dragon"
                        disabled={isLoading || !amountA || !amountB || needsApprovalA || needsApprovalB}
                      >
                        {isLoading ? (
                          <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Adding Liquidity...</>
                        ) : (
                          <><Plus className="w-5 h-5 mr-2" /> Add Liquidity</>
                        )}
                      </Button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* ============ REMOVE LIQUIDITY TAB ============ */}
              <TabsContent value="remove" className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="remove"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="w-5 h-5 text-destructive" />
                      <h3 className="font-semibold text-lg">Remove Liquidity</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Withdraw your liquidity position and reclaim tokens</p>
                    
                    {/* Token Pair Selection */}
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium">Select Pair</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <TokenSelector selectedToken={tokenA} onSelect={setTokenA} disabledToken={tokenB} />
                        </div>
                        <div className="flex items-center gap-2">
                          <TokenSelector selectedToken={tokenB} onSelect={setTokenB} disabledToken={tokenA} />
                        </div>
                      </div>
                    </div>
                    
                    {/* LP Balance Info */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-muted-foreground">Your LP Tokens</span>
                        <div className="flex items-center gap-2">
                          {tokenA && <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />}
                          {tokenB && <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-5 h-5 rounded-full -ml-2" />}
                        </div>
                      </div>
                      <p className="text-2xl font-bold">
                        {lpBalance ? parseFloat(formatEther(lpBalance)).toFixed(6) : '0.000000'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{tokenA?.symbol}/{tokenB?.symbol} LP</p>
                    </div>

                    {/* Amount Slider */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-4">Amount to Remove</p>
                      <div className="text-center mb-6">
                        <span className="text-5xl font-bold text-destructive">{removePercent}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={removePercent} 
                        onChange={(e) => setRemovePercent(Number(e.target.value))}
                        className="w-full accent-destructive h-2 rounded-full cursor-pointer"
                      />
                      <div className="flex justify-between mt-4 gap-2">
                        {[25, 50, 75, 100].map((p) => (
                          <button
                            key={p}
                            onClick={() => setRemovePercent(p)}
                            className={cn(
                              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                              removePercent === p 
                                ? "bg-destructive text-destructive-foreground shadow-lg" 
                                : "bg-muted hover:bg-muted/80"
                            )}
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Expected Output Preview */}
                    {lpBalance && lpBalance > 0n && removePercent > 0 && reserves && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-muted/20 rounded-xl p-4"
                      >
                        <p className="text-sm text-muted-foreground mb-3">You will receive (estimated)</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {tokenA && <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />}
                              <span className="text-sm">{tokenA?.symbol}</span>
                            </div>
                            <span className="font-medium">~{(parseFloat(formatUnits(reserves[0], tokenA?.decimals || 18)) * (removePercent / 100) * (parseFloat(formatEther(lpBalance)) / parseFloat(formatEther(reserves[0] + reserves[1])))).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {tokenB && <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />}
                              <span className="text-sm">{tokenB?.symbol}</span>
                            </div>
                            <span className="font-medium">~{(parseFloat(formatUnits(reserves[1], tokenB?.decimals || 18)) * (removePercent / 100) * (parseFloat(formatEther(lpBalance)) / parseFloat(formatEther(reserves[0] + reserves[1])))).toFixed(4)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* LP Approval */}
                    {isConnected && needsLPApproval && (
                      <Button 
                        onClick={handleApproveLPTokens}
                        variant="outline" 
                        className="w-full h-12"
                        disabled={pairApprovePending}
                      >
                        {pairApprovePending ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving LP Tokens...</>
                        ) : (
                          <>Approve LP Tokens</>
                        )}
                      </Button>
                    )}

                    {/* Remove Button */}
                    {!isConnected ? (
                      <Button onClick={() => setShowWalletModal(true)} className="w-full h-12 text-base">
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleRemoveLiquidity}
                        className="w-full h-12 text-base"
                        variant="destructive"
                        disabled={isLoading || !lpBalance || lpBalance === 0n || removePercent === 0 || needsLPApproval}
                      >
                        {isLoading ? (
                          <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Removing Liquidity...</>
                        ) : (
                          <><Minus className="w-5 h-5 mr-2" /> Remove Liquidity</>
                        )}
                      </Button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

            </Tabs>
          </div>
        </MovingBorder>

        {/* Transaction Hash Display */}
        {router.hash && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <a 
              href={`https://testnet.iopn.tech/tx/${router.hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-success bg-success/10 py-3 px-4 rounded-xl"
            >
              <Check className="w-4 h-4" /> Transaction Submitted <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </motion.div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </main>
  );
}
