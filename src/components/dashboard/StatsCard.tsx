import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  const isPositive = trend && trend.value > 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300",
        "hover:shadow-lg hover:border-accent/30",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-accent" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={isPositive ? "text-accent" : "text-destructive"}>
                {isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-accent/10 group-hover:text-accent">
          {icon}
        </div>
      </div>
    </div>
  );
}
