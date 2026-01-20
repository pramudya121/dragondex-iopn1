import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Loader2, AlertCircle, Check, Plus } from 'lucide-react';
import { TOKEN_LIST, TokenInfo } from '@/config/contracts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAccount, useBalance } from 'wagmi';
import { useTokenBalance } from '@/hooks/useContract';
import { useValidateToken } from '@/hooks/useLiquidityPools';
import { formatEther, formatUnits } from 'viem';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TokenSelectorProps {
  selectedToken: TokenInfo | null;
  onSelect: (token: TokenInfo) => void;
  disabledToken?: TokenInfo | null;
  label?: string;
}

// Storage key for imported tokens
const IMPORTED_TOKENS_KEY = 'dragondex_imported_tokens';

function getImportedTokens(): TokenInfo[] {
  try {
    const stored = localStorage.getItem(IMPORTED_TOKENS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveImportedToken(token: TokenInfo) {
  const tokens = getImportedTokens();
  if (!tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
    tokens.push(token);
    localStorage.setItem(IMPORTED_TOKENS_KEY, JSON.stringify(tokens));
  }
}

function TokenBalance({ token, address }: { token: TokenInfo; address?: `0x${string}` }) {
  const { data: nativeBalance } = useBalance({ address });
  const { data: tokenBalance } = useTokenBalance(
    !token.isNative ? (token.address as `0x${string}`) : undefined,
    address
  );

  if (!address) return null;

  const balance = token.isNative 
    ? (nativeBalance ? formatEther(nativeBalance.value) : '0')
    : (tokenBalance ? formatUnits(tokenBalance, token.decimals) : '0');

  const formattedBalance = parseFloat(balance).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });

  return (
    <div className="text-right">
      <p className="font-medium text-foreground">{formattedBalance}</p>
      <p className="text-xs text-muted-foreground">Balance</p>
    </div>
  );
}

export function TokenSelector({ selectedToken, onSelect, disabledToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [importedTokens, setImportedTokens] = useState<TokenInfo[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { address } = useAccount();

  // Check if search is a valid address for import
  const isAddressSearch = /^0x[a-fA-F0-9]{40}$/.test(search);
  const { isValid, isLoading: isValidating, symbol, name, decimals } = useValidateToken(
    isAddressSearch ? (search as `0x${string}`) : undefined
  );

  // Load imported tokens on mount
  useEffect(() => {
    setImportedTokens(getImportedTokens());
  }, []);

  // Combine default tokens with imported tokens
  const allTokens = [...TOKEN_LIST, ...importedTokens.filter(
    imported => !TOKEN_LIST.find(t => t.address.toLowerCase() === imported.address.toLowerCase())
  )];

  const filteredTokens = allTokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.address.toLowerCase().includes(search.toLowerCase())
  );

  // Check if the searched address is already in the list
  const addressAlreadyExists = isAddressSearch && allTokens.find(
    t => t.address.toLowerCase() === search.toLowerCase()
  );

  const handleImportToken = () => {
    if (!isValid || !symbol || !search) return;

    const newToken: TokenInfo = {
      address: search,
      symbol: symbol,
      name: name || symbol,
      decimals: decimals || 18,
      logoURI: '/tokens/opn.jpg', // Default logo
    };

    saveImportedToken(newToken);
    setImportedTokens(prev => [...prev, newToken]);
    onSelect(newToken);
    setIsOpen(false);
    setSearch('');
    toast.success(`Token ${symbol} imported successfully!`);
  };

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

      {/* Modal Overlay - Centered like reference */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
            >
              <div className="bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/30">
                  <h3 className="text-lg font-bold">Select Token</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, symbol, or paste address"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-11 py-6 bg-muted/30 border-border/30 rounded-xl text-base"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Import Token Section - Show when valid address is entered */}
                {isAddressSearch && !addressAlreadyExists && (
                  <div className="px-4 pb-3">
                    <div className="bg-muted/50 rounded-xl p-4 border border-border/30">
                      {isValidating ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Validating token contract...</span>
                        </div>
                      ) : isValid && symbol ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{symbol}</p>
                              <p className="text-xs text-muted-foreground">{name || symbol}</p>
                            </div>
                          </div>
                          <Button 
                            onClick={handleImportToken} 
                            className="w-full btn-dragon"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Import {symbol}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-destructive">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">Invalid token contract</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Token List Header */}
                <div className="px-5 pb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Default Tokens
                  </p>
                </div>

                {/* Token List */}
                <div className="max-h-[360px] overflow-y-auto pb-4">
                  {filteredTokens.length === 0 && !isAddressSearch ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No tokens found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="space-y-1 px-3">
                      {filteredTokens.map((token) => {
                        const isDisabled = disabledToken?.address === token.address;
                        const isSelected = selectedToken?.address === token.address;
                        const isImported = importedTokens.find(
                          t => t.address.toLowerCase() === token.address.toLowerCase()
                        );

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
                              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all",
                              isDisabled
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-muted/60 cursor-pointer",
                              isSelected && "bg-primary/10 border border-primary/30"
                            )}
                          >
                            <div className="relative">
                              <img
                                src={token.logoURI}
                                alt={token.symbol}
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/tokens/opn.jpg';
                                }}
                              />
                              {isImported && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                  <Plus className="w-2.5 h-2.5 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-base">{token.symbol}</div>
                              <div className="text-sm text-muted-foreground">{token.name}</div>
                            </div>
                            <TokenBalance token={token} address={address as `0x${string}`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/30 bg-muted/20">
                  <p className="text-xs text-muted-foreground text-center">
                    Can't find a token? Enter the contract address above
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
