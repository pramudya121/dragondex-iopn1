import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Clock, Loader2, LucideIcon } from "lucide-react";

interface TimelineItem {
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
  icon?: LucideIcon;
  date?: string;
  features?: string[];
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-muted" />

      <div className="space-y-8">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const statusColors = {
            completed: "bg-success text-success-foreground border-success",
            "in-progress": "bg-primary text-primary-foreground border-primary animate-pulse",
            upcoming: "bg-muted text-muted-foreground border-border",
          };

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  statusColors[item.status]
                )}
              >
                {item.status === "completed" && <Check className="w-3 h-3" />}
                {item.status === "in-progress" && <Loader2 className="w-3 h-3 animate-spin" />}
                {item.status === "upcoming" && <Clock className="w-3 h-3" />}
              </div>

              {/* Content card */}
              <div
                className={cn(
                  "bg-card border border-border rounded-xl p-5 transition-all hover:border-primary/30",
                  item.status === "in-progress" && "border-primary/50 shadow-lg shadow-primary/10"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {Icon && (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      {item.date && (
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      item.status === "completed" && "bg-success/10 text-success",
                      item.status === "in-progress" && "bg-primary/10 text-primary",
                      item.status === "upcoming" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.status === "completed" && "Completed"}
                    {item.status === "in-progress" && "In Progress"}
                    {item.status === "upcoming" && "Upcoming"}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                
                {item.features && item.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feature, fIdx) => (
                      <span
                        key={fIdx}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs",
                          item.status === "completed" 
                            ? "bg-success/10 text-success" 
                            : item.status === "in-progress"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
