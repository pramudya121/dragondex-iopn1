 import { motion } from 'framer-motion';
 import { Flame, ArrowRight } from 'lucide-react';
 import { ShimmerButton } from '@/components/ui/magic/ShimmerButton';
 import { AnimatedGradientText } from '@/components/ui/magic/AnimatedGradientText';
 import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
 import { NumberTicker } from '@/components/ui/magic/NumberTicker';
 import { BorderBeam } from '@/components/ui/magic/BorderBeam';
 import { TokenSolarSystem } from '@/components/ui/premium/TokenOrbit';
 import { useAllPairsLength } from '@/hooks/useContract';
 
 export function HeroSection() {
   const { data: pairsCount } = useAllPairsLength();
 
   return (
     <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
       {/* Background gradient layers */}
       <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
       
       {/* Radial glow behind orbit */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
 
       {/* Main content container */}
       <div className="container mx-auto px-4 relative z-10">
         <div className="grid lg:grid-cols-2 gap-8 items-center">
           
           {/* Left side - Text content */}
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="text-center lg:text-left"
           >
             {/* Badge */}
             <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm mb-6"
             >
               <Flame className="w-4 h-4" />
               <span>Live on OPN Testnet</span>
             </motion.div>
 
             {/* Title */}
             <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
               <AnimatedGradientText className="text-5xl md:text-6xl lg:text-7xl font-black">
                 DRAGONDEX
               </AnimatedGradientText>
             </h1>
 
             {/* Subtitle */}
             <TextGenerateEffect
               words="The premier decentralized exchange on OPN Testnet. Swap, provide liquidity, and earn with the power of the dragon."
               className="text-lg md:text-xl text-muted-foreground font-normal mb-8 max-w-xl mx-auto lg:mx-0"
             />
 
             {/* Stats */}
             <div className="grid grid-cols-3 gap-4 mb-8">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 overflow-hidden"
               >
                 <BorderBeam size={60} duration={10} />
                 <p className="text-2xl md:text-3xl font-bold text-primary">
                   $<NumberTicker value={694556130} />
                 </p>
                 <p className="text-xs text-muted-foreground">Total Value Locked</p>
               </motion.div>
               
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
                 className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 overflow-hidden"
               >
                 <BorderBeam size={60} duration={10} delay={1} />
                 <p className="text-2xl md:text-3xl font-bold text-secondary">
                   <NumberTicker value={Number(pairsCount || 0)} />
                 </p>
                 <p className="text-xs text-muted-foreground">Active Pools</p>
               </motion.div>
               
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.6 }}
                 className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 overflow-hidden"
               >
                 <BorderBeam size={60} duration={10} delay={2} />
                 <p className="text-2xl md:text-3xl font-bold text-accent">
                   <NumberTicker value={45892} />
                 </p>
                 <p className="text-xs text-muted-foreground">Traders</p>
               </motion.div>
             </div>
 
             {/* CTA Buttons */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.7 }}
               className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
             >
               <ShimmerButton onClick={() => document.getElementById('swap-section')?.scrollIntoView({ behavior: 'smooth' })}>
                 <Flame className="w-5 h-5 mr-2" />
                 Start Trading
               </ShimmerButton>
               
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
 
           {/* Right side - Token Solar System */}
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.3 }}
             className="hidden lg:block"
           >
             <TokenSolarSystem />
           </motion.div>
         </div>
 
         {/* Mobile Token Orbit (smaller) */}
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="lg:hidden mt-8"
         >
           <TokenSolarSystem className="h-[400px] scale-75" />
         </motion.div>
       </div>
     </section>
   );
 }