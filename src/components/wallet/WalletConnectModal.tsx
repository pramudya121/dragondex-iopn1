import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, QrCode, ExternalLink, Smartphone, Shield, Loader2 } from 'lucide-react';
import { useConnect, Connector } from 'wagmi';
import { cn } from '@/lib/utils';

// Wallet icons data
const WALLET_ICONS: Record<string, { icon: string; color: string }> = {
  'MetaMask': {
    icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/SVG_MetaMask_Icon_Color.svg',
    color: '#F6851B',
  },
  'WalletConnect': {
    icon: 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4',
    color: '#3B99FC',
  },
  'Coinbase Wallet': {
    icon: 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4',
    color: '#0052FF',
  },
  'Rabby Wallet': {
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/rabby.svg',
    color: '#7C8FEC',
  },
  'OKX Wallet': {
    icon: 'https://avatars.githubusercontent.com/u/85024987?s=200&v=4',
    color: '#000000',
  },
  'Trust Wallet': {
    icon: 'https://avatars.githubusercontent.com/u/32179889?s=200&v=4',
    color: '#3375BB',
  },
  'Phantom': {
    icon: 'https://avatars.githubusercontent.com/u/78782331?s=200&v=4',
    color: '#AB9FF2',
  },
  'Keplr': {
    icon: 'https://avatars.githubusercontent.com/u/52448884?s=200&v=4',
    color: '#7B68EE',
  },
  'SubWallet': {
    icon: 'https://avatars.githubusercontent.com/u/80820667?s=200&v=4',
    color: '#004BFF',
  },
  'Rainbow': {
    icon: 'https://avatars.githubusercontent.com/u/48327834?s=200&v=4',
    color: '#FF4B4B',
  },
};

const WalletIcon = ({ name }: { name: string }) => {
  const [error, setError] = useState(false);
  const walletInfo = WALLET_ICONS[name];

  if (!walletInfo || error) {
    return (
      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
        <Wallet className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
      <img
        src={walletInfo.icon}
        alt={name}
        className="w-8 h-8 object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
};

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connectors, connect, isPending } = useConnect();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Filter and categorize wallets
  const displayWallets = connectors.filter(c => c.name !== 'Injected');
  
  const installedWallets = displayWallets.filter(c => 
    c.name === 'MetaMask' || c.name === 'Rabby Wallet'
  );
  
  const popularWallets = displayWallets.filter(c => 
    c.name !== 'MetaMask' && c.name !== 'Rabby Wallet'
  );

  const handleConnect = async (connector: Connector) => {
    setConnectingWallet(connector.name);
    try {
      await connect({ connector });
      onClose();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-3xl overflow-y-auto"
          >
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
              {/* Header with close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 max-h-[calc(100vh-2rem)] sm:max-h-none overflow-y-auto">
                {/* Left Panel - Wallet List */}
                <div className="p-6 border-r border-border">
                  <h2 className="text-xl font-bold mb-6">Hubungkan Dompet</h2>

                  {/* Installed Wallets */}
                  {installedWallets.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-primary mb-3">Terinstal</p>
                      <div className="space-y-2">
                        {installedWallets.map((connector) => (
                          <button
                            key={connector.uid}
                            onClick={() => handleConnect(connector)}
                            disabled={isPending}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                              "bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-primary/30",
                              connectingWallet === connector.name && "border-primary/50 bg-muted/60"
                            )}
                          >
                            <WalletIcon name={connector.name} />
                            <div className="flex-1 text-left">
                              <span className="font-medium">{connector.name}</span>
                              <p className="text-xs text-primary">Terkini</p>
                            </div>
                            {connectingWallet === connector.name && (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Wallets */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Populer</p>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                      {popularWallets.map((connector) => (
                        <button
                          key={connector.uid}
                          onClick={() => handleConnect(connector)}
                          disabled={isPending}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                            "bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-primary/30",
                            connectingWallet === connector.name && "border-primary/50 bg-muted/60"
                          )}
                        >
                          <WalletIcon name={connector.name} />
                          <span className="font-medium flex-1 text-left">{connector.name}</span>
                          {connector.name === 'WalletConnect' && (
                            <QrCode className="w-4 h-4 text-muted-foreground" />
                          )}
                          {connectingWallet === connector.name && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Info */}
                <div className="p-6 bg-muted/20 hidden md:block">
                  <h3 className="text-xl font-bold mb-6">Apa itu Dompet?</h3>

                  <div className="space-y-6">
                    {/* Info Card 1 */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Sebuah Rumah untuk Aset Digital Anda</h4>
                        <p className="text-sm text-muted-foreground">
                          Dompet digunakan untuk mengirim, menerima, menyimpan, dan menampilkan aset digital seperti Ethereum dan NFTs.
                        </p>
                      </div>
                    </div>

                    {/* Info Card 2 */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Cara Baru untuk Masuk</h4>
                        <p className="text-sm text-muted-foreground">
                          Alih-alih membuat akun dan kata sandi baru di setiap situs web, cukup hubungkan dompet Anda.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logo/Branding */}
                  <div className="mt-8 flex justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border/50 flex items-center justify-center">
                      <img
                        src="/tokens/dragon.png"
                        alt="Dragon"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-3">
                    <a
                      href="https://ethereum.org/en/wallets/find-wallet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      Dapatkan Dompet
                    </a>
                    <a
                      href="https://ethereum.org/en/wallets/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:underline"
                    >
                      Pelajari lebih lanjut
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
