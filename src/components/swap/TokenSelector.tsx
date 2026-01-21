import { useState, useEffect, useRef } from 'react';
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
    <span className="text-sm text-muted-foreground font-medium tabular-nums">
      {formattedBalance}
    </span>
  );
}

export function TokenSelector({ selectedToken, onSelect, disabledToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [importedTokens, setImportedTokens] = useState<TokenInfo[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
    <div className="relative" ref={containerRef}>
      {label && (
        <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      )}
      
      {/* Token Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all min-w-[130px]",
          "bg-muted/80 hover:bg-muted border border-border/50 hover:border-primary/40",
          isOpen && "border-primary/50 bg-muted"
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
        <ChevronDown className={cn(
          "w-4 h-4 ml-auto text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Inline Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search or paste address"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 py-2 bg-muted/40 border-border/30 rounded-lg text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Import Section */}
              {isAddressSearch && !addressAlreadyExists && (
                <div className="p-3 border-b border-border/30">
                  <div className="bg-muted/40 rounded-lg p-3">
                    {isValidating ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-muted-foreground">Validating...</span>
                      </div>
                    ) : isValid && symbol ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{symbol}</p>
                          <p className="text-xs text-muted-foreground">{name || symbol}</p>
                        </div>
                        <Button onClick={handleImportToken} size="sm" className="btn-dragon h-7 text-xs">
                          <Plus className="w-3 h-3 mr-1" /> Import
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Invalid token</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Token List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredTokens.length === 0 && !isAddressSearch ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No tokens found</p>
                  </div>
                ) : (
                  <div className="py-1">
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
                            "w-full flex items-center gap-3 px-3 py-2.5 transition-all",
                            isDisabled
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-muted/60 cursor-pointer",
                            isSelected && "bg-primary/10"
                          )}
                        >
                          <div className="relative">
                            <img
                              src={token.logoURI}
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/tokens/opn.jpg';
                              }}
                            />
                            {isImported && (
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                <Plus className="w-2 h-2 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                          <TokenBalance token={token} address={address as `0x${string}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-border/30 bg-muted/20">
                <p className="text-[10px] text-muted-foreground text-center">
                  Paste contract address to import
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
