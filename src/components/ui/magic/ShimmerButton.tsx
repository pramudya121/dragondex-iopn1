import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ShimmerButton({ children, className, onClick, disabled }: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-primary-foreground",
        "bg-gradient-to-r from-primary via-secondary to-accent",
        "shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)]",
        "transition-all duration-300 hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {/* Shimmer effect */}
      <span
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
