import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode, forwardRef, memo } from "react";
import { Loader2 } from "lucide-react";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const ShimmerButton = memo(forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  function ShimmerButton(
    { 
      children, 
      className, 
      onClick, 
      disabled, 
      isLoading,
      loadingText,
      size = 'md',
      'aria-label': ariaLabel,
    }, 
    ref
  ) {
    const prefersReducedMotion = useReducedMotion();
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled && !prefersReducedMotion ? { scale: 1.02, y: -2 } : undefined}
        whileTap={!isDisabled && !prefersReducedMotion ? { scale: 0.98 } : undefined}
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        className={cn(
          "relative overflow-hidden rounded-xl font-semibold text-primary-foreground",
          "bg-gradient-to-r from-primary via-secondary to-accent",
          "shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)]",
          "transition-all duration-300",
          "hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
          sizeStyles[size],
          className
        )}
      >
        {/* Shimmer effect - respects reduced motion */}
        {!prefersReducedMotion && (
          <span
            className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            aria-hidden="true"
          />
        )}
        
        {/* Hover glow effect */}
        <span
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/10"
          aria-hidden="true"
        />
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>{loadingText || 'Loading...'}</span>
            </>
          ) : (
            children
          )}
        </span>
      </motion.button>
    );
  }
));
