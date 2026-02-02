import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode, memo, useMemo } from "react";

interface MovingBorderProps {
  children: ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderRadius?: string;
  borderClassName?: string;
  gradientColors?: string[];
}

export const MovingBorder = memo(function MovingBorder({
  children,
  duration = 4000,
  className,
  containerClassName,
  borderRadius = "1rem",
  borderClassName,
  gradientColors,
}: MovingBorderProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const gradientStyle = useMemo(() => {
    if (gradientColors && gradientColors.length > 0) {
      return `conic-gradient(from 0deg, transparent, ${gradientColors.join(', ')}, transparent)`;
    }
    return `conic-gradient(from 0deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), transparent)`;
  }, [gradientColors]);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-transparent p-[2px]",
        containerClassName
      )}
      style={{ borderRadius }}
      role="presentation"
    >
      {/* Animated border */}
      <div
        className={cn("absolute inset-0", borderClassName)}
        style={{ borderRadius }}
        aria-hidden="true"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: prefersReducedMotion ? 0 : 360 }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-[-50%]"
          style={{ background: gradientStyle }}
        />
      </div>
      
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-50 blur-xl"
        style={{
          background: gradientStyle,
          borderRadius,
        }}
        aria-hidden="true"
      />
      
      {/* Content container */}
      <div
        className={cn(
          "relative h-full w-full bg-card backdrop-blur-sm",
          className
        )}
        style={{ borderRadius: `calc(${borderRadius} - 2px)` }}
      >
        {children}
      </div>
    </div>
  );
});
