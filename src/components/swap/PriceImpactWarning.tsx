import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceImpactWarningProps {
  priceImpact: number;
  severity: 'low' | 'medium' | 'high';
}

export function PriceImpactWarning({ priceImpact, severity }: PriceImpactWarningProps) {
  if (severity === 'low' || priceImpact < 1) return null;

  const config = {
    medium: {
      icon: AlertCircle,
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning',
      title: 'Moderate Price Impact',
      description: 'This trade will move the price. Consider trading a smaller amount.',
    },
    high: {
      icon: AlertTriangle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      text: 'text-destructive',
      title: 'High Price Impact',
      description: 'This trade has very high price impact. You may receive significantly less than expected.',
    },
  };

  const currentConfig = severity === 'high' ? config.high : config.medium;
  const { icon: Icon, bg, border, text, title, description } = currentConfig;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'rounded-xl p-4 border',
        bg,
        border
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', text)} />
        <div className="flex-1">
          <p className={cn('font-semibold text-sm', text)}>{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          <div className={cn('mt-2 text-lg font-bold', text)}>
            ~{priceImpact.toFixed(2)}% price impact
          </div>
        </div>
      </div>
    </motion.div>
  );
}
