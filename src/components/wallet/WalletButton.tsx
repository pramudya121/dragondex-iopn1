import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, Loader2, X, Smartphone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatEther } from 'viem';
import { cn } from '@/lib/utils';

interface WalletInfo {
  name: string;
  icon: string;
  fallbackIcon?: string;
  color: string;
}

// Reliable wallet icons with fallbacks
const WALLETS: Record<string, WalletInfo> = {
  'MetaMask': {
    name: 'MetaMask',
    icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/SVG_MetaMask_Icon_Color.svg',
    fallbackIcon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    color: '#F6851B',
  },
  'Rabby Wallet': {
    name: 'Rabby Wallet',
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/rabby.svg',
    color: '#7C8FEC',
  },
  'Keplr': {
    name: 'Keplr',
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/keplr.png',
    color: '#7B68EE',
  },
  'SubWallet': {
    name: 'SubWallet',
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/subwallet.svg',
    color: '#004BFF',
  },
  'Phantom': {
    name: 'Phantom',
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/phantom.svg',
    color: '#AB9FF2',
  },
  'Rainbow': {
    name: 'Rainbow',
    icon: 'https://avatars.githubusercontent.com/u/48327834?s=200&v=4',
    color: '#001E59',
  },
  'Base Account': {
    name: 'Base Account',
    icon: 'https://avatars.githubusercontent.com/u/108554348?s=200&v=4',
    color: '#0052FF',
  },
  'WalletConnect': {
    name: 'WalletConnect',
    icon: 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4',
    color: '#3B99FC',
  },
  'OKX Wallet': {
    name: 'OKX Wallet',
    icon: 'https://avatars.githubusercontent.com/u/85024987?s=200&v=4',
    color: '#000000',
  },
  'Bitget Wallet': {
    name: 'Bitget Wallet',
    icon: 'https://avatars.githubusercontent.com/u/76869728?s=200&v=4',
    color: '#00D4AA',
  },
  'Coinbase Wallet': {
    name: 'Coinbase Wallet',
    icon: 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4',
    color: '#0052FF',
  },
  'Trust Wallet': {
    name: 'Trust Wallet',
    icon: 'https://avatars.githubusercontent.com/u/32179889?s=200&v=4',
    color: '#3375BB',
  },
  'Injected': {
    name: 'Browser Wallet',
    icon: '',
    color: '#888888',
  },
};

