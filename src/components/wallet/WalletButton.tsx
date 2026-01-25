import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, Loader2, X, HelpCircle, QrCode } from 'lucide-react';
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

        {/* Simple Wallet Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowWalletModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-[#121212] border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-base font-semibold text-foreground">Connect Wallet</h2>
                    </div>
                    <button
                      onClick={() => setShowWalletModal(false)}
                      className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Wallet List */}
                  <div className="p-3 space-y-1">
                    {/* WalletConnect - prioritized at top */}
                    {connectors.find(c => c.name === 'WalletConnect') && (
                      <button
                        onClick={() => handleConnect(connectors.find(c => c.name === 'WalletConnect')!)}
                        disabled={connectingWallet === 'WalletConnect'}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                          "bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-primary/30"
                        )}
                      >
                        <WalletIcon walletInfo={WALLETS['WalletConnect']} size="md" />
                        <span className="flex-1 text-left font-medium text-foreground">WalletConnect</span>
                        {connectingWallet === 'WalletConnect' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                            <QrCode className="w-3 h-3" />
                            QR CODE
                          </span>
                        )}
                      </button>
                    )}

                    {/* Installed Wallets */}
                    {installedWallets
                      .filter(c => c.name !== 'WalletConnect')
                      .map((connector) => {
                        const walletInfo = WALLETS[connector.name] || { 
                          name: connector.name, 
                          icon: '', 
                          color: '#888' 
                        };
                        const isConnectingThis = connectingWallet === connector.name;
                        
                        return (
                          <button
                            key={connector.uid}
                            onClick={() => handleConnect(connector)}
                            disabled={isConnectingThis}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                              "hover:bg-muted/40 border border-transparent hover:border-border/50"
                            )}
                          >
                            <WalletIcon walletInfo={walletInfo} size="md" />
                            <span className="flex-1 text-left font-medium text-foreground">{walletInfo.name}</span>
                            {isConnectingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded border border-green-500/30">
                                INSTALLED
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-border/30 text-center">
                    <span className="text-sm text-muted-foreground">Haven't got a wallet? </span>
                    <a 
                      href="https://ethereum.org/wallets" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Get started
                    </a>
                  </div>
                </div>
              </motion.div>
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
