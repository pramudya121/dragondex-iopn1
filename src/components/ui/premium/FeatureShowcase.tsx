import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, X, LucideIcon } from "lucide-react";

interface Feature {
  name: string;
  description?: string;
  icon?: LucideIcon;
  status: "done" | "pending" | "upcoming";
}

interface FeatureShowcaseProps {
  features: Feature[];
  className?: string;
   columns?: 1 | 2 | 3 | 4;
}

export function FeatureShowcase({ features, className, columns = 2 }: FeatureShowcaseProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
     4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border transition-all",
              feature.status === "done" && "bg-success/5 border-success/30",
              feature.status === "pending" && "bg-primary/5 border-primary/30",
              feature.status === "upcoming" && "bg-muted/50 border-border"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                feature.status === "done" && "bg-success/20 text-success",
                feature.status === "pending" && "bg-primary/20 text-primary",
                feature.status === "upcoming" && "bg-muted text-muted-foreground"
              )}
            >
              {feature.status === "done" ? (
                <Check className="w-4 h-4" />
              ) : feature.status === "pending" ? (
                Icon ? <Icon className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4
                className={cn(
                  "font-medium text-sm",
                  feature.status === "upcoming" && "text-muted-foreground"
                )}
              >
                {feature.name}
              </h4>
              {feature.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: "done" | "pending" | "upcoming" }) {
  const config = {
    done: { label: "Completed", className: "bg-success/10 text-success" },
    pending: { label: "In Development", className: "bg-primary/10 text-primary" },
    upcoming: { label: "Planned", className: "bg-muted text-muted-foreground" },
  };

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config[status].className)}>
      {config[status].label}
    </span>
  );
}
