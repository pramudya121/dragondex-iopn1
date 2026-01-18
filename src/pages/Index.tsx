import { motion } from 'framer-motion';
import { SwapCard } from '@/components/swap/SwapCard';
import { Flame, TrendingUp, Shield, Zap } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Instant Swaps', desc: 'Lightning-fast trades on OPN Testnet' },
  { icon: Shield, title: 'Secure', desc: 'Audited smart contracts' },
  { icon: TrendingUp, title: 'Best Rates', desc: 'Optimal pricing via AMM' },
];

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flame className="w-8 h-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-black gradient-text">DRAGONDEX</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          The premier decentralized exchange on OPN Testnet. Swap, provide liquidity, and earn.
        </p>
      </motion.div>

      {/* Swap Card */}
      <SwapCard />

      {/* Features */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <f.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
            <h3 className="font-bold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
