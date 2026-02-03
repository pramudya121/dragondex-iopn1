import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className }: MeteorsProps) {
  const meteors = new Array(number).fill(true);
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {meteors.map((_, idx) => (
        <motion.span
          key={"meteor" + idx}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-gradient-to-r from-primary to-transparent shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
          style={{
            top: 0,
            left: Math.floor(Math.random() * 100) + "%",
            animationDelay: Math.random() * 2 + "s",
            animationDuration: Math.floor(Math.random() * 5 + 5) + "s",
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0, 1, 0], y: [0, 400] }}
          transition={{
            duration: Math.random() * 3 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "linear",
          }}
        >
          <span className="absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-primary/50 to-transparent" />
        </motion.span>
      ))}
    </div>
  );
}
