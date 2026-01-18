import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useTokenBalance } from '@/hooks/useContract';
import { CONTRACTS } from '@/config/contracts';

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { data: opnBalance } = useBalance({ address });
  const { data: wopnBalance } = useTokenBalance(CONTRACTS.WETH as `0x${string}`, address);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-12 max-w-md mx-auto text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground">Connect to view portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-8 gradient-text">Portfolio</h1>
        <div className="max-w-lg mx-auto space-y-4">
          <div className="glass-card p-4 flex items-center gap-4">
            <img src="/tokens/opn.jpg" alt="OPN" className="w-10 h-10 rounded-full" />
            <div className="flex-1"><p className="font-semibold">OPN</p></div>
            <p className="font-bold">{opnBalance ? parseFloat(formatEther(opnBalance.value)).toFixed(4) : '0'}</p>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <img src="/tokens/opn.jpg" alt="WOPN" className="w-10 h-10 rounded-full" />
            <div className="flex-1"><p className="font-semibold">WOPN</p></div>
            <p className="font-bold">{wopnBalance ? parseFloat(formatEther(wopnBalance)).toFixed(4) : '0'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
