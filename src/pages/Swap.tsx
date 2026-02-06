import { motion } from 'framer-motion';
import { SwapCard } from '@/components/swap/SwapCard';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { GlowingStarsBackground } from '@/components/ui/aceternity/GlowingStars';
import { ParticleField } from '@/components/ui/premium/ParticleField';
import { GlowOrb } from '@/components/ui/premium/GlowOrb';
import { Meteors } from '@/components/ui/magic/Meteors';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { Flame, Shield } from 'lucide-react';

export default function Swap() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <Spotlight className="hidden md:block" />
      <GlowingStarsBackground starCount={25} className="opacity-15" />
      <ParticleField particleCount={15} colorScheme="dragon" className="opacity-15" />
      <Meteors number={8} className="opacity-20" />
      
      {/* Glow Orbs */}
      <GlowOrb color="primary" size="xl" className="top-20 -left-40 opacity-25" />
      <GlowOrb color="accent" size="lg" className="bottom-40 -right-20 opacity-20" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4"
          >
            <Flame className="w-4 h-4" />
            <span>Swap Tokens</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Trade Instantly</h1>
          <TextGenerateEffect
            words="Swap tokens with the best rates on OPN Testnet. Fast, secure, and decentralized."
            className="text-sm text-muted-foreground font-normal"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-success/10 text-success text-xs"
          >
            <Shield className="w-3 h-3" />
            <span>Secure & Audited</span>
          </motion.div>
        </motion.div>

        {/* Swap Card */}
        <SwapCard />
      </div>
    </div>
  );
}
