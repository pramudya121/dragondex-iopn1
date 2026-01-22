import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Loader2, AlertCircle, Check, Plus, Download } from 'lucide-react';
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

// Separate component to display token balance from wallet
const TokenBalanceDisplay = ({ token, address }: { token: TokenInfo; address?: `0x${string}` }) => {
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
    <span className="text-sm text-muted-foreground font-medium tabular-nums">
      {formattedBalance}
    </span>
  );
};

export function TokenSelector({ selectedToken, onSelect, disabledToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [importedTokens, setImportedTokens] = useState<TokenInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'imported'>('all');
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

  // Filter based on active tab
  const displayTokens = activeTab === 'imported' ? importedTokens : allTokens;

  const filteredTokens = displayTokens.filter(
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
      logoURI: '/tokens/opn.jpg',
    };

    saveImportedToken(newToken);
    setImportedTokens(prev => [...prev, newToken]);
    onSelect(newToken);
    setIsOpen(false);
    setSearch('');
    toast.success(`Token ${symbol} imported successfully!`);
  };

  return (
    <>
      {label && (
        <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      )}
      
      {/* Token Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all min-w-[130px]",
          "bg-muted/80 hover:bg-muted border border-border/50 hover:border-primary/40"
        )}
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
          <span className="text-muted-foreground">Select</span>
        )}
        <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
      </button>

      {/* Token Modal - Same Position as Swap Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="w-full max-w-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1a1a1a] border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                  <h2 className="text-lg font-bold">Select Token</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs border-border/50 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Import
                    </Button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="px-4 pt-4 pb-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, symbol, or address"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 py-2.5 h-11 bg-[#0d0d0d] border-border/30 rounded-xl text-sm placeholder:text-muted-foreground/60"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-4 pb-2">
                  <div className="flex gap-1 p-1 bg-[#0d0d0d] rounded-xl">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'all'
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>⭐</span>
                      All ({allTokens.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('imported')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'imported'
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Imported ({importedTokens.length})
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                {isAddressSearch && !addressAlreadyExists && (
                  <div className="px-4 pb-3">
                    <div className="bg-[#0d0d0d] rounded-xl p-3 border border-border/30">
                      {isValidating ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-muted-foreground">Validating token...</span>
                        </div>
                      ) : isValid && symbol ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{symbol}</p>
                            <p className="text-xs text-muted-foreground">{name || symbol}</p>
                          </div>
                          <Button onClick={handleImportToken} size="sm" className="btn-dragon h-8">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Import
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Invalid token address</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Token List */}
                <div className="max-h-[320px] overflow-y-auto px-2">
                  {filteredTokens.length === 0 && !isAddressSearch ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No tokens found</p>
                      <p className="text-xs mt-1 opacity-70">Try searching by name or paste contract address</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 pb-2">
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
                              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                              isDisabled
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-muted/50 cursor-pointer",
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
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                                  <Download className="w-2 h-2 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{token.symbol}</div>
                              <div className="text-xs text-muted-foreground">{token.name}</div>
                            </div>
                            <TokenBalanceDisplay token={token} address={address as `0x${string}`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
