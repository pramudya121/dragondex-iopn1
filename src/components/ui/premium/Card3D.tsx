import { useState, useRef, useCallback, memo, ReactNode } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  glareEnabled?: boolean;
  rotationIntensity?: number;
  floatOnHover?: boolean;
}

export const Card3D = memo(function Card3D({
  children,
  className,
  containerClassName,
  glareEnabled = true,
  rotationIntensity = 15,
  floatOnHover = true,
}: Card3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });
  const glareX = useSpring(50, { stiffness: 300, damping: 30 });
  const glareY = useSpring(50, { stiffness: 300, damping: 30 });
  const translateY = useSpring(0, { stiffness: 300, damping: 30 });
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    rotateX.set((y - 0.5) * -rotationIntensity);
    rotateY.set((x - 0.5) * rotationIntensity);
    glareX.set(x * 100);
    glareY.set(y * 100);
  }, [rotateX, rotateY, glareX, glareY, rotationIntensity]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (floatOnHover) {
      translateY.set(-8);
      scale.set(1.02);
    }
  }, [floatOnHover, translateY, scale]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
    translateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, glareX, glareY, translateY, scale]);

  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(ellipse at ${x}% ${y}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)`
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative', containerClassName)}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          y: translateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative rounded-2xl transition-shadow duration-300',
          isHovered && 'shadow-2xl shadow-primary/30',
          className
        )}
      >
        {/* 3D depth shadow */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-black/20 blur-xl"
          style={{
            transform: 'translateZ(-50px) translateY(20px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          aria-hidden="true"
        />

        {/* Main content */}
        <div style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>
        
        {/* Glare overlay */}
        {glareEnabled && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{ 
              background: glareBackground,
              transform: 'translateZ(40px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
        )}
        
        {/* Edge highlight */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)',
            transform: 'translateZ(30px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
        
        {/* Border glow */}
        <motion.div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent 40%, transparent 60%, hsl(var(--accent) / 0.4))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
});
