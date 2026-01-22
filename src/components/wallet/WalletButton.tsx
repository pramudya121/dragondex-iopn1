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

        {/* Professional Wallet Modal - Reference Style */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowWalletModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="w-full max-w-[720px] relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="absolute -top-2 -right-2 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors z-10 border border-border/30"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                <div className="bg-[#0d0d0d] border border-border/30 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Left Panel - Wallet List */}
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border/30">
                      <h2 className="text-xl font-bold mb-6">Hubungkan Dompet</h2>
                      
                      {/* Installed Wallets */}
                      <div className="mb-6">
                        <p className="text-sm text-primary font-semibold mb-3">Terinstal</p>
                        <div className="space-y-1">
                          {installedWallets.slice(0, 5).map((connector) => {
                            const walletInfo = WALLETS[connector.name] || { name: connector.name, icon: '', color: '#888' };
                            const isConnectingThis = connectingWallet === connector.name;
                            
                            return (
                              <button
                                key={connector.uid}
                                onClick={() => handleConnect(connector)}
                                disabled={isConnectingThis}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                                  "hover:bg-muted/40",
                                  isConnectingThis && "opacity-70"
                                )}
                              >
                                <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-muted/50">
                                  {walletInfo.icon ? (
                                    <img
                                      src={walletInfo.icon}
                                      alt={walletInfo.name}
                                      className="w-7 h-7"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Wallet className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <span className="font-medium text-sm group-hover:text-primary transition-colors">
                                    {walletInfo.name}
                                  </span>
                                  {['MetaMask', 'Rabby Wallet'].includes(connector.name) && (
                                    <span className="ml-2 text-[10px] text-primary font-medium">Terkini</span>
                                  )}
                                </div>
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
                        <p className="text-sm text-muted-foreground font-semibold mb-3">Populer</p>
                        <div className="space-y-1">
                          {popularWalletNames.map((walletName) => {
                            const walletInfo = WALLETS[walletName];
                            if (!walletInfo) return null;
                            
                            return (
                              <button
                                key={walletName}
                                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-muted/40 group opacity-60"
                              >
                                <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-muted/50">
                                  {walletInfo.icon ? (
                                    <img
                                      src={walletInfo.icon}
                                      alt={walletInfo.name}
                                      className="w-7 h-7"
                                    />
                                  ) : (
                                    <Wallet className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <span className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {walletInfo.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Info */}
                    <div className="flex-1 p-6 bg-[#111111]">
                      <h3 className="text-lg font-bold mb-6">Apa itu Dompet?</h3>
                      
                      <div className="space-y-5">
                        {/* Info Item 1 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-1">Sebuah Rumah untuk Aset Digital Anda</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Dompet digunakan untuk mengirim, menerima, menyimpan, dan menampilkan aset digital seperti Ethereum dan NFTs.
                            </p>
                          </div>
                        </div>

                        {/* Info Item 2 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-1">Cara Baru untuk Masuk</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Alih-alih membuat akun dan kata sandi baru di setiap situs web, cukup hubungkan dompet Anda.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Logo */}
                      <div className="mt-6 flex justify-center">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/10 p-3 border border-primary/20">
                          <img 
                            src={dragonLogo} 
                            alt="Dragon DEX" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-6 space-y-3">
                        <Button className="w-full btn-dragon h-11">
                          Dapatkan Dompet
                        </Button>
                        <a 
                          href="https://ethereum.org/wallets" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-center text-sm text-primary hover:underline"
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
