import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatEther } from 'viem';
import { WalletConnectModal } from './WalletConnectModal';

export function WalletButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    address,
    isConnected,
    isConnecting,
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

        <WalletConnectModal 
          isOpen={showWalletModal} 
          onClose={() => setShowWalletModal(false)} 
        />
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
