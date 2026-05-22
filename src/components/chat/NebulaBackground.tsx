import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  starCount?: number;
  cometCount?: number;
  className?: string;
}

/**
 * Cosmic Nebula backdrop — a deep-space scene with:
 *  - Layered nebula clouds (indigo · magenta · teal · violet) blended softly
 *  - 3 parallax star layers (fine dust, mid stars, bright giants with cross-flare)
 *  - Diagonal crossing comets (top-left ↘ and top-right ↙) with glowing trails
 *  - Subtle drifting motion on the deepest cloud layer for a living sky
 */
export function NebulaBackground({ starCount = 140, cometCount = 8, className = '' }: Props) {
  // Three star layers — distance-based size & brightness
  const starDust = useMemo(
    () =>
      Array.from({ length: Math.floor(starCount * 0.6) }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 0.8 + 0.3,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.4,
      })),
    [starCount],
  );

  const starMid = useMemo(
    () =>
      Array.from({ length: Math.floor(starCount * 0.3) }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.4 + 0.8,
        delay: Math.random() * 5,
        duration: 1.6 + Math.random() * 2.4,
        hue: Math.random() < 0.5 ? 220 : 300, // cool blue or violet tint
      })),
    [starCount],
  );

  const starGiant = useMemo(
    () =>
      Array.from({ length: Math.max(6, Math.floor(starCount * 0.08)) }).map((_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        top: 5 + Math.random() * 90,
        size: 2 + Math.random() * 2.2,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 3,
        hue: [190, 280, 320, 45][Math.floor(Math.random() * 4)], // cyan, violet, pink, gold
      })),
    [starCount],
  );

  const comets = useMemo(
    () =>
      Array.from({ length: cometCount }).map((_, i) => {
        const dirRight = i % 2 === 0;
        return {
          id: i,
          top: -5 + Math.random() * 50,
          left: dirRight ? -8 + Math.random() * 30 : 70 + Math.random() * 30,
          dirRight,
          delay: i * 1.6 + Math.random() * 2.5,
          duration: 2.6 + Math.random() * 2.4,
          length: 90 + Math.random() * 80,
          hue: [200, 280, 320][Math.floor(Math.random() * 3)],
        };
      }),
    [cometCount],
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* ── Base space gradient — deep midnight to indigo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, hsl(245 60% 10%) 0%, hsl(245 50% 6%) 40%, hsl(240 40% 3%) 100%)',
        }}
      />

      {/* ── Nebula cloud layer 1 — magenta + indigo bloom (drifts slowly) */}
      <motion.div
        className="absolute -inset-[10%] mix-blend-screen"
        style={{
          background:
            'radial-gradient(40% 35% at 25% 30%, hsl(290 90% 55% / 0.55) 0%, transparent 70%), ' +
            'radial-gradient(35% 40% at 75% 25%, hsl(230 95% 60% / 0.50) 0%, transparent 70%), ' +
            'radial-gradient(45% 35% at 60% 75%, hsl(320 90% 60% / 0.45) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Nebula cloud layer 2 — teal & cyan veil */}
      <motion.div
        className="absolute -inset-[10%] mix-blend-screen"
        style={{
          background:
            'radial-gradient(35% 30% at 15% 75%, hsl(180 95% 55% / 0.35) 0%, transparent 70%), ' +
            'radial-gradient(30% 25% at 85% 60%, hsl(195 90% 60% / 0.40) 0%, transparent 70%), ' +
            'radial-gradient(50% 40% at 50% 10%, hsl(265 90% 60% / 0.30) 0%, transparent 75%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, -25, 0], y: [0, 18, 0] }}
        transition={{ duration: 55, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Nebula cloud layer 3 — warm pink/amber accent (very subtle) */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-70"
        style={{
          background:
            'radial-gradient(25% 25% at 70% 40%, hsl(340 95% 65% / 0.30) 0%, transparent 70%), ' +
            'radial-gradient(20% 20% at 30% 60%, hsl(20 100% 60% / 0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── Star dust (tiny, far) */}
      {starDust.map((s) => (
        <motion.span
          key={`d-${s.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
          animate={{ opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Mid stars — slight color tint, glow */}
      {starMid.map((s) => (
        <motion.span
          key={`m-${s.id}`}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: `hsl(${s.hue} 30% 95%)`,
            boxShadow: `0 0 ${s.size * 4}px hsl(${s.hue} 80% 75% / 0.6)`,
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Giant stars with cross-shaped flare */}
      {starGiant.map((s) => (
        <motion.div
          key={`g-${s.id}`}
          className="absolute"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `hsl(${s.hue} 80% 92%)`,
              boxShadow: `0 0 ${s.size * 6}px hsl(${s.hue} 90% 70% / 0.9), 0 0 ${s.size * 14}px hsl(${s.hue} 90% 60% / 0.45)`,
            }}
          />
          {/* Diffraction spike — horizontal */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: s.size * 14,
              height: 1,
              background: `linear-gradient(90deg, transparent, hsl(${s.hue} 90% 85% / 0.7), transparent)`,
            }}
          />
          {/* Diffraction spike — vertical */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 1,
              height: s.size * 14,
              background: `linear-gradient(180deg, transparent, hsl(${s.hue} 90% 85% / 0.7), transparent)`,
            }}
          />
        </motion.div>
      ))}

      {/* ── Comets — crossing diagonals with glowing trails */}
      {comets.map((c) => {
        // Steeper diagonal "falling" angle (55° down). Motion vector matches the rotation
        // so the comet actually travels along its own trail instead of sliding sideways.
        const angleDeg = c.dirRight ? 55 : 125; // 55° down-right OR 125° down-left
        const rad = (angleDeg * Math.PI) / 180;
        const dist = 180; // viewport-percent distance
        const travelX = Math.cos(rad) * dist;
        const travelY = Math.sin(rad) * dist;

        return (
          <motion.div
            key={`c-${c.id}`}
            className="absolute"
            style={{
              top: `${c.top}%`,
              left: `${c.left}%`,
              width: c.length,
              height: 2,
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'left center',
              background: `linear-gradient(90deg, hsl(0 0% 100% / 0.95), hsl(${c.hue} 90% 70% / 0.7) 35%, transparent 100%)`,
              borderRadius: 9999,
              filter: `drop-shadow(0 0 6px hsl(${c.hue} 95% 70% / 0.85)) drop-shadow(0 0 12px hsl(${c.hue} 90% 60% / 0.5))`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [`0%`, `${travelX}%`],
              y: [`0%`, `${travelY}%`],
            }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              repeat: Infinity,
              repeatDelay: 5 + Math.random() * 4,
              ease: 'easeIn',
              times: [0, 0.12, 0.85, 1],
            }}
          />
        );
      })}

      {/* ── Vignette + grain for cinematic depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, hsl(240 40% 2% / 0.75) 100%)',
        }}
      />
    </div>
  );
}
