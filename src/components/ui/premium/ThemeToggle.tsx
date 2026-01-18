import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Always dark for dragon theme
    document.documentElement.classList.add("dark");
  }, []);

  const toggle = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <motion.button
      onClick={toggle}
      className={cn(
        "relative w-16 h-8 rounded-full p-1 transition-colors",
        isDark ? "bg-muted" : "bg-primary/20",
        className
      )}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          isDark ? "bg-primary" : "bg-accent"
        )}
        animate={{ x: isDark ? 0 : 32 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-primary-foreground" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-accent-foreground" />
        )}
      </motion.div>
      
      {/* Background icons */}
      <Sun className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground opacity-50" />
      <Moon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground opacity-50" />
    </motion.button>
  );
}
