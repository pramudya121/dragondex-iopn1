import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { memo, useState, useRef, useCallback } from "react";

interface RotatingLogoProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  duration?: number;
  glowColor?: string;
  enableHover?: boolean;
  enable3D?: boolean;
}

export const RotatingLogo = memo(function RotatingLogo({ 
  src, 
  alt, 
  className, 
  size = 80,
  duration = 8,
  glowColor = 'var(--primary)',
  enableHover = true,
  enable3D = true,
}: RotatingLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, { stiffness: 200, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 25 });
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !enable3D || prefersReducedMotion) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    rotateX.set(-mouseY * 0.2);
    rotateY.set(mouseX * 0.2);
  }, [enable3D, prefersReducedMotion, rotateX, rotateY]);

  const handleMouseEnter = useCallback(() => {
    if (enableHover) {
      setIsHovered(true);
      scale.set(1.1);
    }
  }, [enableHover, scale]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={alt}
    >
      {/* Multi-layer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-300"
        style={{
          background: `radial-gradient(circle, hsl(${glowColor} / ${isHovered ? 0.8 : 0.4}) 0%, transparent 70%)`,
          transform: 'scale(1.3)',
        }}
        animate={{
          scale: isHovered ? [1.3, 1.5, 1.3] : [1.2, 1.3, 1.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />
      
      {/* Orbital rings */}
      <motion.div
        className="absolute inset-[-15%] rounded-full border pointer-events-none"
        style={{
          borderColor: `hsl(${glowColor} / 0.2)`,
        }}
        animate={prefersReducedMotion ? {} : {
          rotateZ: [0, 360],
          rotateX: [0, 15, 0, -15, 0],
        }}
        transition={{
          rotateZ: { duration: 20, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-[-8%] rounded-full border pointer-events-none"
        style={{
          borderColor: `hsl(${glowColor} / 0.15)`,
        }}
        animate={prefersReducedMotion ? {} : {
          rotateZ: [360, 0],
          rotateY: [0, 20, 0, -20, 0],
        }}
        transition={{
          rotateZ: { duration: 15, repeat: Infinity, ease: "linear" },
          rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        aria-hidden="true"
      />
      
      {/* 3D Rotating container */}
      <motion.div
        style={{
          rotateX: enable3D && !prefersReducedMotion ? rotateX : 0,
          rotateY: enable3D && !prefersReducedMotion ? rotateY : 0,
          scale,
          transformStyle: "preserve-3d",
        }}
        animate={prefersReducedMotion ? {} : {
          rotateY: [0, 360],
        }}
        transition={{
          rotateY: {
            duration,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        className="relative w-full h-full"
      >
        {/* 3D Shadow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-black/30 blur-xl"
          style={{
            transform: 'translateZ(-30px) translateY(15px) scale(0.9)',
          }}
          animate={{
            opacity: isHovered ? 0.6 : 0.3,
          }}
          aria-hidden="true"
        />

        {/* Loading placeholder */}
        {!imageLoaded && (
          <div 
            className="absolute inset-0 rounded-full bg-muted animate-pulse"
            aria-hidden="true"
          />
        )}
        
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-contain rounded-full transition-all duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: `drop-shadow(0 0 ${isHovered ? 40 : 25}px hsl(${glowColor} / ${isHovered ? 0.8 : 0.5}))`,
            transform: 'translateZ(30px)',
          }}
        />
        
        {/* Shine sweep effect */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{ transform: 'translateZ(40px)' }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)",
            }}
            animate={{
              x: ["-150%", "150%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
      
      {/* Reflection overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 30%, hsl(0 0% 100% / 0.2) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      
      {/* Pulse ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 pointer-events-none"
        style={{
          borderColor: `hsl(${glowColor} / 0.6)`,
        }}
        animate={{
          scale: isHovered ? [1, 1.3, 1.2] : 1,
          opacity: isHovered ? [0, 1, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
          ease: "easeOut",
        }}
        aria-hidden="true"
      />

      {/* Particle burst on hover */}
      {isHovered && !prefersReducedMotion && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: `hsl(${glowColor})`,
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: '-50%', y: '-50%' }}
              animate={{
                scale: [0, 1, 0],
                x: `calc(-50% + ${Math.cos((i * 60 * Math.PI) / 180) * 60}px)`,
                y: `calc(-50% + ${Math.sin((i * 60 * Math.PI) / 180) * 60}px)`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                repeatDelay: 1,
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}
    </div>
  );
});
