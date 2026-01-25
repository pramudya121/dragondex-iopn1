import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rounded';
  animate?: boolean;
}

export function Skeleton({ className, variant = 'default', animate = true }: SkeletonProps) {
  const baseClasses = 'bg-muted/50';
  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  };

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animate && 'animate-pulse',
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

// Skeleton untuk Pool Card
export function PoolCardSkeleton() {
  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-5 border border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Skeleton className="w-10 h-10" variant="circular" />
            <Skeleton className="w-10 h-10" variant="circular" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-14" variant="rounded" />
      </div>
      <Skeleton className="h-16 w-full" variant="rounded" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12 w-full" variant="rounded" />
        <Skeleton className="h-12 w-full" variant="rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" variant="rounded" />
        <Skeleton className="h-9 flex-1" variant="rounded" />
      </div>
    </div>
  );
}

// Skeleton untuk Stat Card
export function StatCardSkeleton() {
  return (
    <div className="stat-card flex items-center gap-3">
      <Skeleton className="w-12 h-12" variant="rounded" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

// Skeleton untuk Asset Card
export function AssetCardSkeleton() {
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <Skeleton className="w-12 h-12" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

// Skeleton untuk Table Row
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton className="h-4 w-full max-w-20" />
        </td>
      ))}
    </tr>
  );
}

// Skeleton untuk Swap Card
export function SwapCardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-card border border-border space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-8" variant="circular" />
      </div>
      <div className="token-input space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" variant="rounded" />
        </div>
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-12 w-12" variant="circular" />
      </div>
      <div className="token-input space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" variant="rounded" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" variant="rounded" />
    </div>
  );
}

// Skeleton untuk Chart
export function ChartSkeleton() {
  return (
    <div className="glass-card p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="h-48 flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="flex-1 bg-muted/50 rounded-t-lg animate-pulse"
            style={{ height: `${30 + (i * 5)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}
