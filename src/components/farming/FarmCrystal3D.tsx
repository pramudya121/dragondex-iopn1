import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

/**
 * Premium animated 3D-style "Crop Orb" emblem used on the Farming page header.
 * Pure CSS/SVG 3D — no Three.js dependency.
 */
export function FarmCrystal3D() {
  return (
    <div className="relative w-40 h-40 sm:w-56 sm:h-56 mx-auto" style={{ perspective: 1000 }}>
      {/* Rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/40"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: 360, rotateX: 15 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-3 rounded-full border border-accent/40"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: -360, rotateZ: 20 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border border-primary/30"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />

      {/* Glow core */}
      <motion.div
        className="absolute inset-10 rounded-full bg-gradient-to-br from-primary via-accent to-primary blur-xl opacity-70"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
          style={{ top: '50%', left: '50%' }}
          animate={{
            x: [Math.cos((i / 8) * Math.PI * 2) * 90, Math.cos((i / 8) * Math.PI * 2 + Math.PI) * 90, Math.cos((i / 8) * Math.PI * 2) * 90],
            y: [Math.sin((i / 8) * Math.PI * 2) * 90, Math.sin((i / 8) * Math.PI * 2 + Math.PI) * 90, Math.sin((i / 8) * Math.PI * 2) * 90],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{ duration: 6 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ y: [-4, 4, -4], rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="p-5 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl border border-primary/50 shadow-[0_0_40px_hsl(var(--primary)/0.5)]"
        >
          <Sprout className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
        </motion.div>
      </div>
    </div>
  );
}
