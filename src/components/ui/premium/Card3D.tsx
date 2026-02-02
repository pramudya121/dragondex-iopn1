import { useState, useRef, useCallback, memo, ReactNode } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  glareEnabled?: boolean;
  rotationIntensity?: number;
}

export const Card3D = memo(function Card3D({
  children,
  className,
  containerClassName,
  glareEnabled = true,
  rotationIntensity = 15,
}: Card3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });
  const glareX = useSpring(50, { stiffness: 300, damping: 30 });
  const glareY = useSpring(50, { stiffness: 300, damping: 30 });

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

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [rotateX, rotateY, glareX, glareY]);

  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative', containerClassName)}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative rounded-2xl transition-shadow duration-300',
          isHovered && 'shadow-dragon-lg',
          className
        )}
      >
        {children}
        
        {/* Glare overlay */}
        {glareEnabled && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{ background: glareBackground }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
        )}
        
        {/* Border glow */}
        <motion.div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), transparent, hsl(var(--accent) / 0.3))',
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
