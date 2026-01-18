import { motion } from 'framer-motion';
import { BookOpen, Code, Shield, Zap, Users, HelpCircle, ExternalLink, FileText, Github, MessageCircle } from 'lucide-react';
import { HoverEffect } from '@/components/ui/aceternity/HoverEffect';
import { Spotlight } from '@/components/ui/magic/Spotlight';
import { TextGenerateEffect } from '@/components/ui/aceternity/TextGenerateEffect';
import { ShimmerButton } from '@/components/ui/magic/ShimmerButton';

const docSections = [
  {
    title: 'Getting Started',
    description: 'Learn how to connect your wallet and start trading on DRAGONDEX',
    icon: <BookOpen className="w-6 h-6" />,
    link: '#getting-started',
  },
  {
    title: 'How Swaps Work',
    description: 'Understand the AMM mechanism and how token swaps are executed',
    icon: <Zap className="w-6 h-6" />,
    link: '#swaps',
  },
  {
    title: 'Providing Liquidity',
    description: 'Learn how to add liquidity and earn trading fees from your deposits',
    icon: <Users className="w-6 h-6" />,
    link: '#liquidity',
  },
  {
    title: 'Security',
    description: 'Explore our smart contract security measures and audit reports',
    icon: <Shield className="w-6 h-6" />,
    link: '#security',
  },
  {
    title: 'Smart Contracts',
    description: 'Technical documentation for developers integrating with DRAGONDEX',
    icon: <Code className="w-6 h-6" />,
    link: '#contracts',
  },
  {
    title: 'FAQ',
    description: 'Find answers to commonly asked questions about the platform',
    icon: <HelpCircle className="w-6 h-6" />,
    link: '#faq',
  },
];

const resources = [
  {
    title: 'OPN Testnet Faucet',
    description: 'Get free testnet OPN tokens to try the DEX',
    icon: <ExternalLink className="w-5 h-5" />,
    link: 'https://testnet.iopn.tech',
  },
  {
    title: 'Block Explorer',
    description: 'View transactions and smart contracts on OPN Explorer',
    icon: <FileText className="w-5 h-5" />,
    link: 'https://testnet.iopn.tech',
  },
  {
    title: 'GitHub',
    description: 'View source code and contribute to DRAGONDEX',
    icon: <Github className="w-5 h-5" />,
    link: '#github',
  },
  {
    title: 'Community',
    description: 'Join our Discord for support and discussions',
    icon: <MessageCircle className="w-5 h-5" />,
    link: '#discord',
  },
];

const contracts = [
  { name: 'Factory', address: '0x266174ba738E757AA82398E7b0dd3D7840ed6232' },
  { name: 'Router', address: '0x51d4756EA62680eF8cC570856eE4d0E97Ab94571' },
  { name: 'WETH (WOPN)', address: '0x5D34a1b5c9753ED978939f9CAd3635A439B41898' },
  { name: 'Library', address: '0xeC697968edC511cF6f9436eD65c08897bb568Eb7' },
  { name: 'Multicall', address: '0x02BC332F37c6B7C0c170624d8E74e9D90c952A66' },
];

export default function Docs() {
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <Spotlight className="hidden md:block" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Documentation</h1>
          <TextGenerateEffect 
            words="Everything you need to know about using DRAGONDEX"
            className="text-xl text-muted-foreground font-normal"
          />
        </div>

        {/* Main Docs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Guides</h2>
          <HoverEffect items={docSections} />
        </section>

        {/* Smart Contracts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Contract Addresses</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold">Contract</th>
                  <th className="text-left py-3 px-4 font-semibold">Address</th>
                  <th className="text-right py-3 px-4 font-semibold">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract, i) => (
                  <tr key={contract.name} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-3 px-4 font-medium">{contract.name}</td>
                    <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                      {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a 
                        href={`https://testnet.iopn.tech/address/${contract.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Resources */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((resource, i) => (
              <motion.a
                key={resource.title}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {resource.icon}
                </div>
                <h3 className="font-semibold mb-1">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </motion.a>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
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
                q: 'What is impermanent loss?',
                a: 'Impermanent loss occurs when the price ratio of tokens in a pool changes after you\'ve deposited them. The larger the change, the more significant the loss compared to simply holding the tokens.',
              },
              {
                q: 'Is DRAGONDEX safe?',
                a: 'DRAGONDEX uses battle-tested UniswapV2 smart contracts with reentrancy guards and comprehensive validation. However, as with any DeFi protocol, there are inherent smart contract risks.',
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card group"
              >
                <summary className="p-4 cursor-pointer font-semibold flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-2">Need More Help?</h3>
            <p className="text-muted-foreground mb-6">
              Join our community for support and discussions
            </p>
            <ShimmerButton>
              Join Discord
            </ShimmerButton>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
