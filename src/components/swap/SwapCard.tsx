import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, Loader2, ExternalLink, Check, Info, X, Flame, Wallet } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits, formatEther, parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenSelector } from './TokenSelector';
import { PriceImpactWarning } from './PriceImpactWarning';
import { TOKEN_LIST, TokenInfo, CONTRACTS } from '@/config/contracts';
import { useRouter, useGetAmountsOut, useApprove, useTokenBalance, useTokenAllowance, useGetPair, usePairReserves } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';
import { usePriceImpact, useTokenPrices } from '@/hooks/usePrices';
import { MovingBorder } from '@/components/ui/aceternity/MovingBorder';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';
import { useTransactionHistory } from '@/components/history/TransactionHistory';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const { isCorrectNetwork, switchToOPN } = useWallet();

  const [fromToken, setFromToken] = useState<TokenInfo | null>(TOKEN_LIST[0]);
  const [toToken, setToToken] = useState<TokenInfo | null>(TOKEN_LIST[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const router = useRouter();
  const { prices, getPrice } = useTokenPrices();
  const { approve, isPending: isApproving, isSuccess: approveSuccess, hash: approveHash } = useApprove();
  const { addTransaction, updateTransaction } = useTransactionHistory();

  const { data: nativeBalance } = useBalance({ address });
  const { data: tokenBalance } = useTokenBalance(
    fromToken && !fromToken.isNative ? (fromToken.address as `0x${string}`) : undefined,
    address
  );

  // Get pair for price impact calculation
  const fromAddr = useMemo(() => {
    if (!fromToken) return undefined;
    return (fromToken.isNative ? CONTRACTS.WETH : fromToken.address) as `0x${string}`;
  }, [fromToken]);
  const toAddr = useMemo(() => {
    if (!toToken) return undefined;
    return (toToken.isNative ? CONTRACTS.WETH : toToken.address) as `0x${string}`;
  }, [toToken]);
  
  const { data: pairAddress, refetch: refetchPair, isLoading: isPairLoading } = useGetPair(fromAddr, toAddr);
  const validPairAddress = pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000' ? pairAddress : undefined;
  const { data: reserves, refetch: refetchReserves, isLoading: isReservesLoading } = usePairReserves(validPairAddress);

  const swapPath = useMemo(() => {
    if (!fromToken || !toToken) return [];
    const from = fromToken.isNative ? CONTRACTS.WETH : fromToken.address;
    const to = toToken.isNative ? CONTRACTS.WETH : toToken.address;
    return [from, to] as `0x${string}`[];
  }, [fromToken, toToken]);

  const amountIn = fromAmount ? parseUnits(fromAmount, fromToken?.decimals || 18) : undefined;
  const { data: amountsOut, isLoading: isQuoting } = useGetAmountsOut(amountIn, swapPath);

  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    fromToken && !fromToken.isNative ? (fromToken.address as `0x${string}`) : undefined,
    address,
    CONTRACTS.ROUTER as `0x${string}`
  );

  const needsApproval = useMemo(() => {
    if (!fromToken || fromToken.isNative || !amountIn) return false;
    return allowance !== undefined && allowance < amountIn;
  }, [fromToken, allowance, amountIn]);

  // Check if pool has liquidity
  const hasLiquidity = useMemo(() => {
    if (!validPairAddress) return false;
    if (!reserves) return false;
    return reserves[0] > 0n && reserves[1] > 0n;
  }, [validPairAddress, reserves]);

  const isPoolDataLoading = isPairLoading || (!!validPairAddress && isReservesLoading);

  // Refetch pair and reserves periodically to keep data fresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPair();
      if (validPairAddress) refetchReserves();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchPair, refetchReserves, validPairAddress]);

  // Watch for approval success
  useEffect(() => {
    if (approveSuccess && approveHash) {
      toast.success('Token Approved!', {
        description: `${fromToken?.symbol} has been approved for trading`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://testnet.iopn.tech/tx/${approveHash}`, '_blank'),
        },
      });
      addTransaction({
        hash: approveHash,
        type: 'approve',
        status: 'success',
        details: { fromToken: fromToken?.symbol },
      });
      refetchAllowance();
    }
  }, [approveSuccess, approveHash, fromToken, refetchAllowance]);

  // Watch for swap success
  useEffect(() => {
    if (router.isSuccess && router.hash) {
      toast.dismiss('swap');
      toast.success('Swap Successful!', {
        description: `Swapped ${fromAmount} ${fromToken?.symbol} for ${toAmount} ${toToken?.symbol}`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://testnet.iopn.tech/tx/${router.hash}`, '_blank'),
        },
      });
      addTransaction({
        hash: router.hash,
        type: 'swap',
        status: 'success',
        details: {
          fromToken: fromToken?.symbol,
          toToken: toToken?.symbol,
          fromAmount,
          toAmount,
        },
      });
      setFromAmount('');
      setToAmount('');
    }
  }, [router.isSuccess, router.hash, fromAmount, toAmount, fromToken, toToken]);

  // Watch for errors
  useEffect(() => {
    if (router.error) {
      toast.error('Swap Failed', {
        description: router.error.message.slice(0, 100),
      });
    }
  }, [router.error]);

  // Record pending swap transaction
  useEffect(() => {
    if (router.isPending && router.hash) {
      addTransaction({
        hash: router.hash,
        type: 'swap',
        status: 'pending',
        details: {
          fromToken: fromToken?.symbol,
          toToken: toToken?.symbol,
          fromAmount,
          toAmount,
        },
      });
    }
  }, [router.isPending, router.hash]);

  useEffect(() => {
    if (amountsOut && amountsOut.length > 1) {
      const outputAmount = formatUnits(amountsOut[amountsOut.length - 1], toToken?.decimals || 18);
      setToAmount(parseFloat(outputAmount).toFixed(6));
    } else if (!fromAmount) {
      setToAmount('');
    }
  }, [amountsOut, toToken, fromAmount]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!address || !fromToken || !toToken || !fromAmount || !amountsOut) return;
    
    toast.loading('Confirming swap...', { id: 'swap' });
    
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    const minOutput = (amountsOut[amountsOut.length - 1] * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;
    
    if (fromToken.isNative) {
      router.swapExactETHForTokens(minOutput, swapPath, address, deadline, parseEther(fromAmount));
    } else if (toToken.isNative) {
      router.swapExactTokensForETH(amountIn!, minOutput, swapPath, address, deadline);
    } else {
      router.swapExactTokensForTokens(amountIn!, minOutput, swapPath, address, deadline);
    }
  };

  const handleApprove = async () => {
    if (!fromToken || fromToken.isNative) return;
    toast.loading(`Approving ${fromToken.symbol}...`, { id: 'approve' });
    approve(fromToken.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, parseUnits('999999999', fromToken.decimals));
  };

  const fromBalance = useMemo(() => {
    if (fromToken?.isNative) return nativeBalance ? formatEther(nativeBalance.value) : '0';
    return tokenBalance ? formatUnits(tokenBalance, fromToken?.decimals || 18) : '0';
  }, [fromToken, nativeBalance, tokenBalance]);

  const isLoading = router.isPending || router.isConfirming;

  // Calculate price impact using reserves
  const reservePair = reserves ? [reserves[0], reserves[1]] as [bigint, bigint] : undefined;
  const { priceImpact, severity } = usePriceImpact(
    fromToken, 
    toToken, 
    fromAmount, 
    toAmount,
    reservePair
  );

  // Calculate minimum received
  const minReceived = useMemo(() => {
    if (!toAmount) return '0';
    return (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6);
  }, [toAmount, slippage]);

  // Calculate USD values
  const fromUsdValue = useMemo(() => {
    if (!fromToken || !fromAmount) return 0;
    return parseFloat(fromAmount) * getPrice(fromToken.symbol);
  }, [fromToken, fromAmount, getPrice]);

  const toUsdValue = useMemo(() => {
    if (!toToken || !toAmount) return 0;
    return parseFloat(toAmount) * getPrice(toToken.symbol);
  }, [toToken, toAmount, getPrice]);

  // High slippage warning
  const isHighImpact = severity === 'high';
  const showImpactWarning = severity !== 'low' && priceImpact > 1;

  return (
    <div className="w-full max-w-md mx-auto">
      <MovingBorder duration={4000} borderRadius="1.5rem" containerClassName="w-full">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Swap</h2>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showSettings ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-muted/50 border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Slippage Tolerance</span>
                  <button onClick={() => setShowSettings(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0, 3.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlippage(s)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        slippage === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {s}%
                    </button>
                  ))}
                  <Input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                    className="w-20 text-center"
                    placeholder="0.5"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* From Token Input */}
          <div className="token-input">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">You Pay</span>
              <button 
                onClick={() => setFromAmount(fromBalance)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Balance: {parseFloat(fromBalance).toFixed(4)} {fromToken?.symbol}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={fromAmount} 
                  onChange={(e) => setFromAmount(e.target.value)} 
                  className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0" 
                />
                {fromUsdValue > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ~${fromUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <TokenSelector selectedToken={fromToken} onSelect={setFromToken} disabledToken={toToken} />
            </div>
            {parseFloat(fromAmount) > 0 && (
              <div className="flex gap-2 mt-3">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFromAmount((parseFloat(fromBalance) * p / 100).toString())}
                    className="flex-1 py-1.5 text-xs rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 180 }} 
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapTokens} 
              className="p-3 rounded-xl bg-muted border-2 border-background hover:border-primary/50 hover:bg-primary/10 transition-all shadow-lg"
            >
              <ArrowDownUp className="w-5 h-5" />
            </motion.button>
          </div>

          {/* To Token Input */}
          <div className="token-input">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">You Receive</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {isQuoting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{toAmount || '0.0'}</div>
                    {toUsdValue > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ~${toUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </>
                )}
              </div>
              <TokenSelector selectedToken={toToken} onSelect={setToToken} disabledToken={fromToken} />
            </div>
          </div>

          {/* Price Impact Warning */}
          <AnimatePresence>
            {showImpactWarning && (
              <PriceImpactWarning priceImpact={priceImpact} severity={severity} />
            )}
          </AnimatePresence>

          {/* Trade Details */}
          {fromAmount && toAmount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2.5"
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> Rate
                </span>
                <span className="font-medium">
                  1 {fromToken?.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={cn(
                  'font-medium',
                  severity === 'high' ? 'text-destructive' : severity === 'medium' ? 'text-warning' : 'text-success'
                )}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Min. Received</span>
                <span className="font-medium">{minReceived} {toToken?.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="font-medium">{slippage}%</span>
              </div>
            </motion.div>
          )}

          {/* Action Button / Wallet Connect */}
          <div className="pt-2">
            {!isConnected ? (
              /* Connect Wallet Button */
              <Button 
                onClick={() => setShowWalletModal(true)}
                className="w-full btn-dragon h-14 text-base font-semibold"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Hubungkan Dompet
              </Button>
            ) : !isCorrectNetwork ? (
              <Button onClick={switchToOPN} className="w-full h-12" variant="destructive">Switch to OPN Network</Button>
            ) : needsApproval ? (
              <Button 
                onClick={handleApprove} 
                className="w-full btn-dragon h-12" 
                disabled={isApproving}
              >
                {isApproving ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving {fromToken?.symbol}...</>
                ) : (
                  <>Approve {fromToken?.symbol}</>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleSwap} 
                className={cn(
                  "w-full h-12",
                  isHighImpact ? "bg-destructive hover:bg-destructive/90" : "btn-dragon"
                )}
                disabled={!fromAmount || isLoading || isPoolDataLoading || parseFloat(fromAmount) > parseFloat(fromBalance) || (!hasLiquidity && !isPoolDataLoading && !!fromToken && !!toToken && fromAmount !== '') || (!amountsOut && hasLiquidity && !!fromAmount)}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Swapping...</>
                ) : !fromAmount ? (
                  <>Enter Amount</>
                ) : isPoolDataLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Checking Pool...</>
                ) : !validPairAddress && fromToken && toToken ? (
                  <>No Pool Found</>
                ) : !hasLiquidity && fromToken && toToken ? (
                  <>No Liquidity for {fromToken?.symbol}/{toToken?.symbol}</>
                ) : parseFloat(fromAmount) > parseFloat(fromBalance) ? (
                  <>Insufficient {fromToken?.symbol}</>
                ) : isHighImpact ? (
                  <>Swap Anyway (High Impact)</>
                ) : (
                  <>Swap</>
                )}
              </Button>
            )}
          </div>

          {/* Transaction Link */}
          {router.hash && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <a 
                href={`https://testnet.iopn.tech/tx/${router.hash}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm text-success justify-center hover:underline"
              >
                <Check className="w-4 h-4" /> View transaction <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          )}
        </div>
      </MovingBorder>

      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </div>
  );
}
