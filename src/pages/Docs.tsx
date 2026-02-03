import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Code, Shield, Zap, Users, HelpCircle, ExternalLink, FileText, Github, MessageCircle,
  Rocket, Database, Layers, Wallet, ArrowRightLeft, TrendingUp, BarChart3, Coins, Lock,
  Globe, Server, Box, Cpu, ChevronRight, Star, Check, Clock, Target, Flame
} from 'lucide-react';
import { HoverEffect } from '@/components/ui/aceternity/HoverEffect';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { ShimmerButton } from '@/components/ui/magic/ShimmerButton';
import { MovingBorder } from '@/components/ui/aceternity/MovingBorder';
import { GlowingStarsBackground } from '@/components/ui/aceternity/GlowingStars';
import { BorderBeam } from '@/components/ui/magic/BorderBeam';
import { NumberTicker } from '@/components/ui/magic/NumberTicker';
import { Marquee } from '@/components/ui/magic/Marquee';
import { AnimatedGradientText } from '@/components/ui/magic/AnimatedGradientText';
import { GradientBorder } from '@/components/ui/magic/AnimatedBeam';
import { Meteors } from '@/components/ui/magic/Meteors';
import { ParticleField } from '@/components/ui/premium/ParticleField';
import { GlowOrb } from '@/components/ui/premium/GlowOrb';
import { Floating3DCard } from '@/components/ui/premium/Floating3DCard';
import { Timeline } from '@/components/ui/premium/Timeline';
import { TechStack } from '@/components/ui/premium/TechStack';
import { FeatureShowcase } from '@/components/ui/premium/FeatureShowcase';
import { Card3D } from '@/components/ui/premium/Card3D';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tech Stack Data
const techStack = [
  { name: 'React 18', description: 'Modern UI framework with hooks', icon: <Layers className="w-6 h-6" />, color: 'bg-blue-500/10 text-blue-500' },
  { name: 'TypeScript', description: 'Type-safe development', icon: <Code className="w-6 h-6" />, color: 'bg-blue-600/10 text-blue-600' },
  { name: 'Vite', description: 'Lightning fast build tool', icon: <Zap className="w-6 h-6" />, color: 'bg-purple-500/10 text-purple-500' },
  { name: 'Tailwind CSS', description: 'Utility-first styling', icon: <Box className="w-6 h-6" />, color: 'bg-cyan-500/10 text-cyan-500' },
  { name: 'Framer Motion', description: 'Premium animations', icon: <Star className="w-6 h-6" />, color: 'bg-pink-500/10 text-pink-500' },
  { name: 'wagmi + viem', description: 'Web3 integration', icon: <Globe className="w-6 h-6" />, color: 'bg-green-500/10 text-green-500' },
  { name: 'Solidity', description: 'Smart contract language', icon: <FileText className="w-6 h-6" />, color: 'bg-gray-500/10 text-gray-400' },
  { name: 'UniswapV2', description: 'Battle-tested AMM protocol', icon: <ArrowRightLeft className="w-6 h-6" />, color: 'bg-pink-400/10 text-pink-400' },
];

// Roadmap Timeline Data
const roadmapItems = [
  {
    title: 'Phase 1: Foundation',
    description: 'Core DEX infrastructure and smart contract deployment',
    status: 'completed' as const,
    icon: Rocket,
    date: 'Q4 2024',
    features: ['Smart Contracts', 'Token Swap', 'Wallet Integration'],
  },
  {
    title: 'Phase 2: Liquidity',
    description: 'Full liquidity management with auto-calculation',
    status: 'completed' as const,
    icon: Coins,
    date: 'Q1 2025',
    features: ['Add Liquidity', 'Remove Liquidity', 'Pool Creation'],
  },
  {
    title: 'Phase 3: Analytics & Portfolio',
    description: 'Advanced analytics dashboard and portfolio tracking',
    status: 'completed' as const,
    icon: BarChart3,
    date: 'Q1 2025',
    features: ['Analytics Dashboard', 'Portfolio Tracker', 'Price Charts'],
  },
  {
    title: 'Phase 4: Premium UI',
    description: 'Magic UI and Aceternity UI integration for premium experience',
    status: 'in-progress' as const,
    icon: Star,
    date: 'Q1 2025',
    features: ['3D Animations', 'Particle Effects', 'Glassmorphism'],
  },
  {
    title: 'Phase 5: Farming & Staking',
    description: 'Yield farming pools and DRAGON token staking',
    status: 'upcoming' as const,
    icon: TrendingUp,
    date: 'Q2 2025',
    features: ['Yield Farming', 'DRAGON Staking', 'Rewards Distribution'],
  },
  {
    title: 'Phase 6: Governance',
    description: 'DAO governance and community voting system',
    status: 'upcoming' as const,
    icon: Users,
    date: 'Q3 2025',
    features: ['DAO Voting', 'Proposal System', 'Treasury Management'],
  },
];

