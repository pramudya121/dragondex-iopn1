import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, Loader2, X, Smartphone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatEther } from 'viem';
import { cn } from '@/lib/utils';
import dragonLogo from '@/assets/dragon-logo.png';

interface WalletInfo {
  name: string;
  icon: string;
  color: string;
}

const WALLETS: Record<string, WalletInfo> = {
  'MetaMask': {
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    color: '#F6851B',
  },
  'Rabby Wallet': {
    name: 'Rabby Wallet',
    icon: 'https://rabby.io/assets/images/logo.svg',
    color: '#7C8FEC',
  },
  'Keplr': {
    name: 'Keplr',
    icon: 'https://assets.keplr.app/icon.png',
    color: '#7B68EE',
  },
  'SubWallet': {
    name: 'SubWallet',
    icon: 'https://subwallet.app/favicon.ico',
    color: '#004BFF',
  },
  'Phantom': {
    name: 'Phantom',
    icon: 'https://phantom.app/favicon.ico',
    color: '#AB9FF2',
  },
  'Rainbow': {
    name: 'Rainbow',
    icon: 'https://rainbow.me/favicon.ico',
    color: '#001E59',
  },
  'Base Account': {
    name: 'Base Account',
    icon: 'https://www.base.org/favicon.ico',
    color: '#0052FF',
  },
  'WalletConnect': {
    name: 'WalletConnect',
    icon: 'https://walletconnect.com/favicon.ico',
    color: '#3B99FC',
  },
  'OKX Wallet': {
    name: 'OKX Wallet',
    icon: 'https://static.okx.com/cdn/wallet/logo/okx-wallet.svg',
    color: '#FFFFFF',
  },
  'Bitget Wallet': {
    name: 'Bitget Wallet',
    icon: 'https://img.bitgetimg.com/cms/assets/imgs/bitget-wallet/logo.png',
    color: '#00D4AA',
  },
  'Injected': {
    name: 'Browser Wallet',
    icon: '',
    color: '#888888',
  },
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
  const popularWalletNames = ['Rainbow', 'Base Account', 'WalletConnect'];

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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setShowWalletModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="w-full max-w-[680px] mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-background border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                    <h2 className="text-lg font-bold">Hubungkan Dompet</h2>
                    <button
                      onClick={() => setShowWalletModal(false)}
                      className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Panel - Wallet List */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-border/30">
                      {/* Installed Wallets */}
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Terinstal</p>
                        <div className="space-y-1.5">
                          {installedWallets.slice(0, 4).map((connector) => {
                            const walletInfo = WALLETS[connector.name] || { name: connector.name, icon: '', color: '#888' };
                            const isConnectingThis = connectingWallet === connector.name;
                            
                            return (
                              <button
                                key={connector.uid}
                                onClick={() => handleConnect(connector)}
                                disabled={isConnectingThis}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                                  "hover:bg-primary/10 border border-transparent hover:border-primary/20",
                                  isConnectingThis && "opacity-70 bg-primary/5"
                                )}
                              >
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-muted/60 border border-border/30">
                                  {walletInfo.icon ? (
                                    <img
                                      src={walletInfo.icon}
                                      alt={walletInfo.name}
                                      className="w-6 h-6"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Wallet className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <span className="flex-1 text-left font-medium text-sm">
                                  {walletInfo.name}
                                </span>
                                {isConnectingThis && (
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Popular Wallets */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Populer</p>
                        <div className="space-y-1.5">
                          {popularWalletNames.map((walletName) => {
                            const walletInfo = WALLETS[walletName];
                            if (!walletInfo) return null;
                            
                            return (
                              <button
                                key={walletName}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-muted/40 opacity-50 cursor-not-allowed"
                                disabled
                              >
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-muted/40 border border-border/20">
                                  {walletInfo.icon ? (
                                    <img
                                      src={walletInfo.icon}
                                      alt={walletInfo.name}
                                      className="w-6 h-6 grayscale"
                                    />
                                  ) : (
                                    <Wallet className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <span className="flex-1 text-left font-medium text-sm text-muted-foreground">
                                  {walletInfo.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Info */}
                    <div className="p-6 bg-muted/20">
                      <h3 className="text-base font-bold mb-5">Apa itu Dompet?</h3>
                      
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center border border-primary/20">
                            <Smartphone className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-0.5">Rumah untuk Aset Digital</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Dompet digunakan untuk mengirim, menerima, dan menyimpan aset digital Anda.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/20">
                            <Shield className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-0.5">Cara Baru untuk Masuk</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Cukup hubungkan dompet Anda tanpa perlu membuat akun baru.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dragon Logo */}
                      <div className="mt-6 flex justify-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 to-secondary/10 p-2 border border-primary/15">
                          <img 
                            src={dragonLogo} 
                            alt="DragonDEX" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-5 space-y-2">
                        <Button className="w-full btn-dragon h-10 text-sm">
                          Dapatkan Dompet
                        </Button>
                        <a 
                          href="https://ethereum.org/wallets" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-center text-xs text-primary hover:underline py-1"
                        >
                          Pelajari lebih lanjut
                        </a>
                      </div>
                    </div>
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
