import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TokenIconProps {
  src?: string;
  alt?: string;
  symbol?: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
}

/**
 * TokenIcon: renders a token logo with a smooth shimmer skeleton while
 * the image is being fetched (from on-chain metadata or external CDN).
 * Falls back to a colored monogram if the image (and optional fallback) fails.
 */
export function TokenIcon({
  src,
  alt,
  symbol,
  size = 24,
  className,
  fallbackSrc,
}: TokenIconProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error'
  );
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setCurrentSrc(src);
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  const dimension = { width: size, height: size };
  const label = alt || symbol || 'token';
  const initial = (symbol || alt || '?').charAt(0).toUpperCase();

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted/40 border border-border/40',
        className
      )}
      style={dimension}
      aria-label={label}
    >
      {/* Shimmer skeleton */}
      {status === 'loading' && (
        <span
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40"
          aria-hidden="true"
        />
      )}

      {/* Fallback monogram */}
      {status === 'error' && (
        <span
          className="flex h-full w-full items-center justify-center text-foreground/70 font-semibold"
          style={{ fontSize: Math.max(10, size * 0.42) }}
          aria-hidden="true"
        >
          {initial}
        </span>
      )}

      {currentSrc && status !== 'error' && (
        <img
          src={currentSrc}
          alt={label}
          loading="lazy"
          decoding="async"
          width={size}
          height={size}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setStatus('loaded')}
          onError={() => {
            if (fallbackSrc && currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
              setStatus('loading');
            } else {
              setStatus('error');
            }
          }}
        />
      )}
    </span>
  );
}

export default TokenIcon;