// Fallback icon component with proper error handling
const WalletIcon = ({ walletInfo, size = 'md' }: { walletInfo: WalletInfo; size?: 'sm' | 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const sizeClasses = size === 'md' ? 'w-8 h-8' : 'w-6 h-6';
  const containerClasses = size === 'md' ? 'w-11 h-11' : 'w-9 h-9';

  const currentIcon = useFallback && walletInfo.fallbackIcon ? walletInfo.fallbackIcon : walletInfo.icon;

  if (!walletInfo.icon || imgError) {
    return (
      <div 
        className={cn(containerClasses, "rounded-xl flex items-center justify-center")}
        style={{ backgroundColor: walletInfo.color + '20' }}
      >
        <Wallet className={cn(sizeClasses, "text-muted-foreground")} style={{ color: walletInfo.color }} />
      </div>
    );
  }

  return (
    <div className={cn(containerClasses, "rounded-xl overflow-hidden flex items-center justify-center bg-muted/30")}>
      <img
        src={currentIcon}
        alt={walletInfo.name}
        className={cn(sizeClasses, "object-contain")}
        onError={() => {
          if (!useFallback && walletInfo.fallbackIcon) {
            setUseFallback(true);
          } else {
            setImgError(true);
          }
        }}
      />
    </div>
  );
};

export function WalletButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const {
    address,
    isConnected,
    isConnecting,
    connectors,
    connect,
    disconnect,
    balance,
    isCorrectNetwork,
    switchToOPN,
    formatAddress,
  } = useWallet();

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async (connector: any) => {
    setConnectingWallet(connector.name);
    try {
      await connect({ connector });
      setShowWalletModal(false);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnectingWallet(null);
    }
  };

  // Separate installed vs popular wallets
  const installedWallets = connectors.filter(c => c.name !== 'Injected');
  const popularWalletNames = ['Rainbow', 'Coinbase Wallet', 'Trust Wallet', 'WalletConnect'];

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowWalletModal(true)}
          className="btn-dragon"
          disabled={isConnecting}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        {/* Professional Wallet Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md overflow-y-auto"
              onClick={() => setShowWalletModal(false)}
            >
              <div className="min-h-full flex items-center justify-center p-4 py-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-[720px]"
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                    <h2 className="text-lg font-bold text-foreground">Hubungkan Dompet</h2>
                    <button
                      onClick={() => setShowWalletModal(false)}
                      className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>


                  {/* Content Grid */}
                  <div className="grid md:grid-cols-2">
                    {/* Left Panel - Wallet List */}
                    <div className="p-6 space-y-6">
                      {/* Installed Wallets */}
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                          Terinstal
                        </p>
                        <div className="space-y-1.5">
                          {installedWallets.map((connector) => {
                            const walletInfo = WALLETS[connector.name] || { 
                              name: connector.name, 
                              icon: '', 
                              color: '#888' 
                            };
                            const isConnectingThis = connectingWallet === connector.name;
                            const isRecent = ['MetaMask', 'Rabby Wallet'].includes(connector.name);
                            
                            return (
                              <button
                                key={connector.uid}
                                onClick={() => handleConnect(connector)}
                                disabled={isConnectingThis}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                  "hover:bg-primary/10 hover:border-primary/30",
                                  "border border-transparent",
                                  isConnectingThis && "opacity-70 bg-primary/5 border-primary/20"
                                )}
                              >
                                <WalletIcon walletInfo={walletInfo} size="md" />
                                <div className="flex-1 text-left">
                                  <span className="font-medium text-foreground">{walletInfo.name}</span>
                                  {isRecent && (
                                    <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded-full">
                                      Terkini
                                    </span>
                                  )}
                                </div>
                                {isConnectingThis && (
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Popular Wallets */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Populer
                        </p>
                        <div className="space-y-1.5">
                          {popularWalletNames.map((walletName) => {
                            const walletInfo = WALLETS[walletName];
                            if (!walletInfo) return null;
                            
                            return (
                              <button
                                key={walletName}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-muted/40 border border-transparent hover:border-border/50"
                              >
                                <WalletIcon walletInfo={walletInfo} size="md" />
                                <span className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                                  {walletInfo.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Info */}
                    <div className="p-6 bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-border/30 flex flex-col">
                      <h3 className="text-lg font-bold mb-6 text-foreground">Apa itu Dompet?</h3>
                      
                      <div className="space-y-5 flex-1">
                        {/* Info Item 1 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground mb-1">Rumah untuk Aset Digital</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Dompet digunakan untuk mengirim, menerima, dan menyimpan aset digital seperti Ethereum dan NFTs.
                            </p>
                          </div>
                        </div>

                        {/* Info Item 2 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground mb-1">Cara Baru untuk Masuk</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Cukup hubungkan dompet Anda tanpa perlu membuat akun baru di setiap situs.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 pt-4 border-t border-border/30">
                        <Button className="w-full btn-dragon h-11 text-sm font-semibold">
                          Dapatkan Dompet
                        </Button>
                        <a 
                          href="https://ethereum.org/wallets" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-center text-sm text-primary hover:underline mt-3"
                        >
                          Pelajari lebih lanjut →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Button onClick={switchToOPN} variant="destructive" className="animate-pulse">
        Switch to OPN
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all"
      >
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="font-medium">{formatAddress(address!)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d0d] border border-border/50 rounded-xl shadow-2xl p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Connected</span>
                <div className="flex items-center gap-1.5 text-success text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  OPN Testnet
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{formatAddress(address!)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopyAddress}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                    <a
                      href={`https://testnet.iopn.tech/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </a>
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold">
                  {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0'} OPN
                </div>
              </div>

              <Button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
