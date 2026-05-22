import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  starCount?: number;
  cometCount?: number;
  className?: string;
}

/**
 * Nebula backdrop for DragonBot:
 * - Deep cosmic gradient tuned to brand (crimson / ember / gold haze)
 * - Twinkling stars (random positions, delays)
 * - Diagonal falling comets crossing each other (top-left ↘ and top-right ↙)
 */
export function NebulaBackground({ starCount = 60, cometCount = 6, className = '' }: Props) {
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 4,
        duration: 1.6 + Math.random() * 2.4,
        opacity: 0.4 + Math.random() * 0.6,
      })),
    [starCount],
  );

  const comets = useMemo(
    () =>
      Array.from({ length: cometCount }).map((_, i) => {
        // Alternate direction so they cross each other diagonally
        const dirRight = i % 2 === 0;
        return {
          id: i,
          top: -10 + Math.random() * 40,        // start above / near top
          left: dirRight ? -10 + Math.random() * 30 : 70 + Math.random() * 30,
          dirRight,
          delay: i * 1.4 + Math.random() * 2,
          duration: 2.8 + Math.random() * 2.2,
          length: 70 + Math.random() * 60,
        };
      }),
    [cometCount],
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Deep nebula gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 15%, hsl(0 85% 25% / 0.55) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 80% 30%, hsl(15 90% 30% / 0.45) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 50% 85%, hsl(35 100% 35% / 0.32) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 70% 70%, hsl(280 70% 25% / 0.35) 0%, transparent 60%), ' +
            'linear-gradient(180deg, hsl(240 40% 4%) 0%, hsl(0 0% 3%) 60%, hsl(0 30% 5%) 100%)',
        }}
      />
      {/* Soft nebula cloud overlay */}
      <div
        className="absolute inset-0 opacity-60 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, hsl(0 80% 50% / 0.18), transparent 40%), ' +
            'radial-gradient(circle at 75% 60%, hsl(35 100% 55% / 0.14), transparent 45%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Stars */}
      {stars.map((s) => (
        <motion.span
          key={`star-${s.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 3}px hsl(0 0% 100% / 0.6)`,
          }}
          animate={{ opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Comets — crossing diagonals */}
      {comets.map((c) => {
        const angle = c.dirRight ? 35 : -35; // tilt downward
        const travelX = c.dirRight ? 140 : -140;
        const travelY = 140;
        return (
          <motion.div
            key={`comet-${c.id}`}
            className="absolute"
            style={{
              top: `${c.top}%`,
              left: `${c.left}%`,
              width: c.length,
              height: 2,
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'left center',
              background:
                'linear-gradient(90deg, hsl(0 0% 100% / 0.9), hsl(35 100% 60% / 0.6) 40%, transparent 100%)',
              borderRadius: 9999,
              filter: 'drop-shadow(0 0 4px hsl(35 100% 60% / 0.7))',
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
              repeatDelay: 4 + Math.random() * 3,
              ease: 'easeIn',
              times: [0, 0.1, 0.85, 1],
            }}
          />
        );
      })}
    </div>
  );
}
