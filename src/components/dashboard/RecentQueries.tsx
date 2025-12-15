import { Clock, ChevronRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const recentQueries = [
  {
    id: 1,
    query: "CAR-T cell therapy developments in solid tumors 2023-2024",
    status: "completed",
    time: "2 hours ago",
    results: 847,
  },
  {
    id: 2,
    query: "GLP-1 receptor agonists competitive landscape",
    status: "completed",
    time: "5 hours ago",
    results: 1203,
  },
  {
    id: 3,
    query: "mRNA vaccine platform patents filed in EU",
    status: "running",
    time: "Running...",
    results: null,
  },
  {
    id: 4,
    query: "Alzheimer's disease biomarkers clinical trials Phase III",
    status: "completed",
    time: "Yesterday",
    results: 156,
  },
  {
    id: 5,
    query: "CRISPR gene editing regulatory approvals",
    status: "failed",
    time: "2 days ago",
    results: null,
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    className: "text-accent",
    label: "Completed",
  },
  running: {
    icon: Loader2,
    className: "text-chart-2 animate-spin",
    label: "Running",
  },
  failed: {
    icon: AlertCircle,
    className: "text-destructive",
    label: "Failed",
  },
};

export function RecentQueries() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Recent Queries</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y divide-border">
        {recentQueries.map((query) => {
          const status = statusConfig[query.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <div
              key={query.id}
              className="group flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer"
            >
              <div className={cn("flex-shrink-0", status.className)}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium group-hover:text-accent transition-colors">
                  {query.query}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{query.time}</span>
                  {query.results && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {query.results.toLocaleString()} results
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
