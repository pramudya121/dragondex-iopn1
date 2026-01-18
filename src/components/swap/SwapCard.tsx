import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Settings, Loader2, ExternalLink } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits, formatEther, parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenSelector } from './TokenSelector';
import { TOKEN_LIST, TokenInfo, CONTRACTS } from '@/config/contracts';
import { useRouter, useGetAmountsOut, useApprove, useTokenBalance, useTokenAllowance } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const { isCorrectNetwork, switchToOPN } = useWallet();

  const [fromToken, setFromToken] = useState<TokenInfo | null>(TOKEN_LIST[0]);
  const [toToken, setToToken] = useState<TokenInfo | null>(TOKEN_LIST[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage] = useState(0.5);

  const router = useRouter();
  const { approve, isPending: isApproving } = useApprove();

  const { data: nativeBalance } = useBalance({ address });
  const { data: tokenBalance } = useTokenBalance(
    fromToken && !fromToken.isNative ? (fromToken.address as `0x${string}`) : undefined,
    address
  );

  const swapPath = useMemo(() => {
    if (!fromToken || !toToken) return [];
    const from = fromToken.isNative ? CONTRACTS.WETH : fromToken.address;
    const to = toToken.isNative ? CONTRACTS.WETH : toToken.address;
    return [from, to] as `0x${string}`[];
  }, [fromToken, toToken]);

  const amountIn = fromAmount ? parseUnits(fromAmount, fromToken?.decimals || 18) : undefined;
  const { data: amountsOut, isLoading: isQuoting } = useGetAmountsOut(amountIn, swapPath);

  const { data: allowance } = useTokenAllowance(
    fromToken && !fromToken.isNative ? (fromToken.address as `0x${string}`) : undefined,
    address,
    CONTRACTS.ROUTER as `0x${string}`
  );

  const needsApproval = useMemo(() => {
    if (!fromToken || fromToken.isNative || !amountIn) return false;
    return allowance !== undefined && allowance < amountIn;
  }, [fromToken, allowance, amountIn]);

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
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    const minOutput = (amountsOut[amountsOut.length - 1] * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;
    if (fromToken.isNative) {
      router.swapExactETHForTokens(minOutput, swapPath, address, deadline, parseEther(fromAmount));
    }
  };

  const handleApprove = async () => {
    if (!fromToken || fromToken.isNative) return;
    approve(fromToken.address as `0x${string}`, CONTRACTS.ROUTER as `0x${string}`, parseUnits('999999999', fromToken.decimals));
  };

  const fromBalance = useMemo(() => {
    if (fromToken?.isNative) return nativeBalance ? formatEther(nativeBalance.value) : '0';
    return tokenBalance ? formatUnits(tokenBalance, fromToken?.decimals || 18) : '0';
  }, [fromToken, nativeBalance, tokenBalance]);

  const isLoading = router.isPending || router.isConfirming;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Swap</h2>
        <Settings className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="token-input mb-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>From</span>
          <span>Balance: {parseFloat(fromBalance).toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Input type="number" placeholder="0.0" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} className="flex-1 text-2xl font-bold bg-transparent border-none p-0 h-auto" />
          <TokenSelector selectedToken={fromToken} onSelect={setFromToken} disabledToken={toToken} />
        </div>
      </div>

      <div className="flex justify-center -my-3 relative z-10">
        <motion.button whileHover={{ scale: 1.1, rotate: 180 }} onClick={handleSwapTokens} className="p-3 rounded-xl bg-muted border border-border hover:border-primary/50">
          <ArrowDownUp className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="token-input mt-2">
        <div className="text-sm text-muted-foreground mb-2">To</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-2xl font-bold">{isQuoting ? <Loader2 className="w-6 h-6 animate-spin" /> : toAmount || '0.0'}</div>
          <TokenSelector selectedToken={toToken} onSelect={setToToken} disabledToken={fromToken} />
        </div>
      </div>

      <div className="mt-6">
        {!isConnected ? (
          <Button className="w-full btn-dragon" disabled>Connect Wallet</Button>
        ) : !isCorrectNetwork ? (
          <Button onClick={switchToOPN} className="w-full" variant="destructive">Switch to OPN</Button>
        ) : needsApproval ? (
          <Button onClick={handleApprove} className="w-full btn-dragon" disabled={isApproving}>{isApproving ? 'Approving...' : `Approve ${fromToken?.symbol}`}</Button>
        ) : (
          <Button onClick={handleSwap} className="w-full btn-dragon" disabled={!fromAmount || isLoading}>{isLoading ? 'Swapping...' : 'Swap'}</Button>
        )}
      </div>

      {router.hash && (
        <a href={`https://testnet.iopn.tech/tx/${router.hash}`} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 text-sm text-success justify-center">
          View tx <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
}
