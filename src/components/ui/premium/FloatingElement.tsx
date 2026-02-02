import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
}

export const FloatingElement = memo(function FloatingElement({
  children,
  className,
  duration = 3,
  distance = 10,
  delay = 0,
  direction = 'vertical',
}: FloatingElementProps) {
  const getAnimation = () => {
    switch (direction) {
      case 'vertical':
        return { y: [0, -distance, 0] };
      case 'horizontal':
        return { x: [0, distance, 0] };
      case 'both':
        return { x: [0, distance / 2, 0], y: [0, -distance, 0] };
    }
  };

  return (
    <motion.div
      className={cn('inline-block', className)}
      animate={getAnimation()}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
});
