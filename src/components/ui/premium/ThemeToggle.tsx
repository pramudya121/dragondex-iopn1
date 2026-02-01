import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check saved preference or default to dark
    const saved = localStorage.getItem("theme");
    const prefersDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    setIsAnimating(true);
    setIsDark(!isDark);
    
    // Add transition class for smooth color transitions
    document.documentElement.classList.add("theme-transition");
    
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    
    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
      setIsAnimating(false);
    }, 500);
  };

  return (
    <motion.button
      onClick={toggle}
      className={cn(
        "relative w-16 h-8 rounded-full p-1 transition-all duration-500 overflow-hidden",
        isDark 
          ? "bg-gradient-to-r from-muted to-muted/80" 
          : "bg-gradient-to-r from-amber-100 to-orange-100",
        className
      )}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Background glow effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 0.3 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute inset-0 rounded-full",
              isDark ? "bg-primary" : "bg-amber-400"
            )}
          />
        )}
      </AnimatePresence>

      {/* Toggle knob */}
      <motion.div
        className={cn(
          "relative w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10",
          isDark 
            ? "bg-gradient-to-br from-primary to-secondary" 
            : "bg-gradient-to-br from-amber-400 to-orange-400"
        )}
        animate={{ 
          x: isDark ? 0 : 32,
          rotate: isDark ? 0 : 180
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-3.5 h-3.5 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Background icons */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2"
        animate={{ opacity: isDark ? 0.5 : 0.2 }}
      >
        <Sun className="w-3 h-3 text-muted-foreground" />
      </motion.div>
      <motion.div
        className="absolute left-2 top-1/2 -translate-y-1/2"
        animate={{ opacity: isDark ? 0.2 : 0.5 }}
      >
        <Moon className="w-3 h-3 text-muted-foreground" />
      </motion.div>

      {/* Sparkle effects on toggle */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: isDark ? 0 : 32,
                  y: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: isDark ? [-10 + i * 10, -20 + i * 20] : [42 - i * 10, 52 - i * 20],
                  y: [-5 + i * 5, -15 + i * 10]
                }}
                transition={{ 
                  duration: 0.5,
                  delay: i * 0.1
                }}
                className="absolute top-1/2 -translate-y-1/2"
              >
                <Sparkles className={cn(
                  "w-2 h-2",
                  isDark ? "text-primary" : "text-amber-400"
                )} />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
