import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, ExternalLink, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { TOKEN_LIST, TokenInfo, CONTRACTS } from '@/config/contracts';
import { useFactory, useGetPair, useApprove, useTokenAllowance, useTokenBalance } from '@/hooks/useContract';
import { MovingBorder } from '@/components/ui/aceternity/MovingBorder';
import { BackgroundGradient } from '@/components/ui/aceternity/BackgroundGradient';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { toast } from 'sonner';
import { formatUnits, parseUnits } from 'viem';
import { cn } from '@/lib/utils';

export default function CreatePool() {
  const { address, isConnected } = useAccount();
  const [tokenA, setTokenA] = useState<TokenInfo | null>(null);
  const [tokenB, setTokenB] = useState<TokenInfo | null>(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [step, setStep] = useState<'select' | 'approve' | 'create'>('select');

  const factory = useFactory();
  const { approve: approveA, isPending: approvingA, isSuccess: approvedA } = useApprove();
  const { approve: approveB, isPending: approvingB, isSuccess: approvedB } = useApprove();

  // Check if pair exists
  const { data: pairAddress } = useGetPair(
    tokenA && !tokenA.isNative ? (tokenA.address as `0x${string}`) : undefined,
    tokenB && !tokenB.isNative ? (tokenB.address as `0x${string}`) : undefined
  );

  // Get balances
  const { data: balanceA } = useTokenBalance(
    tokenA && !tokenA.isNative ? (tokenA.address as `0x${string}`) : undefined,
    address
  );
  const { data: balanceB } = useTokenBalance(
    tokenB && !tokenB.isNative ? (tokenB.address as `0x${string}`) : undefined,
    address
  );

  // Get allowances
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

  const pairExists = pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000';
  
  const amountABigInt = amountA ? parseUnits(amountA, tokenA?.decimals || 18) : 0n;
  const amountBBigInt = amountB ? parseUnits(amountB, tokenB?.decimals || 18) : 0n;
  
  const needsApprovalA = tokenA && !tokenA.isNative && allowanceA !== undefined && allowanceA < amountABigInt;
  const needsApprovalB = tokenB && !tokenB.isNative && allowanceB !== undefined && allowanceB < amountBBigInt;

  const handleCreatePair = () => {
    if (!tokenA || !tokenB) return;
    
    const addressA = tokenA.isNative ? CONTRACTS.WETH : tokenA.address;
    const addressB = tokenB.isNative ? CONTRACTS.WETH : tokenB.address;
    
    toast.loading('Creating pool...', { id: 'create-pool' });
    factory.createPair(addressA as `0x${string}`, addressB as `0x${string}`);
  };

  const handleApproveA = () => {
    if (!tokenA || tokenA.isNative) return;
    toast.loading(`Approving ${tokenA.symbol}...`, { id: 'approve-a' });
    approveA(tokenA.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, parseUnits('999999999', tokenA.decimals));
  };

  const handleApproveB = () => {
    if (!tokenB || tokenB.isNative) return;
    toast.loading(`Approving ${tokenB.symbol}...`, { id: 'approve-b' });
    approveB(tokenB.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, parseUnits('999999999', tokenB.decimals));
  };

  const canProceed = tokenA && tokenB && tokenA.address !== tokenB.address;
  const isLoading = factory.isPending || factory.isConfirming;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl relative">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Create Pool</h1>
          <p className="text-muted-foreground">Create a new liquidity pool and be the first provider</p>
        </div>

        <MovingBorder duration={3000} borderRadius="1.5rem">
          <div className="p-6 space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {['Select Tokens', 'Approve', 'Create Pool'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    i === 0 ? "bg-primary text-primary-foreground" :
                    i === 1 && (needsApprovalA || needsApprovalB) ? "bg-primary text-primary-foreground" :
                    i === 2 && canProceed && !needsApprovalA && !needsApprovalB ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <span className="text-sm hidden sm:block">{label}</span>
                  {i < 2 && <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />}
                </div>
              ))}
            </div>

            {/* Token Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="token-input">
                <label className="block text-sm text-muted-foreground mb-2">First Token</label>
                <TokenSelector 
                  selectedToken={tokenA} 
                  onSelect={setTokenA} 
                  disabledToken={tokenB}
                />
                {tokenA && balanceA && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Balance: {parseFloat(formatUnits(balanceA, tokenA.decimals)).toFixed(4)}
                  </p>
                )}
              </div>

              <div className="token-input">
                <label className="block text-sm text-muted-foreground mb-2">Second Token</label>
                <TokenSelector 
                  selectedToken={tokenB} 
                  onSelect={setTokenB} 
                  disabledToken={tokenA}
                />
                {tokenB && balanceB && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Balance: {parseFloat(formatUnits(balanceB, tokenB.decimals)).toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Pair Status */}
            {tokenA && tokenB && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={cn(
                  "p-4 rounded-xl border",
                  pairExists 
                    ? "bg-success/10 border-success/30" 
                    : "bg-primary/10 border-primary/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-8 h-8 rounded-full border-2 border-background" />
                    <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-8 h-8 rounded-full border-2 border-background" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{tokenA.symbol}/{tokenB.symbol}</p>
                    {pairExists ? (
                      <p className="text-sm text-success flex items-center gap-1">
                        <Check className="w-3 h-3" /> Pool exists - add liquidity instead
                      </p>
                    ) : (
                      <p className="text-sm text-primary">New pool - you'll set the initial price</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Initial Amounts (for new pools) */}
            {canProceed && !pairExists && (
              <div className="space-y-4">
                <h3 className="font-semibold">Set Initial Liquidity</h3>
                <p className="text-sm text-muted-foreground">
                  The ratio of tokens you provide will set the initial price
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="token-input">
                    <label className="block text-sm text-muted-foreground mb-2">{tokenA?.symbol} Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amountA}
                      onChange={(e) => setAmountA(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="token-input">
                    <label className="block text-sm text-muted-foreground mb-2">{tokenB?.symbol} Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amountB}
                      onChange={(e) => setAmountB(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                </div>

                {amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="text-muted-foreground">Initial Rate:</p>
                    <p className="font-medium">
                      1 {tokenA?.symbol} = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} {tokenB?.symbol}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Approval Buttons */}
            {canProceed && !pairExists && (needsApprovalA || needsApprovalB) && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  Token Approvals Required
                </h3>
                
                {needsApprovalA && (
                  <Button
                    onClick={handleApproveA}
                    variant="outline"
                    className="w-full"
                    disabled={approvingA}
                  >
                    {approvingA ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving {tokenA?.symbol}...</>
                    ) : approvedA ? (
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
                    disabled={approvingB}
                  >
                    {approvingB ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving {tokenB?.symbol}...</>
                    ) : approvedB ? (
                      <><Check className="w-4 h-4 mr-2" /> {tokenB?.symbol} Approved</>
                    ) : (
                      <>Approve {tokenB?.symbol}</>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreatePair}
              className="w-full btn-dragon"
              disabled={!canProceed || pairExists || isLoading || needsApprovalA || needsApprovalB}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Pool...</>
              ) : pairExists ? (
                <>Pool Already Exists</>
              ) : !canProceed ? (
                <>Select Tokens</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Create Pool</>
              )}
            </Button>

            {/* Transaction Hash */}
            {factory.hash && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <a 
                  href={`https://testnet.iopn.tech/tx/${factory.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-success"
                >
                  <Check className="w-4 h-4" /> Pool Created! <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            )}
          </div>
        </MovingBorder>

        {/* Info Card */}
        <BackgroundGradient containerClassName="mt-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-3">Creating a Pool</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                You're the first liquidity provider - you set the initial exchange rate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                The ratio of tokens you add determines the price
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                You'll earn 0.3% of all trades on this pair
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                LP tokens represent your share of the pool
              </li>
            </ul>
          </div>
        </BackgroundGradient>
      </motion.div>
    </div>
  );
}
