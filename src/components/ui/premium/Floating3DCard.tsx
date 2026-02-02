import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, useRef, useState, useCallback } from 'react';

interface Floating3DCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  perspective?: number;
  rotationRange?: number;
  scale?: number;
  springConfig?: { stiffness: number; damping: number };
}

export const Floating3DCard = memo(function Floating3DCard({
  children,
  className,
  containerClassName,
  perspective = 1200,
  rotationRange = 20,
  scale = 1.05,
  springConfig = { stiffness: 400, damping: 30 },
}: Floating3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [rotationRange, -rotationRange]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-rotationRange, rotationRange]);
  
  const brightness = useTransform(
    mouseXSpring,
    [-0.5, 0, 0.5],
    [0.9, 1, 1.1]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || prefersReducedMotion) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  }, [x, y, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={cn('relative', containerClassName)}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          filter: prefersReducedMotion ? undefined : `brightness(${brightness.get()})`,
        }}
        animate={{
          scale: isHovered && !prefersReducedMotion ? scale : 1,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative rounded-2xl transition-shadow duration-300',
          isHovered && 'shadow-dragon-lg',
          className
        )}
      >
        {children}
        
        {/* Holographic overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          style={{
            background: `linear-gradient(
              105deg,
              transparent 40%,
              rgba(255, 255, 255, 0.1) 45%,
              rgba(255, 255, 255, 0.15) 50%,
              rgba(255, 255, 255, 0.1) 55%,
              transparent 60%
            )`,
            backgroundSize: '200% 200%',
            backgroundPosition: isHovered ? '100% 100%' : '0% 0%',
            transition: 'background-position 0.5s ease',
          }}
          aria-hidden="true"
        />
        
        {/* Edge glow */}
        <motion.div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent 50%, hsl(var(--accent) / 0.4))',
          }}
          aria-hidden="true"
        />
      </motion.div>
      
      {/* Shadow layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          background: 'hsl(var(--primary) / 0.2)',
          filter: 'blur(30px)',
          transform: 'translateY(20px) scale(0.9)',
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.3,
          scale: isHovered ? 0.95 : 0.85,
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
});
