import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Star, Download, Loader2 } from 'lucide-react';
import { TOKEN_LIST, TokenInfo } from '@/config/contracts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAccount, useBalance } from 'wagmi';
import { useTokenBalance } from '@/hooks/useContract';
import { formatEther, formatUnits } from 'viem';
import { cn } from '@/lib/utils';

interface TokenSelectorProps {
  selectedToken: TokenInfo | null;
  onSelect: (token: TokenInfo) => void;
  disabledToken?: TokenInfo | null;
  label?: string;
}

function TokenBalance({ token, address }: { token: TokenInfo; address?: `0x${string}` }) {
  const { data: nativeBalance } = useBalance({ address });
  const { data: tokenBalance } = useTokenBalance(
    !token.isNative ? (token.address as `0x${string}`) : undefined,
    address
  );

  if (!address) return <span className="text-muted-foreground text-sm">-</span>;

  const balance = token.isNative 
    ? (nativeBalance ? formatEther(nativeBalance.value) : '0')
    : (tokenBalance ? formatUnits(tokenBalance, token.decimals) : '0');

  const formattedBalance = parseFloat(balance).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });

  return <span className="text-foreground font-medium">{formattedBalance}</span>;
}

export function TokenSelector({ selectedToken, onSelect, disabledToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'imported'>('all');
  const { address } = useAccount();

  const filteredTokens = TOKEN_LIST.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.address.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {label && (
        <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      )}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/70 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all min-w-[140px]"
      >
        {selectedToken ? (
          <>
            <img
              src={selectedToken.logoURI}
              alt={selectedToken.symbol}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/tokens/opn.jpg';
              }}
            />
            <span className="font-semibold">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select token</span>
        )}
        <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
      </button>

      {/* Modal Overlay - positioned relative to parent container */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', duration: 0.25 }}
              className="absolute right-0 top-full mt-2 w-[360px] z-50"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="text-lg font-bold">Select Token</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <Download className="w-3.5 h-3.5" />
                      Import
                    </Button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, symbol, or address"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-4 py-3 border-b border-border">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeTab === 'all'
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Star className="w-4 h-4" />
                    All ({TOKEN_LIST.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('imported')}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeTab === 'imported'
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Download className="w-4 h-4" />
                    Imported (0)
                  </button>
                </div>

                {/* Token List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredTokens.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No tokens found</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredTokens.map((token) => {
                        const isDisabled = disabledToken?.address === token.address;
                        const isSelected = selectedToken?.address === token.address;

                        return (
                          <button
                            key={token.address}
                            onClick={() => {
                              if (!isDisabled) {
                                onSelect(token);
                                setIsOpen(false);
                                setSearch('');
                              }
                            }}
                            disabled={isDisabled}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 transition-all",
                              isDisabled
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-muted/70 cursor-pointer",
                              isSelected && "bg-primary/10"
                            )}
                          >
                            <img
                              src={token.logoURI}
                              alt={token.symbol}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/tokens/opn.jpg';
                              }}
                            />
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{token.symbol}</div>
                              <div className="text-xs text-muted-foreground">{token.name}</div>
                            </div>
                            <div className="text-right">
                              <TokenBalance token={token} address={address as `0x${string}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center">
                    {TOKEN_LIST.length} tokens available • OPN Testnet
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
