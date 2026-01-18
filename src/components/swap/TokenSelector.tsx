import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { TOKEN_LIST, TokenInfo } from '@/config/contracts';
import { Input } from '@/components/ui/input';

interface TokenSelectorProps {
  selectedToken: TokenInfo | null;
  onSelect: (token: TokenInfo) => void;
  disabledToken?: TokenInfo | null;
  label?: string;
}

export function TokenSelector({ selectedToken, onSelect, disabledToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTokens = TOKEN_LIST.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {label && (
        <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/70 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all min-w-[140px]"
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
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 w-72 glass-card p-3 z-50"
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/50 border-border/50"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredTokens.map((token) => {
                const isDisabled = disabledToken?.address === token.address;
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-muted/70 cursor-pointer'
                    } ${selectedToken?.address === token.address ? 'bg-primary/10 border border-primary/30' : ''}`}
                  >
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/tokens/opn.jpg';
                      }}
                    />
                    <div className="text-left">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
