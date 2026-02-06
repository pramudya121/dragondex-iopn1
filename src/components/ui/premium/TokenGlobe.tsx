import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TOKEN_LIST } from '@/config/contracts';

interface OrbitToken {
  symbol: string;
  logoURI: string;
  orbitRadius: number;
  duration: number;
  size: number;
  delay: number;
  glowColor: string;
}

const orbitTokens: OrbitToken[] = [
  { symbol: 'OPN', logoURI: '/tokens/opn.jpg', orbitRadius: 90, duration: 14, size: 44, delay: 0, glowColor: '59, 130, 246' },
  { symbol: 'DRAGON', logoURI: '/tokens/dragon.png', orbitRadius: 135, duration: 19, size: 40, delay: 1.5, glowColor: '239, 68, 68' },
  { symbol: 'ETH', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', orbitRadius: 180, duration: 24, size: 36, delay: 3, glowColor: '139, 92, 246' },
  { symbol: 'BNB', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png', orbitRadius: 225, duration: 30, size: 32, delay: 0.8, glowColor: '245, 158, 11' },
  { symbol: 'MON', logoURI: '/tokens/mon.jpg', orbitRadius: 270, duration: 36, size: 30, delay: 2.5, glowColor: '167, 139, 250' },
  { symbol: 'HYPE', logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png', orbitRadius: 315, duration: 42, size: 28, delay: 4, glowColor: '236, 72, 153' },
];

export function TokenGlobe({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full h-[700px] flex items-center justify-center overflow-hidden", className)}>
      {/* Deep space background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-primary/15 via-transparent to-accent/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-secondary/20 via-transparent to-primary/20 blur-2xl animate-pulse" />
      </div>

      {/* Orbit rings */}
      {orbitTokens.map((token, idx) => (
        <motion.div
          key={`ring-${idx}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: token.orbitRadius * 2,
            height: token.orbitRadius * 2,
            border: `1px solid rgba(255,255,255,${0.08 - idx * 0.008})`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.12, duration: 0.8, ease: 'easeOut' }}
        >
          {/* Dashed orbit glow */}
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background: `conic-gradient(from ${idx * 60}deg, transparent, rgba(${token.glowColor},0.15) 15%, transparent 30%)`,
            }}
          />
        </motion.div>
      ))}

      {/* Center core */}
      <motion.div
        className="relative z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
      >
        <div className="relative">
          {/* Core glow */}
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-secondary blur-xl opacity-70 animate-pulse" />
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-tr from-red-500 via-orange-400 to-yellow-300 blur-md opacity-50" />

          {/* Core body */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-red-500 to-orange-400 flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
            <span className="text-4xl relative z-10">🐲</span>
          </div>

          {/* Rotating dashed ring */}
          <motion.div
            className="absolute -inset-5 rounded-full border-2 border-dashed border-primary/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>

      {/* Orbiting tokens with actual logos */}
      {orbitTokens.map((token, idx) => (
        <motion.div
          key={`token-${token.symbol}`}
          className="absolute pointer-events-none"
          style={{
            width: token.orbitRadius * 2,
            height: token.orbitRadius * 2,
          }}
          animate={{ rotate: idx % 2 === 0 ? 360 : -360 }}
          transition={{
            duration: token.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: token.delay,
          }}
        >
          <motion.div
            className="absolute pointer-events-auto"
            style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + idx * 0.15, type: 'spring', stiffness: 200 }}
          >
            {/* Counter-rotate to keep upright */}
            <motion.div
              animate={{ rotate: idx % 2 === 0 ? -360 : 360 }}
              transition={{
                duration: token.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: token.delay,
              }}
              whileHover={{ scale: 1.4 }}
              className="cursor-pointer group"
            >
              {/* Token glow */}
              <div
                className="absolute -inset-2 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity"
                style={{ backgroundColor: `rgba(${token.glowColor}, 0.4)` }}
              />

              {/* Token body */}
              <div
                className="relative rounded-full flex items-center justify-center shadow-xl border-2 border-white/20 overflow-hidden bg-background/80 backdrop-blur-sm"
                style={{
                  width: token.size,
                  height: token.size,
                  boxShadow: `0 0 20px rgba(${token.glowColor}, 0.3), 0 0 40px rgba(${token.glowColor}, 0.1)`,
                }}
              >
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const span = document.createElement('span');
                      span.className = 'font-bold text-white text-xs';
                      span.textContent = token.symbol.slice(0, 3);
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>

              {/* Token label on hover */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-foreground whitespace-nowrap bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border/50">
                  {token.symbol}
                </span>
              </div>

              {/* Trail */}
              <motion.div
                className="absolute top-1/2 left-full -translate-y-1/2 h-0.5 rounded-full opacity-20"
                style={{
                  width: 25,
                  backgroundColor: `rgba(${token.glowColor}, 0.6)`,
                }}
                animate={{ opacity: [0.2, 0.05, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}

      {/* Ambient particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${15 + Math.random() * 70}%`,
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}
