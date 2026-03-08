import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, QrCode, ExternalLink, Smartphone, Shield, Loader2, ChevronRight } from 'lucide-react';
import { useConnect, Connector } from 'wagmi';
import { cn } from '@/lib/utils';

// Official wallet logo URLs
const WALLET_ICONS: Record<string, { icon: string; color: string; installUrl?: string }> = {
  'MetaMask': {
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    color: '#F6851B',
    installUrl: 'https://metamask.io/download/',
  },
  'WalletConnect': {
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/walletconnect.svg',
    color: '#3B99FC',
  },
  'Coinbase Wallet': {
    icon: 'https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo-300x300.webp',
    color: '#0052FF',
    installUrl: 'https://www.coinbase.com/wallet',
  },
  'Rabby Wallet': {
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/rabby.svg',
    color: '#7C8FEC',
    installUrl: 'https://rabby.io/',
  },
  'OKX Wallet': {
    icon: 'https://static.okx.com/cdn/assets/imgs/2312/34A08B57B05F6D8F.png',
    color: '#000000',
    installUrl: 'https://www.okx.com/web3',
  },
  'Phantom': {
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/phantom.svg',
    color: '#AB9FF2',
    installUrl: 'https://phantom.app/',
  },
  'Keplr': {
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/keplr.svg',
    color: '#7B68EE',
    installUrl: 'https://www.keplr.app/',
  },
  'Bitget Wallet': {
    icon: 'https://raw.githubusercontent.com/nicepicks/wallet-icons/main/bitget.svg',
    color: '#00D0AA',
    installUrl: 'https://web3.bitget.com/',
  },
  'Trust Wallet': {
    icon: 'https://altcoinsbox.com/wp-content/uploads/2023/04/trust-wallet-logo-300x300.webp',
    color: '#3375BB',
    installUrl: 'https://trustwallet.com/',
  },
  'Rainbow': {
    icon: 'https://avatars.githubusercontent.com/u/48327834?s=200&v=4',
    color: '#FF4B4B',
    installUrl: 'https://rainbow.me/',
  },
};

const WalletIcon = ({ name, size = 36 }: { name: string; size?: number }) => {
  const [error, setError] = useState(false);
  const walletInfo = WALLET_ICONS[name];

  if (!walletInfo || error) {
    return (
      <div className="rounded-xl bg-muted/50 flex items-center justify-center" style={{ width: size, height: size }}>
        <Wallet className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden flex items-center justify-center bg-background/50" style={{ width: size, height: size }}>
      <img
        src={walletInfo.icon}
        alt={name}
        className="object-contain"
        style={{ width: size - 4, height: size - 4 }}
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-[680px] overflow-y-auto"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/50"
              style={{
                background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)',
                boxShadow: '0 0 80px hsl(var(--primary) / 0.08), 0 25px 50px -12px rgba(0,0,0,0.5)',
              }}
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              {/* Close button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-4 top-4 p-2 rounded-full bg-muted/40 hover:bg-muted/70 transition-colors z-10 border border-border/30"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>

              <div className="grid grid-cols-1 md:grid-cols-[1fr,1.1fr] max-h-[calc(100vh-2rem)] sm:max-h-[560px]">
                {/* Left Panel - Wallet List */}
                <div className="p-6 md:border-r border-border/30 overflow-y-auto">
                  <h2 className="text-xl font-bold text-foreground mb-1">Hubungkan Dompet</h2>
                  
                  {/* Installed */}
                  {installedWallets.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-3">Terinstal</p>
                      <div className="space-y-1.5">
                        {installedWallets.map((connector, idx) => (
                          <motion.button
                            key={connector.uid}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleConnect(connector)}
                            disabled={isPending}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                              "hover:bg-primary/5 border border-transparent hover:border-primary/20",
                              connectingWallet === connector.name && "border-primary/40 bg-primary/10"
                            )}
                          >
                            <WalletIcon name={connector.name} size={38} />
                            <div className="flex-1 text-left">
                              <span className="font-semibold text-sm text-foreground">{connector.name}</span>
                              <p className="text-[10px] font-medium text-primary">Terkini</p>
                            </div>
                            {connectingWallet === connector.name ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular */}
                  <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Populer</p>
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border/40">
                      {popularWallets.map((connector, idx) => (
                        <motion.button
                          key={connector.uid}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.04 }}
                          onClick={() => handleConnect(connector)}
                          disabled={isPending}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                            "hover:bg-muted/40 border border-transparent hover:border-border/50",
                            connectingWallet === connector.name && "border-primary/40 bg-primary/10"
                          )}
                        >
                          <WalletIcon name={connector.name} size={38} />
                          <span className="font-medium text-sm flex-1 text-left text-foreground">{connector.name}</span>
                          {connector.name === 'WalletConnect' && (
                            <QrCode className="w-4 h-4 text-muted-foreground/50" />
                          )}
                          {connectingWallet === connector.name && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Info */}
                <div className="p-6 hidden md:flex flex-col justify-between bg-muted/10">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">Apa itu Dompet?</h3>

                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-primary/20"
                          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.1))' }}
                        >
                          <Smartphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground mb-0.5">Sebuah Rumah untuk Aset Digital Anda</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Dompet digunakan untuk mengirim, menerima, menyimpan, dan menampilkan aset digital seperti Ethereum dan NFTs.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-primary/20"
                          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.1))' }}
                        >
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground mb-0.5">Cara Baru untuk Masuk</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Alih-alih membuat akun dan kata sandi baru di setiap situs web, cukup hubungkan dompet Anda.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dragon logo */}
                  <div className="mt-6">
                    <div className="flex justify-center mb-5">
                      <motion.div
                        className="w-28 h-28 rounded-2xl overflow-hidden border border-primary/20 relative"
                        style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--background)))' }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <img
                          src="/tokens/dragon.png"
                          alt="Dragon"
                          className="w-full h-full object-contain p-2"
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>

                    <a
                      href="https://ethereum.org/en/wallets/find-wallet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all text-primary-foreground"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                        boxShadow: '0 4px 20px hsl(var(--primary) / 0.3)',
                      }}
                    >
                      Dapatkan Dompet
                    </a>
                    <a
                      href="https://ethereum.org/en/wallets/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-primary hover:underline mt-2"
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
