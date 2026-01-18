import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Plus, Minus, Loader2 } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWETH, useTokenBalance } from '@/hooks/useContract';
import { CONTRACTS } from '@/config/contracts';

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [wrapAmount, setWrapAmount] = useState('');
  const [unwrapAmount, setUnwrapAmount] = useState('');
  
  const { data: opnBalance } = useBalance({ address });
  const { data: wopnBalance } = useTokenBalance(CONTRACTS.WETH as `0x${string}`, address);
  const { deposit, withdraw, isPending, isConfirming, hash } = useWETH();

  const handleWrap = () => { if (wrapAmount) deposit(parseEther(wrapAmount)); };
  const handleUnwrap = () => { if (unwrapAmount && wopnBalance) withdraw(parseEther(unwrapAmount)); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-8 gradient-text">Liquidity</h1>
        <Tabs defaultValue="wrap" className="w-full">
          <TabsList className="w-full mb-6 bg-muted/50">
            <TabsTrigger value="wrap" className="flex-1">Wrap/Unwrap</TabsTrigger>
            <TabsTrigger value="add" className="flex-1">Add</TabsTrigger>
            <TabsTrigger value="remove" className="flex-1">Remove</TabsTrigger>
          </TabsList>

          <TabsContent value="wrap">
            <div className="glass-card p-6 space-y-6">
              <h3 className="font-semibold text-center">OPN ↔ WOPN</h3>
              <div className="token-input">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Wrap OPN</span>
                  <span>Balance: {opnBalance ? parseFloat(formatEther(opnBalance.value)).toFixed(4) : '0'}</span>
                </div>
                <div className="flex gap-3">
                  <Input type="number" placeholder="0.0" value={wrapAmount} onChange={(e) => setWrapAmount(e.target.value)} className="flex-1" />
                  <Button onClick={handleWrap} disabled={!isConnected || isPending || isConfirming} className="btn-dragon">
                    {isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Wrap'}
                  </Button>
                </div>
              </div>
              <div className="flex justify-center"><ArrowDownUp className="w-6 h-6 text-muted-foreground" /></div>
              <div className="token-input">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Unwrap WOPN</span>
                  <span>Balance: {wopnBalance ? parseFloat(formatEther(wopnBalance)).toFixed(4) : '0'}</span>
                </div>
                <div className="flex gap-3">
                  <Input type="number" placeholder="0.0" value={unwrapAmount} onChange={(e) => setUnwrapAmount(e.target.value)} className="flex-1" />
                  <Button onClick={handleUnwrap} disabled={!isConnected || isPending || isConfirming} variant="outline">
                    {isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unwrap'}
                  </Button>
                </div>
              </div>
              {hash && <a href={`https://testnet.iopn.tech/tx/${hash}`} target="_blank" className="block text-center text-sm text-primary">View Tx →</a>}
            </div>
          </TabsContent>

          <TabsContent value="add">
            <div className="glass-card p-6 text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Add Liquidity coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="remove">
            <div className="glass-card p-6 text-center">
              <Minus className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Remove Liquidity coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
