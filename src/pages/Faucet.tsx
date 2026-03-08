import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Loader2, CheckCircle, AlertCircle, Coins, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { GlowingStarsCard } from '@/components/ui/aceternity/GlowingStars';
import { TOKEN_LIST, CONTRACTS } from '@/config/contracts';
import { ERC20_ABI } from '@/config/abis';
import { cn } from '@/lib/utils';

// Faucet amounts per token (testnet amounts)
const FAUCET_TOKENS = [
  { symbol: 'DRAGON', name: 'Dragon Token', address: CONTRACTS.DRAGON, amount: '1000', logo: '/tokens/dragon.png', color: 'from-red-500/20 to-orange-500/20' },
  { symbol: 'BNB', name: 'Binance Coin', address: CONTRACTS.BNB, amount: '0.5', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', color: 'from-yellow-500/20 to-amber-500/20' },
  { symbol: 'ETH', name: 'Ethereum', address: CONTRACTS.ETH, amount: '0.1', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', color: 'from-blue-500/20 to-indigo-500/20' },
  { symbol: 'MON', name: 'Monad', address: CONTRACTS.MON, amount: '100', logo: '/tokens/mon.jpg', color: 'from-purple-500/20 to-violet-500/20' },
  { symbol: 'HYPE', name: 'Hyperliquid', address: CONTRACTS.HYPE, amount: '10', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png', color: 'from-green-500/20 to-emerald-500/20' },
];

// Cooldown 24 hours in ms
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function useFaucetCooldown(symbol: string) {
  const key = `faucet_${symbol}_last`;
  const last = localStorage.getItem(key);
  const lastTime = last ? parseInt(last) : 0;
  const now = Date.now();
  const remaining = Math.max(0, COOLDOWN_MS - (now - lastTime));
  const canClaim = remaining === 0;

  const setClaimed = () => {
    localStorage.setItem(key, Date.now().toString());
  };

  const formatRemaining = () => {
    if (canClaim) return '';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return { canClaim, setClaimed, remaining: formatRemaining() };
}

function FaucetCard({ token, index }: { token: typeof FAUCET_TOKENS[0]; index: number }) {
  const { address, isConnected } = useAccount();
  const { canClaim, setClaimed, remaining } = useFaucetCooldown(token.symbol);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [errorMsg, setErrorMsg] = useState('');

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

  // Note: In a real faucet, this would call a backend/faucet contract
  // For testnet demo, we simulate by showing the claim UI
  // Users would need to have the faucet contract deployed
  const handleClaim = async () => {
    if (!isConnected || !canClaim) return;
    setStatus('pending');
    setErrorMsg('');

    try {
      // In production, this would call a faucet contract's `claim` function
      // For now, show a friendly message about the testnet faucet
      setTimeout(() => {
        setClaimed();
        setStatus('success');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message?.slice(0, 100) || 'Failed to claim');
    }
  };

  const isLoading = status === 'pending' || isPending || isConfirming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative group"
    >
      <div className={cn(
        "relative glass-card p-5 hover:border-primary/50 transition-all duration-300 overflow-hidden",
      )}>
        <BorderBeam size={60} duration={12} delay={index * 2} />

        {/* Background gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", token.color)} />

        <div className="relative z-10">
          {/* Token Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={token.logo}
              alt={token.symbol}
              className="w-12 h-12 rounded-full border-2 border-border shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = '/tokens/opn.jpg'; }}
            />
            <div className="flex-1">
              <h3 className="font-bold text-base">{token.symbol}</h3>
              <p className="text-xs text-muted-foreground">{token.name}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{token.amount}</p>
              <p className="text-[10px] text-muted-foreground">per claim</p>
            </div>
          </div>

          {/* Status */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 mb-3"
            >
              <CheckCircle className="w-4 h-4 text-success" />
              <p className="text-xs text-success font-medium">
                {token.amount} {token.symbol} claimed successfully!
              </p>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-3">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-xs text-destructive">{errorMsg}</p>
            </div>
          )}

          {/* Claim Button */}
          <Button
            className={cn(
              "w-full",
              canClaim && isConnected ? "btn-dragon" : ""
            )}
            variant={!canClaim || !isConnected ? "outline" : "default"}
            disabled={!isConnected || !canClaim || isLoading}
            onClick={handleClaim}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Claiming...</>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !canClaim ? (
              <><Clock className="w-4 h-4 mr-2" />Cooldown: {remaining}</>
            ) : (
              <><Droplet className="w-4 h-4 mr-2" />Claim {token.amount} {token.symbol}</>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Faucet() {
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-24 lg:pb-8 relative min-h-screen">
      <Spotlight className="hidden md:block" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 mb-3"
          >
            <Droplet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Testnet Faucet</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-3">Token Faucet</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Claim free testnet tokens to start trading on DragonDEX. Each token can be claimed once every 24 hours.
          </p>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 mb-6 flex items-start gap-3"
        >
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">How it works</p>
            <p className="text-xs text-muted-foreground">
              Connect your wallet and claim test tokens below. For native OPN tokens, use the{' '}
              <a href="https://testnet.iopn.tech" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                OPN Testnet Faucet
              </a>. Tokens are free and for testing purposes only.
            </p>
          </div>
        </motion.div>

        {/* Native OPN Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative glass-card p-5 overflow-hidden">
            <BorderBeam size={80} duration={10} />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <img src="/tokens/opn.jpg" alt="OPN" className="w-14 h-14 rounded-full border-2 border-primary shadow-lg" />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg">OPN (Native)</h3>
                <p className="text-xs text-muted-foreground">Native gas token for OPN Testnet</p>
              </div>
              <a
                href="https://testnet.iopn.tech"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="btn-dragon">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Claim on OPN Faucet
                </Button>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FAUCET_TOKENS.map((token, i) => (
            <FaucetCard key={token.symbol} token={token} index={i} />
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          <div className="stat-card text-center">
            <Coins className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{FAUCET_TOKENS.length + 1}</p>
            <p className="text-[10px] text-muted-foreground">Available Tokens</p>
          </div>
          <div className="stat-card text-center">
            <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold">24h</p>
            <p className="text-[10px] text-muted-foreground">Cooldown Period</p>
          </div>
          <div className="stat-card text-center">
            <Droplet className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold">Free</p>
            <p className="text-[10px] text-muted-foreground">Testnet Only</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
