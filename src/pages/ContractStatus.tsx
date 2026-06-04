import { SEO } from '@/components/seo/SEO';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, ExternalLink, Copy, FileCode } from 'lucide-react';
import { CONTRACTS, TOKEN_LIST, OPN_TESTNET } from '@/config/contracts';
import { FARMING_CONTRACT } from '@/config/farming';
import { toast } from 'sonner';

interface Row {
  name: string;
  address: string;
  status: 'done' | 'pending';
  notes?: string;
  hooks?: string[];
}

const EXPLORER = OPN_TESTNET.blockExplorers.default.url;

const CORE: Row[] = [
  { name: 'UniswapV2Factory', address: CONTRACTS.FACTORY, status: 'done', hooks: ['useLiquidityPools', 'CreatePool', 'Docs'] },
  { name: 'UniswapV2Router02', address: CONTRACTS.ROUTER, status: 'done', hooks: ['useSwapRouter', 'Liquidity', 'Swap'] },
  { name: 'WOPN (WETH9)', address: CONTRACTS.WETH, status: 'done', hooks: ['Wrap/Unwrap', 'Native↔WOPN swap'] },
  { name: 'UniswapV2Library', address: CONTRACTS.LIBRARY, status: 'done', notes: 'Helper, ABI empty (no public functions)' },
  { name: 'Multicall', address: CONTRACTS.MULTICALL, status: 'done', hooks: ['Batched reads'] },
  { name: 'MultiPoolFarm', address: FARMING_CONTRACT, status: 'done', hooks: ['/farming', '/admin/farming'] },
];

const TOKENS_ROWS: Row[] = TOKEN_LIST.filter((t) => !t.isNative).map((t) => ({
  name: `${t.symbol} — ${t.name}`,
  address: t.address,
  status: 'done',
}));

const FEATURES: { label: string; status: 'done' | 'pending'; note?: string }[] = [
  { label: 'Swap (single & multi-hop)', status: 'done' },
  { label: 'Wrap / Unwrap OPN ↔ WOPN', status: 'done' },
  { label: 'Add / Remove Liquidity', status: 'done' },
  { label: 'Create Pool', status: 'done' },
  { label: 'Pools listing (Factory.allPairs)', status: 'done' },
  { label: 'Analytics (TVL, volume, top pairs)', status: 'done' },
  { label: 'Auto-index PairCreated events', status: 'done', note: 'useWatchContractEvent refetches Factory length live' },
  { label: 'Farming deposit / withdraw / harvest', status: 'done' },
  { label: 'Farming admin (addPool / setRPB / massUpdate)', status: 'done' },
  { label: 'DragonBot AI on-chain actions', status: 'done' },
  { label: 'Transaction history & explorer links', status: 'done' },
  { label: 'Subgraph / off-chain indexer', status: 'pending', note: 'Currently using direct RPC + event watcher' },
  { label: 'Historical price charts dari on-chain swaps', status: 'pending', note: 'Saat ini pakai snapshot harga' },
];

function shorten(a: string) {
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}

function RowItem({ row }: { row: Row }) {
  const copy = () => {
    navigator.clipboard.writeText(row.address);
    toast.success('Address disalin');
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-card/40 border border-border/40 hover:border-primary/40 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{row.name}</span>
          {row.status === 'done' ? (
            <Badge className="bg-success/20 text-success border-success/40 gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-warning border-warning/40">
              <Clock className="w-3 h-3" /> Pending
            </Badge>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono mt-1 break-all">{row.address}</div>
        {row.notes && <p className="text-[11px] text-muted-foreground mt-1">{row.notes}</p>}
        {row.hooks && (
          <div className="flex flex-wrap gap-1 mt-2">
            {row.hooks.map((h) => (
              <span key={h} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" onClick={copy}>
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <a href={`${EXPLORER}/address/${row.address}`} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline">
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> {shorten(row.address)}
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function ContractStatus() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <SEO
        title="Contract Status — DRAGONDEX"
        description="Status implementasi smart contract DragonDEX di OPN Testnet"
        path="/status"
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40">
            <FileCode className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-extrabold gradient-text">Contract Status</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ringkasan smart contract & fitur DragonDEX yang aktif di{' '}
          <span className="text-primary font-semibold">OPN Testnet (Chain ID {OPN_TESTNET.id})</span>.
        </p>
      </div>

      <Card className="p-5 mb-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-primary/20">
        <h2 className="text-lg font-bold mb-4">Core Contracts</h2>
        <div className="space-y-2">
          {CORE.map((r) => <RowItem key={r.address} row={r} />)}
        </div>
      </Card>

      <Card className="p-5 mb-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-primary/20">
        <h2 className="text-lg font-bold mb-4">Tokens Terdaftar</h2>
        <div className="space-y-2">
          {TOKENS_ROWS.map((r) => <RowItem key={r.address} row={r} />)}
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-primary/20">
        <h2 className="text-lg font-bold mb-4">Status Fitur</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40"
            >
              {f.status === 'done' ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium">{f.label}</div>
                {f.note && <div className="text-[11px] text-muted-foreground mt-0.5">{f.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
