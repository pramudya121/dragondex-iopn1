import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ExternalLink, ArrowLeftRight, Droplets, LayoutGrid, BarChart3, Wallet, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/WalletButton';
import { FloatingDock } from '@/components/ui/aceternity/FloatingDock';
import { ThemeToggle } from '@/components/ui/premium/ThemeToggle';
import dragonLogo from '@/assets/dragon-logo.png';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Swap', path: '/swap', icon: ArrowLeftRight },
  { name: 'Liquidity', path: '/liquidity', icon: Droplets },
  { name: 'Pools', path: '/pools', icon: LayoutGrid },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Portfolio', path: '/portfolio', icon: Wallet },
  { name: 'Docs', path: '/docs', icon: BookOpen },
];

const dockItems = navItems.slice(0, 6).map(item => ({
  title: item.name,
  icon: item.icon,
  href: item.path,
}));

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <img src={dragonLogo} alt="DragonDEX" className="h-10 w-10 rounded-xl" />
              </motion.div>
              <span className="text-xl font-bold gradient-text hidden sm:block">DRAGONDEX</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <ThemeToggle className="hidden sm:block" />
              <a
                href="https://testnet.iopn.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-muted/50 rounded-lg"
              >
                OPN Testnet
                <ExternalLink className="w-3 h-3" />
              </a>
              <WalletButton />
              
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-border">
                  <ThemeToggle />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Dock for Mobile */}
      <div className="lg:hidden">
        <FloatingDock items={dockItems} />
      </div>
    </>
  );
}
