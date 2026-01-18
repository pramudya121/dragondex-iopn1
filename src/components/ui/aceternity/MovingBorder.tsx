import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";

interface MovingBorderProps {
  children: ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderRadius?: string;
  borderClassName?: string;
}

export function MovingBorder({
  children,
  duration = 4000,
  className,
  containerClassName,
  borderRadius = "1rem",
  borderClassName,
}: MovingBorderProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-transparent p-[1px]",
        containerClassName
      )}
      style={{ borderRadius }}
    >
      <div
        className={cn(
          "absolute inset-0",
          borderClassName
        )}
        style={{ borderRadius }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-[-50%]"
          style={{
            background: `conic-gradient(from 0deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), transparent)`,
          }}
        />
      </div>
      <div
        className={cn(
          "relative h-full w-full bg-background",
          className
        )}
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
}
