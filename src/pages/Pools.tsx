import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { useAllPairsLength } from '@/hooks/useContract';

export default function Pools() {
  const { data: pairsCount } = useAllPairsLength();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-8 gradient-text">Pools</h1>
        
        <div className="stat-card max-w-md mx-auto text-center">
          <Droplets className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-4xl font-bold mb-2">{pairsCount?.toString() || '0'}</h2>
          <p className="text-muted-foreground">Active Liquidity Pools</p>
        </div>

        <p className="text-center text-muted-foreground mt-8">Pool explorer coming soon...</p>
      </motion.div>
    </div>
  );
}
