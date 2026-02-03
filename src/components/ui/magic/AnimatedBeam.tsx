import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedBeamProps {
  className?: string;
  children?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  gradientVia?: string;
  delay?: number;
  duration?: number;
}

export function AnimatedBeam({
  className,
  children,
  gradientFrom = "hsl(var(--primary))",
  gradientTo = "hsl(var(--accent))",
  gradientVia = "hsl(var(--secondary))",
  delay = 0,
  duration = 3,
}: AnimatedBeamProps) {
  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="absolute -inset-[2px] rounded-2xl opacity-75 blur-xl"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function GradientBorder({
  className,
  children,
  animated = true,
}: {
  className?: string;
  children: React.ReactNode;
  animated?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-[2px] overflow-hidden",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))",
          backgroundSize: "300% 300%",
        }}
        animate={
          animated
            ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }
            : {}
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="relative bg-card rounded-[14px] h-full">{children}</div>
    </div>
  );
}
