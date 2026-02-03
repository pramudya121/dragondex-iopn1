import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TechItem {
  name: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
}

interface TechStackProps {
  items: TechItem[];
  className?: string;
}

export function TechStack({ items, className }: TechStackProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={cn(
            "group relative bg-card border border-border rounded-xl p-4 cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
          )}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            {item.icon && (
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  item.color || "bg-primary/10 text-primary"
                )}
              >
                {item.icon}
              </div>
            )}
            <h4 className="font-bold text-sm mb-1">{item.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function TechBadge({
  name,
  icon,
  className,
}: {
  name: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-sm font-medium transition-colors hover:border-primary/50",
        className
      )}
    >
      {icon}
      {name}
    </motion.div>
  );
}
