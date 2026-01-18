import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotatingLogoProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
}

export function RotatingLogo({ src, alt, className, size = 80 }: RotatingLogoProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-50"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)`,
        }}
      />
      
      {/* Rotating container */}
      <motion.div
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain rounded-full"
          style={{
            filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.5))",
          }}
        />
      </motion.div>
      
      {/* Reflection */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 40%, hsl(0 0% 100% / 0.1) 50%, transparent 60%)",
        }}
      />
    </div>
  );
}
