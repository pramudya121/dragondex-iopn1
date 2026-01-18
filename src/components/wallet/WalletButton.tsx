import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatEther } from 'viem';

const walletLogos: Record<string, string> = {
  MetaMask: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  'OKX Wallet': 'https://static.okx.com/cdn/wallet/logo/okx-black.svg',
  'Rabby Wallet': 'https://rabby.io/assets/images/logo.svg',
  'Bitget Wallet': 'https://img.bitgetimg.com/cms/assets/imgs/bitget-wallet/logo.png',
};

export function WalletButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

        {/* Wallet Selection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowWalletModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-6 text-center">Connect Wallet</h2>
                <div className="grid gap-3">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => {
                        connect({ connector });
                        setShowWalletModal(false);
                      }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-border/50 hover:border-primary/30 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center overflow-hidden">
                        {walletLogos[connector.name] ? (
                          <img
                            src={walletLogos[connector.name]}
                            alt={connector.name}
                            className="w-6 h-6"
                          />
                        ) : (
                          <Wallet className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {connector.name}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-6">
                  By connecting, you agree to the Terms of Service
                </p>
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-72 glass-card p-4 z-50"
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
                <div className="mt-2 text-lg font-bold">
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
