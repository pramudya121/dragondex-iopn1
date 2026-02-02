import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { throttle } from "@/lib/performance";

interface SpotlightProps {
  className?: string;
  fill?: string;
  size?: number;
  blur?: number;
  opacity?: number;
}

export const Spotlight = memo(function Spotlight({ 
  className, 
  fill = "hsl(var(--primary) / 0.3)",
  size = 600,
  blur = 80,
  opacity = 1,
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Throttled mouse handler for performance
  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }, 16), // ~60fps
    []
  );

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(false);
      return;
    }

    // Intersection observer for visibility
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, [handleMouseMove]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div
        className="absolute transition-opacity duration-300"
        style={{
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${fill}, transparent 40%)`,
          width: "100%",
          height: "100%",
          filter: `blur(${blur}px)`,
          opacity,
        }}
      />
    </div>
  );
});
