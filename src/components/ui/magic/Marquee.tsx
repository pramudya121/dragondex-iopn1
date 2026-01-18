import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  speed?: number;
}

export function Marquee({
  children,
  className,
  pauseOnHover = false,
  reverse = false,
  speed = 40,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--duration:40s] [--gap:1rem]",
        className
      )}
      style={{ "--duration": `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-around gap-[--gap] animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "animate-marquee-reverse"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center justify-around gap-[--gap] animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "animate-marquee-reverse"
        )}
        aria-hidden
      >
        {children}
      </div>
    </div>
  );
}
