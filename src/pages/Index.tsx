 import { motion } from 'framer-motion';
 import { SwapCard } from '@/components/swap/SwapCard';
import { Spotlight } from '@/components/ui/magic/Spotlight';
 import { Meteors } from '@/components/ui/magic/Meteors';
 import { GlowingStarsBackground } from '@/components/ui/aceternity/GlowingStars';
 import { ParticleField } from '@/components/ui/premium/ParticleField';
 import { GlowOrb } from '@/components/ui/premium/GlowOrb';
 import { HeroSection } from '@/components/home/HeroSection';
 import { FeaturesSection } from '@/components/home/FeaturesSection';
 import { PriceTicker } from '@/components/home/PriceTicker';
 import { CTASection } from '@/components/home/CTASection';

export default function Index() {
  return (
     <div className="relative min-h-screen overflow-hidden">
       {/* Premium Background Effects */}
      <Spotlight className="hidden md:block" />
       <GlowingStarsBackground starCount={30} className="opacity-15" />
       <ParticleField particleCount={20} colorScheme="dragon" className="opacity-15" />
       <Meteors number={10} className="opacity-20" />
       
       {/* Decorative Glow Orbs */}
       <GlowOrb color="primary" size="xl" className="top-20 -left-40 opacity-25" />
       <GlowOrb color="accent" size="lg" className="bottom-40 -right-20 opacity-20" />
       <GlowOrb color="secondary" size="md" className="top-1/2 left-1/4 opacity-10" />
      
      {/* Price Ticker Marquee */}
       <PriceTicker />

       {/* Hero Section with Token Solar System */}
       <HeroSection />

       {/* Swap Section */}
       <section id="swap-section" className="relative py-12">
         <div className="container mx-auto px-4 flex justify-center">
          <SwapCard />
        </div>
       </section>

       {/* Features Section */}
       <FeaturesSection />

       {/* CTA Section */}
       <CTASection />
    </div>
  );
}
