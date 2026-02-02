import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { memo, useState } from "react";

interface RotatingLogoProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  duration?: number;
  glowColor?: string;
  enableHover?: boolean;
}

export const RotatingLogo = memo(function RotatingLogo({ 
  src, 
  alt, 
  className, 
  size = 80,
  duration = 8,
  glowColor = 'var(--primary)',
  enableHover = true,
}: RotatingLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={cn("relative", className)}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
      onMouseEnter={() => enableHover && setIsHovered(true)}
      onMouseLeave={() => enableHover && setIsHovered(false)}
      role="img"
      aria-label={alt}
    >
      {/* Multi-layer glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, hsl(${glowColor} / ${isHovered ? 0.7 : 0.4}) 0%, transparent 70%)`,
          transform: 'scale(1.2)',
        }}
        aria-hidden="true"
      />
      
      {/* Secondary glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(circle, hsl(${glowColor} / 0.3) 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      
      {/* 3D Rotating container */}
      <motion.div
        animate={prefersReducedMotion ? {} : {
          rotateY: [0, 360],
          rotateZ: isHovered ? [0, 10, -10, 0] : 0,
        }}
        transition={{
          rotateY: {
            duration,
            repeat: Infinity,
            ease: "linear",
          },
          rotateZ: {
            duration: 0.5,
            ease: "easeOut",
          },
        }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div 
            className="absolute inset-0 rounded-full bg-muted animate-pulse"
            aria-hidden="true"
          />
        )}
        
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-contain rounded-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: `drop-shadow(0 0 ${isHovered ? 30 : 20}px hsl(${glowColor} / ${isHovered ? 0.7 : 0.5}))`,
          }}
        />
      </motion.div>
      
      {/* Reflection overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 30%, hsl(0 0% 100% / 0.15) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      
      {/* Ring effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 pointer-events-none"
        style={{
          borderColor: `hsl(${glowColor} / 0.5)`,
        }}
        animate={{
          scale: isHovered ? [1, 1.2, 1.1] : 1,
          opacity: isHovered ? [0, 0.8, 0] : 0,
        }}
        transition={{
          duration: 1,
          repeat: isHovered ? Infinity : 0,
        }}
        aria-hidden="true"
      />
    </div>
  );
});
