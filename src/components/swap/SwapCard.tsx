import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, Loader2, ExternalLink, Check, Info, X, Flame, Wallet, RotateCw, Route } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits, formatEther, parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenSelector } from './TokenSelector';
import { PriceImpactWarning } from './PriceImpactWarning';
import { SwapPriceChart } from './SwapPriceChart';
import { TOKEN_LIST, TokenInfo, CONTRACTS } from '@/config/contracts';
import { useRouter, useApprove, useTokenBalance, useTokenAllowance, useGetPair, usePairReserves, usePairTokens, useWETH } from '@/hooks/useContract';
import { useBestRoute } from '@/hooks/useSwapRouter';
import { useWallet } from '@/hooks/useWallet';
import { usePriceImpact, useTokenPrices } from '@/hooks/usePrices';
import { parseTransactionError, getErrorToastConfig } from '@/lib/transactionErrors';
import { sanitizeAmountInput, sanitizeSlippage, getSafeDeadline, calculateMinOutput, getSafeApprovalAmount } from '@/lib/inputValidation';
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
  const [lastSwapParams, setLastSwapParams] = useState<{ from: string; to: string } | null>(null);

  const NATIVE_GAS_RESERVE = 0.01;

  const router = useRouter();
  const weth = useWETH();
  const { prices, getPrice } = useTokenPrices();
  const { approve, isPending: isApproving, isSuccess: approveSuccess, hash: approveHash, error: approveError } = useApprove();
  const { addTransaction, updateTransaction } = useTransactionHistory();

  // Detect if this is a wrap/unwrap (OPN <-> WOPN)
  const isWrapUnwrap = useMemo(() => {
    if (!fromToken || !toToken) return false;
    const fromIsNative = fromToken.isNative;
    const toIsNative = toToken.isNative;
    const fromIsWOPN = fromToken.symbol === 'WOPN';
    const toIsWOPN = toToken.symbol === 'WOPN';
    return (fromIsNative && toIsWOPN) || (fromIsWOPN && toIsNative);
  }, [fromToken, toToken]);

  const isWrapping = fromToken?.isNative && toToken?.symbol === 'WOPN';
  const isUnwrapping = fromToken?.symbol === 'WOPN' && toToken?.isNative;

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

  const amountIn = fromAmount ? parseUnits(fromAmount, fromToken?.decimals || 18) : undefined;

  // Multi-hop routing: find best path automatically
  const { bestRoute, allRoutes, isLoading: isRouteLoading, hasRoute } = useBestRoute(
    isWrapUnwrap ? undefined : fromAddr,
    isWrapUnwrap ? undefined : toAddr,
    isWrapUnwrap ? undefined : amountIn
  );

  const swapPath = useMemo(() => {
    if (isWrapUnwrap || !bestRoute) return [];
    return bestRoute.route.path;
  }, [bestRoute, isWrapUnwrap]);

  const amountsOut = bestRoute?.amountsOut;
  const isQuoting = isRouteLoading;
  const isMultiHop = bestRoute ? bestRoute.route.hops > 1 : false;

  // Direct pair for price impact (use first hop pair)
  const { data: pairAddress, refetch: refetchPair, isLoading: isPairLoading } = useGetPair(
    isWrapUnwrap ? undefined : (swapPath.length >= 2 ? swapPath[0] : undefined),
    isWrapUnwrap ? undefined : (swapPath.length >= 2 ? swapPath[1] : undefined)
  );
  const validPairAddress = pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000' ? pairAddress : undefined;
  const { data: reserves, refetch: refetchReserves, isLoading: isReservesLoading } = usePairReserves(validPairAddress);
  const { token0: pairToken0 } = usePairTokens(validPairAddress);

  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    fromToken && !fromToken.isNative ? (fromToken.address as `0x${string}`) : undefined,
    address,
    CONTRACTS.ROUTER as `0x${string}`
  );

  const needsApproval = useMemo(() => {
    if (!fromToken || fromToken.isNative || !amountIn || isWrapUnwrap) return false;
    return allowance !== undefined && allowance < amountIn;
  }, [fromToken, allowance, amountIn, isWrapUnwrap]);

  // Check if route has liquidity
  const hasLiquidity = useMemo(() => {
    if (isWrapUnwrap) return true;
    return hasRoute && !!bestRoute;
  }, [hasRoute, bestRoute, isWrapUnwrap]);

  const isPoolDataLoading = isWrapUnwrap ? false : isRouteLoading;

  // Refetch pair and reserves periodically to keep data fresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPair();
      if (validPairAddress) refetchReserves();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchPair, refetchReserves, validPairAddress]);

  // Watch for approval success → auto-proceed to swap
  useEffect(() => {
    if (approveSuccess && approveHash) {
      toast.dismiss('approve');
      toast.success('Token Approved!', {
        description: `${fromToken?.symbol} approved — you can now swap`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://testnet.iopn.tech/tx/${approveHash}`, '_blank'),
        },
      });
      addTransaction({
        hash: approveHash,
        type: 'approve',
        status: 'success',
        details: { fromToken: fromToken?.symbol },
      });
      // Refetch allowance so needsApproval becomes false
      setTimeout(() => refetchAllowance(), 1500);
    }
  }, [approveSuccess, approveHash, fromToken, refetchAllowance]);

  // Watch for approval errors
  useEffect(() => {
    if (approveError) {
      toast.dismiss('approve');
      const parsed = parseTransactionError(approveError);
      if (parsed.type === 'user_rejected') {
        toast.info(parsed.title, { description: parsed.description });
      } else {
        toast.error('Approval Failed', {
          description: `${parsed.description}\n💡 ${parsed.suggestion}`,
        });
      }
    }
  }, [approveError]);

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
        details: { fromToken: fromToken?.symbol, toToken: toToken?.symbol, fromAmount, toAmount },
      });
      setFromAmount('');
      setToAmount('');
    }
  }, [router.isSuccess, router.hash, fromAmount, toAmount, fromToken, toToken]);

  // Watch for wrap/unwrap success
  useEffect(() => {
    if (weth.isSuccess && weth.hash) {
      toast.dismiss('swap');
      const action = isWrapping ? 'Wrapped' : 'Unwrapped';
      toast.success(`${action} Successfully!`, {
        description: `${action} ${fromAmount} ${fromToken?.symbol} to ${toAmount} ${toToken?.symbol}`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://testnet.iopn.tech/tx/${weth.hash}`, '_blank'),
        },
      });
      addTransaction({
        hash: weth.hash,
        type: 'swap',
        status: 'success',
        details: { fromToken: fromToken?.symbol, toToken: toToken?.symbol, fromAmount, toAmount },
      });
      setFromAmount('');
      setToAmount('');
    }
  }, [weth.isSuccess, weth.hash]);

  // Watch for errors with decoded revert reasons
  useEffect(() => {
    if (router.error) {
      toast.dismiss('swap');
      const parsed = parseTransactionError(router.error);
      const config = getErrorToastConfig(parsed);
      
      if (parsed.type === 'user_rejected') {
        toast.info(parsed.title, {
          description: parsed.description,
          duration: config.duration,
        });
      } else {
        toast.error(parsed.title, {
          description: `${parsed.description}\n💡 ${parsed.suggestion}`,
          duration: config.duration,
          action: parsed.canRetry && lastSwapParams ? {
            label: 'Retry',
            onClick: () => handleSwap(),
          } : undefined,
        });
      }
    }
  }, [router.error]);

  useEffect(() => {
    if (weth.error) {
      toast.dismiss('swap');
      const parsed = parseTransactionError(weth.error);
      const config = getErrorToastConfig(parsed);
      
      if (parsed.type === 'user_rejected') {
        toast.info(parsed.title, {
          description: parsed.description,
          duration: config.duration,
        });
      } else {
        toast.error(parsed.title, {
          description: `${parsed.description}\n💡 ${parsed.suggestion}`,
          duration: config.duration,
          action: parsed.canRetry ? {
            label: 'Retry',
            onClick: () => handleSwap(),
          } : undefined,
        });
      }
    }
  }, [weth.error]);

  // Record pending swap transaction
  useEffect(() => {
    if (router.isPending && router.hash) {
      addTransaction({
        hash: router.hash, type: 'swap', status: 'pending',
        details: { fromToken: fromToken?.symbol, toToken: toToken?.symbol, fromAmount, toAmount },
      });
    }
  }, [router.isPending, router.hash]);

  // For wrap/unwrap, output = input (1:1 ratio)
  useEffect(() => {
    if (isWrapUnwrap) {
      setToAmount(fromAmount);
    } else if (amountsOut && amountsOut.length > 1) {
      const outputAmount = formatUnits(amountsOut[amountsOut.length - 1], toToken?.decimals || 18);
      setToAmount(parseFloat(outputAmount).toFixed(6));
    } else if (!fromAmount) {
      setToAmount('');
    }
  }, [amountsOut, toToken, fromAmount, isWrapUnwrap]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = useCallback(async () => {
    if (!address || !fromToken || !toToken || !fromAmount) return;

    if (fromToken.isNative) {
      const nativeBal = nativeBalance ? parseFloat(formatEther(nativeBalance.value)) : 0;
      const spendable = Math.max(nativeBal - NATIVE_GAS_RESERVE, 0);
      if (parseFloat(fromAmount) > spendable) {
        toast.error('Insufficient OPN for swap + gas', {
          description: `Sisakan minimal ${NATIVE_GAS_RESERVE} OPN untuk biaya gas.`,
        });
        return;
      }
    }
    
    // Save params for retry
    setLastSwapParams({ from: fromAmount, to: toAmount });
    
    // Handle wrap/unwrap
    if (isWrapUnwrap) {
      toast.loading(isWrapping ? 'Wrapping OPN...' : 'Unwrapping WOPN...', { id: 'swap' });
      if (isWrapping) {
        weth.deposit(parseEther(fromAmount));
      } else {
        weth.withdraw(parseUnits(fromAmount, 18));
      }
      return;
    }

    if (!amountsOut) return;
    
    toast.loading('Confirming swap...', { id: 'swap' });
    
    const deadline = getSafeDeadline(30);
    const minOutput = calculateMinOutput(amountsOut[amountsOut.length - 1], slippage);
    
    if (fromToken.isNative) {
      router.swapExactETHForTokens(minOutput, swapPath, address, deadline, parseEther(fromAmount));
    } else if (toToken.isNative) {
      router.swapExactTokensForETH(amountIn!, minOutput, swapPath, address, deadline);
    } else {
      router.swapExactTokensForTokens(amountIn!, minOutput, swapPath, address, deadline);
    }
  }, [address, fromToken, toToken, fromAmount, toAmount, isWrapUnwrap, isWrapping, amountsOut, slippage, swapPath, amountIn, nativeBalance]);

  const handleApprove = async () => {
    if (!fromToken || fromToken.isNative) return;
    toast.loading(`Approving ${fromToken.symbol}...`, { id: 'approve' });
    const safeAmount = getSafeApprovalAmount(amountIn || 0n);
    approve(fromToken.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, safeAmount);
  };

  const fromBalance = useMemo(() => {
    if (fromToken?.isNative) return nativeBalance ? formatEther(nativeBalance.value) : '0';
    return tokenBalance ? formatUnits(tokenBalance, fromToken?.decimals || 18) : '0';
  }, [fromToken, nativeBalance, tokenBalance]);

  const maxSpendableFromBalance = useMemo(() => {
    if (!fromToken?.isNative) return fromBalance;
    const spendable = Math.max(parseFloat(fromBalance) - NATIVE_GAS_RESERVE, 0);
    return spendable.toString();
  }, [fromToken, fromBalance]);

  const isLoading = router.isPending || router.isConfirming || weth.isPending || weth.isConfirming;

  // Calculate price impact using reserves with correct token ordering
  const reservePair = reserves ? [reserves[0], reserves[1]] as [bigint, bigint] : undefined;
  const { priceImpact, severity } = usePriceImpact(
    fromToken, 
    toToken, 
    fromAmount, 
    toAmount,
    reservePair,
    pairToken0
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
                    onChange={(e) => setSlippage(sanitizeSlippage(parseFloat(e.target.value)))}
                    min={0.01}
                    max={50}
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
                  onClick={() => setFromAmount(maxSpendableFromBalance)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {fromToken?.isNative ? `Spendable: ${parseFloat(maxSpendableFromBalance).toFixed(4)}` : `Balance: ${parseFloat(fromBalance).toFixed(4)}`} {fromToken?.symbol}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={fromAmount} 
                  onChange={(e) => setFromAmount(sanitizeAmountInput(e.target.value))} 
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

          {/* Price Chart */}
          {fromToken && toToken && fromAmount && toAmount && parseFloat(toAmount) > 0 && (
            <SwapPriceChart
              fromSymbol={fromToken.symbol}
              toSymbol={toToken.symbol}
              currentPrice={parseFloat(toAmount) / parseFloat(fromAmount)}
            />
          )}

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
              {/* Route indicator */}
              {bestRoute && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Route className="w-3 h-3" /> Route
                  </span>
                  <span className="font-medium flex items-center gap-1">
                    {bestRoute.route.pathSymbols.map((sym, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-muted-foreground">→</span>}
                        <span className={isMultiHop && i > 0 && i < bestRoute.route.pathSymbols.length - 1 ? 'text-primary' : ''}>
                          {sym}
                        </span>
                      </span>
                    ))}
                    {isMultiHop && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary ml-1">Multi-hop</span>
                    )}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Button / Wallet Connect */}
          <div className="pt-2 space-y-3">
            {!isConnected ? (
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
              <>
                {/* Step Indicator */}
                <div className="flex items-center gap-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      approveSuccess ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
                    )}>
                      {approveSuccess ? <Check className="w-3.5 h-3.5" /> : '1'}
                    </div>
                    <span className="text-xs font-medium">Approve</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
                      2
                    </div>
                    <span className="text-xs text-muted-foreground">Swap</span>
                  </div>
                </div>
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
              </>
            ) : (
              <Button 
                onClick={handleSwap} 
                className={cn(
                  "w-full h-12",
                  isHighImpact ? "bg-destructive hover:bg-destructive/90" : "btn-dragon"
                )}
                disabled={
                  !fromAmount || 
                  isLoading || 
                  (!isWrapUnwrap && isPoolDataLoading) || 
                  parseFloat(fromAmount) > parseFloat(maxSpendableFromBalance) || 
                  (!isWrapUnwrap && !hasLiquidity && !isPoolDataLoading) || 
                  (!isWrapUnwrap && !amountsOut && hasLiquidity && !!fromAmount)
                }
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {isWrapUnwrap ? (isWrapping ? 'Wrapping...' : 'Unwrapping...') : 'Swapping...'}</>
                ) : !fromAmount ? (
                  <>Enter Amount</>
                ) : !isWrapUnwrap && isPoolDataLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Finding Best Route...</>
                ) : !isWrapUnwrap && !hasLiquidity && !isPoolDataLoading && fromToken && toToken ? (
                  <>No Route Found</>
                ) : parseFloat(fromAmount) > parseFloat(maxSpendableFromBalance) ? (
                  <>{fromToken?.isNative ? 'Insufficient OPN (keep gas)' : `Insufficient ${fromToken?.symbol}`}</>
                ) : isWrapUnwrap ? (
                  <>{isWrapping ? 'Wrap OPN → WOPN' : 'Unwrap WOPN → OPN'}</>
                ) : isHighImpact ? (
                  <>⚠️ Swap Anyway (High Impact)</>
                ) : (
                  <>Swap {isMultiHop ? '(Multi-hop)' : ''}</>
                )}
              </Button>
            )}
          </div>

          {/* Transaction Link */}
          {(router.hash || weth.hash) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <a 
                href={`https://testnet.iopn.tech/tx/${router.hash || weth.hash}`} 
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
