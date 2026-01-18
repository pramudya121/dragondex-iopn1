import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
}

interface GlowingStarsBackgroundProps {
  className?: string;
  starCount?: number;
}

export function GlowingStarsBackground({
  className,
  starCount = 50,
}: GlowingStarsBackgroundProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() > 0.5 ? Math.random() * 3 + 1 : null,
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, [starCount]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.radius * 2}px`,
            height: `${star.radius * 2}px`,
            opacity: star.opacity,
            animation: star.twinkleSpeed
              ? `twinkle ${star.twinkleSpeed}s ease-in-out infinite`
              : undefined,
          }}
        />
      ))}
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}

interface GlowingStarsCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowingStarsCard({ children, className }: GlowingStarsCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      <GlowingStarsBackground starCount={30} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
