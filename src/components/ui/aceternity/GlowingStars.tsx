import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useMemo, memo } from "react";

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
  maxRadius?: number;
  color?: string;
}

export const GlowingStarsBackground = memo(function GlowingStarsBackground({
  className,
  starCount = 50,
  maxRadius = 1.5,
  color = 'white',
}: GlowingStarsBackgroundProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate stars only once with useMemo
  const stars = useMemo(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        radius: Math.random() * maxRadius + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() > 0.5 ? Math.random() * 3 + 1 : null,
      });
    }
    return newStars;
  }, [starCount, maxRadius]);

  // Intersection observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {isVisible && stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.radius * 2}px`,
            height: `${star.radius * 2}px`,
            backgroundColor: color,
            opacity: star.opacity,
            animation: !prefersReducedMotion && star.twinkleSpeed
              ? `twinkle ${star.twinkleSpeed}s ease-in-out infinite`
              : undefined,
            willChange: star.twinkleSpeed ? 'opacity' : undefined,
          }}
        />
      ))}
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
});

interface GlowingStarsCardProps {
  children: React.ReactNode;
  className?: string;
  starCount?: number;
}

export const GlowingStarsCard = memo(function GlowingStarsCard({ 
  children, 
  className,
  starCount = 30,
}: GlowingStarsCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      <GlowingStarsBackground starCount={starCount} />
      <div className="relative z-10">{children}</div>
    </div>
  );
});
