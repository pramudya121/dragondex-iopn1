import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface GlowOrbProps {
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  intensity?: number;
}

const sizeMap = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
  xl: 'w-96 h-96',
};

const colorMap = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
};

export const GlowOrb = memo(function GlowOrb({
  className,
  color = 'primary',
  size = 'md',
  animated = true,
  intensity = 0.5,
}: GlowOrbProps) {
  return (
    <motion.div
      className={cn(
        'absolute rounded-full pointer-events-none blur-3xl',
        sizeMap[size],
        className
      )}
      style={{
        background: `radial-gradient(circle, ${colorMap[color].replace(')', ` / ${intensity})`)} 0%, transparent 70%)`,
      }}
      animate={animated ? {
        scale: [1, 1.2, 1],
        opacity: [intensity, intensity * 0.7, intensity],
      } : undefined}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    />
  );
});