// Built Features
const builtFeatures = [
  { name: 'Token Swap', description: 'Instant token exchanges with optimal routing', status: 'done' as const, icon: ArrowRightLeft },
  { name: 'Liquidity Pools', description: 'Create and manage LP positions', status: 'done' as const, icon: Coins },
  { name: 'Pool Creation', description: 'Deploy new trading pairs', status: 'done' as const, icon: Database },
  { name: 'Wallet Integration', description: 'MetaMask, OKX, Rabby, Bitget support', status: 'done' as const, icon: Wallet },
  { name: 'Analytics Dashboard', description: 'Real-time DEX statistics', status: 'done' as const, icon: BarChart3 },
  { name: 'Portfolio Tracker', description: 'Track your holdings and LP positions', status: 'done' as const, icon: TrendingUp },
  { name: 'Token Import', description: 'Import custom tokens by address', status: 'done' as const, icon: FileText },
  { name: 'Price Impact Warnings', description: 'Slippage and price impact alerts', status: 'done' as const, icon: Shield },
  { name: 'Multi-hop Routing', description: 'Optimal trade routes (in progress)', status: 'pending' as const, icon: Layers },
  { name: 'Limit Orders', description: 'Set price targets for trades', status: 'upcoming' as const, icon: Target },
  { name: 'Yield Farming', description: 'Earn rewards on LP tokens', status: 'upcoming' as const, icon: Flame },
  { name: 'DRAGON Staking', description: 'Stake DRAGON for rewards', status: 'upcoming' as const, icon: Lock },
];

// Contract Addresses
const contracts = [
  { name: 'Factory', address: '0x266174ba738E757AA82398E7b0dd3D7840ed6232', description: 'Creates new trading pairs' },
  { name: 'Router', address: '0x51d4756EA62680eF8cC570856eE4d0E97Ab94571', description: 'Handles swap routing' },
  { name: 'WOPN', address: '0xBc022C9dEb5AF250A526321d16Ef52E39b4DBD84', description: 'Wrapped OPN token' },
  { name: 'Library', address: '0xeC697968edC511cF6f9436eD65c08897bb568Eb7', description: 'Helper functions' },
  { name: 'Multicall', address: '0x02BC332F37c6B7C0c170624d8E74e9D90c952A66', description: 'Batch contract calls' },
  { name: 'DRAGON', address: '0xFF3191bEE1640610CFA5338430f7F07CC9f5E1FF', description: 'Native DEX token' },
];

// Stats
const stats = [
  { label: 'Total Value Locked', value: 125000, prefix: '$', suffix: '+' },
  { label: 'Trading Pairs', value: 15, suffix: '+' },
  { label: 'Transactions', value: 5000, suffix: '+' },
  { label: 'Active Users', value: 250, suffix: '+' },
];

