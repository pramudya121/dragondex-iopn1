import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  starCount?: number;
  cometCount?: number;
}

/**
 * Floating stars and diagonal comets overlay — designed to sit on top
 * of any background (e.g. WaveBackground) while keeping a cosmic feel.
 */
export function StarCometOverlay({ starCount = 100, cometCount = 8 }: Props) {
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
        hue: Math.random() < 0.5 ? 220 : 300,
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
        hue: [190, 280, 320, 45][Math.floor(Math.random() * 4)],
      })),
    [starCount],
  );

  const comets = useMemo(
    () =>
      Array.from({ length: cometCount }).map((_, i) => {
        const dirRight = i % 2 === 0;
        return {
          id: i,
          // Start near top, but staggered horizontally so they clearly cross
          top: -15 + Math.random() * 25,
          left: dirRight
            ? -5 + Math.random() * 45 // right-going: start on left side
            : 60 + Math.random() * 45, // left-going: start on right side
          dirRight,
          delay: i * 1.4 + Math.random() * 2.2,
          duration: 2.4 + Math.random() * 2.2,
          length: 110 + Math.random() * 90,
          hue: [200, 280, 320][Math.floor(Math.random() * 3)],
        };
      }),
    [cometCount],
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
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
        const angleDeg = c.dirRight ? 72 : 108;
        const rad = (angleDeg * Math.PI) / 180;
        const dist = 180;
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
              transform: `rotate(${angleDeg}deg)`,
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

      {/* ── Vignette for cinematic depth */}
      <div
        className="absolute inset-1"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(240 40% 2% / 0.6) 100%)',
        }}
      />
    </div>
  );
}
