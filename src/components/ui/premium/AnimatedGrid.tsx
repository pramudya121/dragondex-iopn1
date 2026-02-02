import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';

interface AnimatedGridProps {
  className?: string;
  columns?: number;
  rows?: number;
  cellSize?: number;
  color?: string;
  animated?: boolean;
}

export const AnimatedGrid = memo(function AnimatedGrid({
  className,
  columns = 20,
  rows = 20,
  cellSize = 40,
  color = 'var(--primary)',
  animated = true,
}: AnimatedGridProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const cells = useMemo(() => {
    const cellArray = [];
    for (let i = 0; i < columns * rows; i++) {
      cellArray.push({
        id: i,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 2,
      });
    }
    return cellArray;
  }, [columns, rows]);

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(${color} / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(${color} / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      />
      
      {/* Animated highlights */}
      {animated && !prefersReducedMotion && cells.slice(0, 30).map((cell) => (
        <motion.div
          key={cell.id}
          className="absolute rounded-sm"
          style={{
            width: cellSize - 2,
            height: cellSize - 2,
            left: (cell.id % columns) * cellSize + 1,
            top: Math.floor(cell.id / columns) * cellSize + 1,
            background: `hsl(${color} / 0.1)`,
          }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: cell.duration,
            repeat: Infinity,
            delay: cell.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
});
