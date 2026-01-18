import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatEther } from 'viem';
import { MovingBorder } from '@/components/ui/aceternity/MovingBorder';
import { cn } from '@/lib/utils';

interface WalletInfo {
  name: string;
  icon: string;
  installed?: boolean;
}

const WALLETS: Record<string, WalletInfo> = {
  MetaMask: {
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  },
  'OKX Wallet': {
    name: 'OKX Wallet',
    icon: 'https://static.okx.com/cdn/wallet/logo/okx-wallet.svg',
  },
  'Rabby Wallet': {
    name: 'Rabby Wallet',
    icon: 'https://rabby.io/assets/images/logo.svg',
  },
  'Bitget Wallet': {
    name: 'Bitget Wallet',
    icon: 'https://img.bitgetimg.com/cms/assets/imgs/bitget-wallet/logo.png',
  },
  'Injected': {
    name: 'Browser Wallet',
    icon: '',
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

        {/* Professional Wallet Selection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
              onClick={() => setShowWalletModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <MovingBorder duration={4000} borderRadius="1.5rem">
                  <div className="p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Connect Wallet</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose your preferred wallet to continue
                      </p>
                    </div>

                    {/* Wallet Options */}
                    <div className="space-y-2">
                      {connectors.map((connector) => {
                        const walletInfo = WALLETS[connector.name] || { name: connector.name, icon: '' };
                        const isConnecting = connectingWallet === connector.name;
                        
                        return (
                          <motion.button
                            key={connector.uid}
                            onClick={() => handleConnect(connector)}
                            disabled={isConnecting}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
                              "bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30",
                              "group relative overflow-hidden",
                              isConnecting && "opacity-70"
                            )}
                          >
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Wallet Icon */}
                            <div className="relative w-12 h-12 rounded-xl bg-background flex items-center justify-center overflow-hidden border border-border/50">
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
                                <Wallet className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            
                            {/* Wallet Info */}
                            <div className="flex-1 text-left">
                              <span className="font-semibold group-hover:text-primary transition-colors">
                                {walletInfo.name}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {connector.name === 'MetaMask' && 'Popular'}
                                {connector.name === 'OKX Wallet' && 'Multi-chain'}
                                {connector.name === 'Rabby Wallet' && 'Security-focused'}
                                {connector.name === 'Bitget Wallet' && 'Web3 Wallet'}
                                {connector.name === 'Injected' && 'Detected'}
                              </p>
                            </div>
                            
                            {/* Status */}
                            {isConnecting ? (
                              <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 group-hover:text-primary transition-colors" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <p className="text-xs text-center text-muted-foreground">
                        By connecting, you agree to our{' '}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </p>
                    </div>

                    {/* Network Info */}
                    <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-medium text-primary">OPN Testnet</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This app runs on OPN Testnet (Chain ID: 984)
                      </p>
                    </div>
                  </div>
                </MovingBorder>
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
              className="absolute right-0 top-full mt-2 w-80 glass-card p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Connected</span>
                <div className="flex items-center gap-1 text-success text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  OPN Testnet
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{formatAddress(address!)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAddress}
                      className="p-1.5 rounded-lg hover:bg-background transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <a
                      href={`https://testnet.iopn.tech/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-background transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold">
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