export default function Docs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <Spotlight className="hidden md:block" />
      <GlowingStarsBackground starCount={40} className="opacity-20" />
      <ParticleField particleCount={25} colorScheme="dragon" className="opacity-20" />
      <Meteors number={15} className="opacity-30" />
      
      {/* Decorative Orbs */}
      <GlowOrb color="primary" size="xl" className="top-20 -left-40 opacity-30" />
      <GlowOrb color="accent" size="lg" className="bottom-60 -right-20 opacity-20" />
      <GlowOrb color="secondary" size="md" className="top-1/2 left-1/4 opacity-15" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Hero Section */}
          <section className="text-center mb-16 pt-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm mb-6"
            >
              <BookOpen className="w-4 h-4" />
              <span>Documentation</span>
              <ChevronRight className="w-4 h-4" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <AnimatedGradientText className="text-5xl md:text-7xl font-bold">
                DRAGONDEX
              </AnimatedGradientText>
            </h1>

            <TextGenerateEffect 
              words="The Premier Decentralized Exchange on OPN Testnet. Built with cutting-edge technology for seamless DeFi trading."
              className="text-lg md:text-xl text-muted-foreground font-normal max-w-3xl mx-auto"
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <GradientBorder>
                    <div className="p-4 text-center">
                      <div className="text-2xl md:text-3xl font-bold text-primary">
                        {stat.prefix}<NumberTicker value={stat.value} />{stat.suffix}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  </GradientBorder>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-4 h-14 bg-muted/50 rounded-2xl p-1.5">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Rocket className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tech" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Code className="w-4 h-4 mr-2" />
                Technology
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Target className="w-4 h-4 mr-2" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="contracts" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4 mr-2" />
                Contracts
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  {/* What is DRAGONDEX */}
                  <div className="max-w-4xl mx-auto">
                    <MovingBorder duration={5000} borderRadius="1.5rem">
                      <div className="p-8 bg-card/95 rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-primary" />
                          </div>
                          <h2 className="text-2xl font-bold">What is DRAGONDEX?</h2>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            <strong className="text-foreground">DRAGONDEX</strong> adalah decentralized exchange (DEX) generasi baru yang dibangun di atas 
                            <strong className="text-primary"> OPN Testnet</strong> (Chain ID: 984). Menggunakan model 
                            <strong className="text-accent"> Automated Market Maker (AMM)</strong> yang terinspirasi dari protokol UniswapV2, 
                            DRAGONDEX memungkinkan pengguna untuk menukar token, menyediakan likuiditas, dan mendapatkan fee trading tanpa perantara.
                          </p>
                          <p className="text-muted-foreground leading-relaxed">
                            Dibangun dengan teknologi modern seperti React 18, TypeScript, dan wagmi untuk integrasi Web3, 
                            DRAGONDEX menghadirkan pengalaman trading yang cepat, aman, dan premium dengan animasi 3D dan efek visual yang memukau.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-6">
                          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">AMM Protocol</span>
                          <span className="px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">Non-Custodial</span>
                          <span className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">0.3% Fee</span>
                          <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">OPN Testnet</span>
                        </div>
                      </div>
                    </MovingBorder>
                  </div>

                  {/* Key Features Grid */}
                  <div>
                    <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
                    <FeatureShowcase features={builtFeatures} columns={3} />
                  </div>

                  {/* Blockchain Info */}
                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card3D glareEnabled>
                      <div className="p-6 bg-card rounded-2xl h-full">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                          <Globe className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">OPN Testnet</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            Chain ID: 984
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            RPC: testnet-rpc.iopn.tech
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            Explorer: testnet.iopn.tech
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            Native Token: OPN
                          </li>
                        </ul>
                      </div>
                    </Card3D>

                    <Card3D glareEnabled>
                      <div className="p-6 bg-card rounded-2xl h-full">
                        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                          <Shield className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Security</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            Battle-tested UniswapV2 contracts
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            Reentrancy guards
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            Input validation & sanitization
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            Non-custodial design
                          </li>
                        </ul>
                      </div>
                    </Card3D>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Technology Tab */}
            <TabsContent value="tech" className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="tech"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center max-w-2xl mx-auto mb-8">
                    <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
                    <p className="text-muted-foreground">
                      Built with modern, battle-tested technologies for optimal performance and developer experience
                    </p>
                  </div>

                  <TechStack items={techStack} />

                  {/* Architecture Diagram */}
                  <div className="max-w-4xl mx-auto">
                    <GradientBorder>
                      <div className="p-8 bg-card/95 rounded-[14px]">
                        <h3 className="text-xl font-bold mb-6 text-center">Architecture Overview</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center p-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                              <Layers className="w-8 h-8 text-primary" />
                            </div>
                            <h4 className="font-bold mb-2">Frontend</h4>
                            <p className="text-sm text-muted-foreground">React + TypeScript dengan Vite, Tailwind CSS, dan Framer Motion untuk UI premium</p>
                          </div>
                          <div className="text-center p-4">
                            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                              <Globe className="w-8 h-8 text-accent" />
                            </div>
                            <h4 className="font-bold mb-2">Web3 Layer</h4>
                            <p className="text-sm text-muted-foreground">wagmi + viem untuk interaksi blockchain yang type-safe dan efisien</p>
                          </div>
                          <div className="text-center p-4">
                            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                              <Server className="w-8 h-8 text-secondary" />
                            </div>
                            <h4 className="font-bold mb-2">Smart Contracts</h4>
                            <p className="text-sm text-muted-foreground">UniswapV2 AMM dengan Factory, Router, dan Pair contracts</p>
                          </div>
                        </div>
                      </div>
                    </GradientBorder>
                  </div>

                  {/* UI Libraries */}
                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
                      <BorderBeam size={100} duration={10} />
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        Magic UI
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• ShimmerButton - Animated call-to-action buttons</li>
                        <li>• Spotlight - Dynamic lighting effects</li>
                        <li>• NumberTicker - Animated statistics</li>
                        <li>• Marquee - Scrolling price tickers</li>
                        <li>• BorderBeam - Glowing border animations</li>
                        <li>• Meteors - Particle background effects</li>
                      </ul>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
                      <BorderBeam size={100} duration={10} delay={5} />
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Aceternity UI
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• MovingBorder - Animated container borders</li>
                        <li>• BackgroundGradient - Dynamic gradients</li>
                        <li>• GlowingStars - Starfield backgrounds</li>
                        <li>• TextGenerateEffect - Typewriter animations</li>
                        <li>• FloatingDock - Mobile navigation</li>
                        <li>• HoverEffect - Interactive cards</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-3xl mx-auto"
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-4">Development Roadmap</h2>
                    <p className="text-muted-foreground">
                      Our journey to build the ultimate DEX on OPN Testnet
                    </p>
                  </div>

                  <Timeline items={roadmapItems} />

                  {/* Progress Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12"
                  >
                    <GradientBorder>
                      <div className="p-6 bg-card/95 rounded-[14px]">
                        <h3 className="text-lg font-bold mb-4 text-center">Development Progress</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-3xl font-bold text-success">
                              <NumberTicker value={3} />
                            </div>
                            <p className="text-xs text-muted-foreground">Phases Completed</p>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-primary">
                              <NumberTicker value={1} />
                            </div>
                            <p className="text-xs text-muted-foreground">In Progress</p>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-muted-foreground">
                              <NumberTicker value={2} />
                            </div>
                            <p className="text-xs text-muted-foreground">Upcoming</p>
                          </div>
                        </div>
                        <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-success via-primary to-accent"
                            initial={{ width: 0 }}
                            whileInView={{ width: '60%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-2">60% Complete</p>
                      </div>
                    </GradientBorder>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="contracts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Smart Contracts</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      All contracts deployed on OPN Testnet. View source code and transactions on the block explorer.
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto space-y-4">
                    {contracts.map((contract, idx) => (
                      <motion.div
                        key={contract.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative overflow-hidden"
                      >
                        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Code className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">{contract.name}</h4>
                                <p className="text-sm text-muted-foreground">{contract.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <code className="text-xs bg-muted px-3 py-2 rounded-lg font-mono">
                                {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                              </code>
                              <a
                                href={`https://testnet.iopn.tech/address/${contract.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Network Info */}
                  <div className="max-w-4xl mx-auto mt-8">
                    <GradientBorder>
                      <div className="p-6 bg-card/95 rounded-[14px]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-primary" />
                          Network Configuration
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Network Name</span>
                              <span className="font-medium">OPN Testnet</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Chain ID</span>
                              <span className="font-mono">984</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Currency Symbol</span>
                              <span className="font-medium">OPN</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">RPC URL</span>
                              <span className="font-mono text-xs">testnet-rpc.iopn.tech</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Block Explorer</span>
                              <span className="font-mono text-xs">testnet.iopn.tech</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Protocol</span>
                              <span className="font-medium">UniswapV2 AMM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GradientBorder>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>

          {/* FAQ Section */}
          <section className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                {
                  q: 'What is DRAGONDEX?',
                  a: 'DRAGONDEX is a decentralized exchange (DEX) built on OPN Testnet using the automated market maker (AMM) model. It allows users to swap tokens and provide liquidity to earn trading fees.',
                },
                {
                  q: 'How do I get started?',
                  a: 'Connect a Web3 wallet (MetaMask, OKX, Rabby, or Bitget), get some testnet OPN from the faucet, and you\'re ready to start trading!',
                },
                {
                  q: 'What are the trading fees?',
                  a: 'DRAGONDEX charges a 0.3% fee on all trades. This fee is distributed to liquidity providers proportional to their share of the pool.',
                },
                {
                  q: 'Is DRAGONDEX safe?',
                  a: 'DRAGONDEX uses battle-tested UniswapV2 smart contracts with reentrancy guards and comprehensive validation. However, as with any DeFi protocol, there are inherent smart contract risks.',
                },
              ].map((faq, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-card border border-border rounded-xl overflow-hidden"
                >
                  <summary className="p-4 cursor-pointer font-semibold flex items-center justify-between hover:bg-muted/50 transition-colors">
                    {faq.q}
                    <span className="text-primary group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <div className="px-4 pb-4 text-muted-foreground text-sm">
                    {faq.a}
                  </div>
                </motion.details>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <MovingBorder duration={6000} borderRadius="1.5rem">
              <div className="p-8 bg-card/95 rounded-3xl">
                <h3 className="text-2xl font-bold mb-3">Ready to Trade?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start swapping tokens and earning fees on DRAGONDEX today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ShimmerButton onClick={() => window.location.href = '/'}>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch App
                  </ShimmerButton>
                  <Button variant="outline" className="rounded-xl" onClick={() => window.open('https://testnet.iopn.tech', '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Testnet OPN
                  </Button>
                </div>
              </div>
            </MovingBorder>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
