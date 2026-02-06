import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShimmerButton } from '@/components/ui/magic/ShimmerButton';
import { AnimatedGradientText } from '@/components/ui/magic/AnimatedGradientText';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { TokenGlobe } from '@/components/ui/premium/TokenGlobe';
import { useAllPairsLength } from '@/hooks/useContract';

export function HeroSection() {
  const { data: pairsCount } = useAllPairsLength();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Radial glow behind globe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/8 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm mb-6"
            >
              <Flame className="w-4 h-4" />
              <span>Live on OPN Testnet</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
              <AnimatedGradientText className="text-5xl md:text-6xl lg:text-7xl font-black">
                DRAGONDEX
              </AnimatedGradientText>
            </h1>

            <TextGenerateEffect
              words="The premier decentralized exchange on OPN Testnet. Swap, provide liquidity, and earn with the power of the dragon."
              className="text-lg md:text-xl text-muted-foreground font-normal mb-8 max-w-xl mx-auto lg:mx-0"
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: 694556130, label: 'Total Value Locked', prefix: '$', color: 'text-primary' },
                { value: Number(pairsCount || 0), label: 'Active Pools', prefix: '', color: 'text-secondary' },
                { value: 45892, label: 'Traders', prefix: '', color: 'text-accent' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 overflow-hidden"
                >
                  <BorderBeam size={60} duration={10} delay={idx} />
                  <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                    {stat.prefix}<NumberTicker value={stat.value} />
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <Link to="/swap">
                <ShimmerButton>
                  <Flame className="w-5 h-5 mr-2" />
                  Start Trading
                </ShimmerButton>
              </Link>

              <motion.a
                href="https://testnet.iopn.tech"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/50 transition-all font-medium"
              >
                Get Testnet OPN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right side - 3D Token Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block"
          >
            <TokenGlobe />
          </motion.div>
        </div>

        {/* Mobile Token Globe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:hidden mt-8"
        >
          <TokenGlobe className="h-[400px] scale-[0.65]" />
        </motion.div>
      </div>
    </section>
  );
}
