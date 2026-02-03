import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface HoverEffectProps {
  items: {
    title: string;
    description: string;
    icon?: React.ReactNode;
    link?: string;
  }[];
  className?: string;
}

export function HoverEffect({ items, className }: HoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 block rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.2 },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <motion.div
            className={cn(
              "rounded-2xl h-full w-full p-6 overflow-hidden bg-card border border-border/50 relative z-20 transition-all duration-300",
              hoveredIndex === idx && "border-primary/50 shadow-xl shadow-primary/10"
            )}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {item.icon && (
              <motion.div 
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {item.icon}
              </motion.div>
            )}
            <h4 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {item.description}
            </p>
            
            {/* Decorative corner glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
