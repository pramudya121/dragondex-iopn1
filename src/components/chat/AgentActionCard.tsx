import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Sparkles, ExternalLink, Shield } from 'lucide-react';
import { AgentAction, ActionState, actionLabel } from './agentTools';
import { useAgentExecutor } from '@/hooks/useAgentExecutor';
import { getTokenBySymbol } from '@/config/contracts';
import { cn } from '@/lib/utils';

interface Props {
  action: AgentAction;
  onResult: (result: { status: 'success' | 'error' | 'rejected'; txHash?: string; error?: string }) => void;
}

function tokenLogo(sym: string) {
  return getTokenBySymbol(sym)?.logoURI || '/tokens/opn.jpg';
}

function ActionVisual({ action }: { action: AgentAction }) {
  // Multi-token visual depending on action type
  if (action.type === 'swap') {
    return (
      <div className="flex items-center gap-2">
        <img src={tokenLogo(action.fromSymbol)} alt="" className="w-8 h-8 rounded-full border-2 border-card" />
        <div className="text-xs text-muted-foreground">→</div>
        <img src={tokenLogo(action.toSymbol)} alt="" className="w-8 h-8 rounded-full border-2 border-card" />
      </div>
    );
  }
  if (action.type === 'add_liquidity' || action.type === 'remove_liquidity') {
    return (
      <div className="flex -space-x-2">
        <img src={tokenLogo(action.tokenA)} alt="" className="w-8 h-8 rounded-full border-2 border-card" />
        <img src={tokenLogo(action.tokenB)} alt="" className="w-8 h-8 rounded-full border-2 border-card" />
      </div>
    );
  }
  if (action.type === 'wrap' || action.type === 'unwrap') {
    return (
      <div className="flex items-center gap-2">
        <img src={tokenLogo(action.type === 'wrap' ? 'OPN' : 'WOPN')} className="w-8 h-8 rounded-full border-2 border-card" alt="" />
        <div className="text-xs text-muted-foreground">→</div>
        <img src={tokenLogo(action.type === 'wrap' ? 'WOPN' : 'OPN')} className="w-8 h-8 rounded-full border-2 border-card" alt="" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-card flex items-center justify-center text-xs font-bold">
      F#{('pid' in action) ? action.pid : '?'}
    </div>
  );
}

export function AgentActionCard({ action, onResult }: Props) {
  const { execute, isConnected } = useAgentExecutor();
  const [state, setState] = useState<ActionState>({ status: 'pending' });

  const handleConfirm = async () => {
    if (!isConnected) {
      setState({ status: 'error', error: 'Wallet not connected' });
      onResult({ status: 'error', error: 'Wallet not connected' });
      return;
    }
    setState({ status: 'confirming' });
    try {
      const txHash = await execute(action);
      setState({ status: 'success', txHash });
      onResult({ status: 'success', txHash });
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || 'Transaction failed';
      const rejected = /user rejected|user denied/i.test(msg);
      setState({ status: rejected ? 'rejected' : 'error', error: msg });
      onResult({ status: rejected ? 'rejected' : 'error', error: msg });
    }
  };

  const handleReject = () => {
    setState({ status: 'rejected' });
    onResult({ status: 'rejected' });
  };

  const colorByType: Record<AgentAction['type'], string> = {
    swap: 'from-primary/15 to-accent/15 border-primary/30',
    add_liquidity: 'from-success/15 to-primary/15 border-success/30',
    remove_liquidity: 'from-destructive/15 to-primary/15 border-destructive/30',
    farm_stake: 'from-accent/15 to-primary/15 border-accent/30',
    farm_unstake: 'from-accent/15 to-primary/15 border-accent/30',
    farm_harvest: 'from-success/20 to-accent/15 border-success/30',
    farm_emergency: 'from-destructive/20 to-destructive/15 border-destructive/40',
    wrap: 'from-primary/15 to-accent/15 border-primary/30',
    unwrap: 'from-primary/15 to-accent/15 border-primary/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3.5",
        colorByType[action.type],
      )}
    >
      <div className="absolute top-2 right-2 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-background/40 border border-border/30 text-muted-foreground uppercase">
        Agent · On-Chain
      </div>

      <div className="flex items-start gap-3">
        <ActionVisual action={action} />
        <div className="flex-1 min-w-0 pr-16">
          <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Suggested Action
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5 break-words">{actionLabel(action)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> Wallet confirmation required
          </p>
        </div>
      </div>

      {state.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleReject}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-background/40 hover:bg-background/60 border border-border/40 text-muted-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConnected}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {isConnected ? 'Confirm' : 'Connect Wallet'}
          </button>
        </div>
      )}

      {state.status === 'confirming' && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-background/40 border border-border/30">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          <span className="text-xs text-foreground">Awaiting wallet signature & confirmation...</span>
        </div>
      )}

      {state.status === 'success' && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-success/15 border border-success/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
          <span className="text-xs text-foreground flex-1">Transaction confirmed</span>
          {state.txHash && (
            <a
              href={`https://testnet.iopn.tech/tx/${state.txHash}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              View <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      )}

      {(state.status === 'error' || state.status === 'rejected') && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/30">
          <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
          <div className="text-[11px] text-destructive break-words">
            {state.status === 'rejected' ? 'Cancelled by user.' : (state.error?.slice(0, 140) || 'Failed')}
          </div>
        </div>
      )}
    </motion.div>
  );
}
