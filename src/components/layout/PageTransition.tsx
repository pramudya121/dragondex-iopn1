import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Enter-only transition (no AnimatePresence / exit) to avoid the route-deadlock
// issues called out in project memory. Subtle fade + lift + slight scale gives
// a smooth, premium feel without blocking navigation.
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {children}
    </motion.div>
  );
}
