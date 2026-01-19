import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Plus, Minus, Loader2, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWETH, useTokenBalance, useRouter, useApprove, useTokenAllowance, useGetPair, usePairReserves, useApprovePair, usePairBalance, usePairAllowance } from '@/hooks/useContract';
import { CONTRACTS, TOKEN_LIST, TokenInfo } from '@/config/contracts';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { MovingBorder } from '@/components/ui/aceternity/MovingBorder';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { cn } from '@/lib/utils';

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('wrap');
  
  // Wrap/Unwrap state
  const [wrapAmount, setWrapAmount] = useState('');
  const [unwrapAmount, setUnwrapAmount] = useState('');
  
  // Add Liquidity state
  const [tokenA, setTokenA] = useState<TokenInfo | null>(TOKEN_LIST[1]); // WOPN
  const [tokenB, setTokenB] = useState<TokenInfo | null>(TOKEN_LIST[2]); // DRAGON
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [approvalStepA, setApprovalStepA] = useState<'idle' | 'approving' | 'approved'>('idle');
  const [approvalStepB, setApprovalStepB] = useState<'idle' | 'approving' | 'approved'>('idle');
  
  // Remove Liquidity state
  const [removePercent, setRemovePercent] = useState(25);
  const [removeApprovalStep, setRemoveApprovalStep] = useState<'idle' | 'approving' | 'approved'>('idle');
  
  // Hooks
  const { data: opnBalance } = useBalance({ address });
  const { data: wopnBalance } = useTokenBalance(CONTRACTS.WETH as `0x${string}`, address);
  const { deposit, withdraw, isPending: wethPending, isConfirming: wethConfirming, hash: wethHash, isSuccess: wethSuccess } = useWETH();
  
  // Token balances - handle native OPN separately
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
  
  // Get display balance for token A (handle native OPN)
  const getTokenADisplayBalance = () => {
    if (!tokenA) return '0';
    if (tokenA.isNative) {
      return nativeOPNBalance ? parseFloat(formatEther(nativeOPNBalance.value)).toFixed(4) : '0';
    }
    return tokenABalance ? parseFloat(formatUnits(tokenABalance, tokenA.decimals)).toFixed(4) : '0';
  };
  
  // Get display balance for token B (handle native OPN)
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
  const { approve: approveToken, isPending: approvePending, isSuccess: approveSuccess } = useApprove();
  const { approve: approvePair, isPending: pairApprovePending, isSuccess: pairApproveSuccess } = useApprovePair();

  // Check if approvals needed
  const amountABigInt = amountA ? parseUnits(amountA, tokenA?.decimals || 18) : 0n;
  const amountBBigInt = amountB ? parseUnits(amountB, tokenB?.decimals || 18) : 0n;
  const needsApprovalA = tokenA && !tokenA.isNative && allowanceA !== undefined && allowanceA < amountABigInt;
  const needsApprovalB = tokenB && !tokenB.isNative && allowanceB !== undefined && allowanceB < amountBBigInt;

  const handleWrap = () => { 
    if (wrapAmount) deposit(parseEther(wrapAmount)); 
  };
  
  const handleUnwrap = () => { 
    if (unwrapAmount && wopnBalance) withdraw(parseEther(unwrapAmount)); 
  };

  const handleApproveA = async () => {
    if (!tokenA || tokenA.isNative) return;
    setApprovalStepA('approving');
    approveToken(tokenA.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, parseUnits('999999999', tokenA.decimals));
  };

  const handleApproveB = async () => {
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
    setRemoveApprovalStep('approving');
    approvePair(pairAddress, lpBalance);
  };

  const handleRemoveLiquidity = () => {
    if (!address || !tokenA || !tokenB || !lpBalance || !pairAddress) return;
    const liquidityToRemove = (lpBalance * BigInt(removePercent)) / 100n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    
    if (tokenA.isNative || tokenB.isNative) {
      const token = tokenA.isNative ? tokenB : tokenA;
      router.removeLiquidityETH(
        token.address as `0x${string}`,
        liquidityToRemove,
        0n,
        0n,
        address,
        deadline
      );
    } else {
      router.removeLiquidity(
        tokenA.address as `0x${string}`,
        tokenB.address as `0x${string}`,
        liquidityToRemove,
        0n,
        0n,
        address,
        deadline
      );
    }
  };

  const needsLPApproval = lpBalance && lpAllowance !== undefined && lpAllowance < (lpBalance * BigInt(removePercent)) / 100n;
  const isLoading = router.isPending || router.isConfirming;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl relative">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Liquidity</h1>
          <TextGenerateEffect 
            words="Provide liquidity to earn trading fees and rewards"
            className="text-muted-foreground text-lg font-normal"
          />
        </div>

        <MovingBorder duration={3000} borderRadius="1.5rem">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-6 bg-muted/50 grid grid-cols-3">
                <TabsTrigger value="wrap" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Wrap
                </TabsTrigger>
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </TabsTrigger>
                <TabsTrigger value="remove" className="flex items-center gap-2">
                  <Minus className="w-4 h-4" />
                  Remove
                </TabsTrigger>
              </TabsList>

              {/* WRAP/UNWRAP TAB */}
              <TabsContent value="wrap">
                <div className="space-y-6">
                  <h3 className="font-semibold text-center text-lg">OPN ↔ WOPN</h3>
                  <p className="text-sm text-muted-foreground text-center">Wrap native OPN to WOPN for trading</p>
                  
                  <div className="token-input">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Wrap OPN</span>
                      <span className="cursor-pointer hover:text-primary" onClick={() => opnBalance && setWrapAmount(formatEther(opnBalance.value))}>
                        Balance: {opnBalance ? parseFloat(formatEther(opnBalance.value)).toFixed(4) : '0'}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Input 
                        type="number" 
                        placeholder="0.0" 
                        value={wrapAmount} 
                        onChange={(e) => setWrapAmount(e.target.value)} 
                        className="flex-1 text-lg" 
                      />
                      <Button onClick={handleWrap} disabled={!isConnected || wethPending || wethConfirming || !wrapAmount} className="btn-dragon min-w-[100px]">
                        {wethPending || wethConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Wrap'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowDownUp className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  <div className="token-input">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Unwrap WOPN</span>
                      <span className="cursor-pointer hover:text-primary" onClick={() => wopnBalance && setUnwrapAmount(formatEther(wopnBalance))}>
                        Balance: {wopnBalance ? parseFloat(formatEther(wopnBalance)).toFixed(4) : '0'}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Input 
                        type="number" 
                        placeholder="0.0" 
                        value={unwrapAmount} 
                        onChange={(e) => setUnwrapAmount(e.target.value)} 
                        className="flex-1 text-lg" 
                      />
                      <Button onClick={handleUnwrap} disabled={!isConnected || wethPending || wethConfirming || !unwrapAmount} variant="outline" className="min-w-[100px]">
                        {wethPending || wethConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unwrap'}
                      </Button>
                    </div>
                  </div>
                  
                  {wethHash && (
                    <a href={`https://testnet.iopn.tech/tx/${wethHash}`} target="_blank" className="flex items-center justify-center gap-2 text-sm text-success">
                      <Check className="w-4 h-4" /> View Transaction <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </TabsContent>

              {/* ADD LIQUIDITY TAB */}
              <TabsContent value="add">
                <div className="space-y-4">
                  <h3 className="font-semibold text-center text-lg">Add Liquidity</h3>
                  <p className="text-sm text-muted-foreground text-center">Add tokens to earn 0.3% trading fees</p>
                  
                  {/* Token A */}
                  <div className="token-input">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Token A</span>
                      <span className="cursor-pointer hover:text-primary">Balance: {getTokenADisplayBalance()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        placeholder="0.0" 
                        value={amountA} 
                        onChange={(e) => setAmountA(e.target.value)} 
                        className="flex-1 text-lg" 
                      />
                      <TokenSelector selectedToken={tokenA} onSelect={setTokenA} disabledToken={tokenB} />
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  {/* Token B */}
                  <div className="token-input">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Token B</span>
                      <span className="cursor-pointer hover:text-primary">Balance: {getTokenBDisplayBalance()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        placeholder="0.0" 
                        value={amountB} 
                        onChange={(e) => setAmountB(e.target.value)} 
                        className="flex-1 text-lg" 
                      />
                      <TokenSelector selectedToken={tokenB} onSelect={setTokenB} disabledToken={tokenA} />
                    </div>
                  </div>

                  {/* Approval Steps */}
                  {(needsApprovalA || needsApprovalB) && (
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-warning" />
                        Approval Required
                      </p>
                      
                      {needsApprovalA && (
                        <Button 
                          onClick={handleApproveA} 
                          variant="outline" 
                          className="w-full"
                          disabled={approvePending || approvalStepA === 'approved'}
                        >
                          {approvalStepA === 'approving' ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving {tokenA?.symbol}...</>
                          ) : approvalStepA === 'approved' ? (
                            <><Check className="w-4 h-4 mr-2" /> {tokenA?.symbol} Approved</>
                          ) : (
                            <>Approve {tokenA?.symbol}</>
                          )}
                        </Button>
                      )}
                      
                      {needsApprovalB && (
                        <Button 
                          onClick={handleApproveB} 
                          variant="outline" 
                          className="w-full"
                          disabled={approvePending || approvalStepB === 'approved'}
                        >
                          {approvalStepB === 'approving' ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving {tokenB?.symbol}...</>
                          ) : approvalStepB === 'approved' ? (
                            <><Check className="w-4 h-4 mr-2" /> {tokenB?.symbol} Approved</>
                          ) : (
                            <>Approve {tokenB?.symbol}</>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Add Button */}
                  <Button 
                    onClick={handleAddLiquidity}
                    className="w-full btn-dragon"
                    disabled={!isConnected || isLoading || !amountA || !amountB || needsApprovalA || needsApprovalB}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Adding Liquidity...</>
                    ) : (
                      <>Add Liquidity</>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* REMOVE LIQUIDITY TAB */}
              <TabsContent value="remove">
                <div className="space-y-4">
                  <h3 className="font-semibold text-center text-lg">Remove Liquidity</h3>
                  <p className="text-sm text-muted-foreground text-center">Withdraw your liquidity position</p>
                  
                  {/* LP Balance Info */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Your LP Tokens</span>
                      <span className="font-medium">
                        {lpBalance ? parseFloat(formatEther(lpBalance)).toFixed(6) : '0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tokenA && <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />}
                      {tokenB && <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />}
                      <span className="text-sm">{tokenA?.symbol}/{tokenB?.symbol}</span>
                    </div>
                  </div>

                  {/* Amount Slider */}
                  <div className="token-input">
                    <p className="text-sm text-muted-foreground mb-4">Amount to Remove</p>
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold">{removePercent}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={removePercent} 
                      onChange={(e) => setRemovePercent(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between mt-2 gap-2">
                      {[25, 50, 75, 100].map((p) => (
                        <button
                          key={p}
                          onClick={() => setRemovePercent(p)}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                            removePercent === p ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Approval & Remove */}
                  {needsLPApproval && (
                    <Button 
                      onClick={handleApproveLPTokens}
                      variant="outline" 
                      className="w-full"
                      disabled={pairApprovePending}
                    >
                      {pairApprovePending ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving LP Tokens...</>
                      ) : (
                        <>Approve LP Tokens</>
                      )}
                    </Button>
                  )}

                  <Button 
                    onClick={handleRemoveLiquidity}
                    className="w-full"
                    variant="destructive"
                    disabled={!isConnected || isLoading || !lpBalance || lpBalance === 0n || removePercent === 0 || needsLPApproval}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Removing...</>
                    ) : (
                      <>Remove Liquidity</>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </MovingBorder>

        {/* Transaction Hash */}
        {router.hash && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <a 
              href={`https://testnet.iopn.tech/tx/${router.hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-success"
            >
              <Check className="w-4 h-4" /> Transaction Submitted <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
