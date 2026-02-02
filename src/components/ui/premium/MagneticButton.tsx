import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, useMemo, useState, useCallback } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  magneticStrength?: number;
}

export const MagneticButton = memo(function MagneticButton({
  children,
  className,
  onClick,
  disabled,
  magneticStrength = 0.3,
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setPosition({
      x: (e.clientX - centerX) * magneticStrength,
      y: (e.clientY - centerY) * magneticStrength,
    });
  }, [magneticStrength, prefersReducedMotion, disabled]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center',
        'transition-colors duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 15,
        mass: 0.5,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      {children}
    </motion.button>
  );
});

interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  rippleColor?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const RippleButton = memo(function RippleButton({
  children,
  className,
  onClick,
  disabled,
  rippleColor = 'hsl(var(--primary) / 0.3)',
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
    
    onClick?.();
  }, [onClick, disabled]);

  return (
    <button
      className={cn(
        'relative overflow-hidden inline-flex items-center justify-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            background: rippleColor,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
          animate={{ 
            width: 400, 
            height: 400, 
            x: -200, 
            y: -200, 
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          aria-hidden="true"
        />
      ))}
    </button>
  );
});
