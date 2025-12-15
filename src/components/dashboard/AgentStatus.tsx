import { CheckCircle2, Loader2, AlertCircle, FileText, FlaskConical, Scale, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const agents = [
  {
    id: "regulatory",
    name: "Regulatory Agent",
    icon: Scale,
    status: "active",
    lastRun: "2 min ago",
    processed: "12,456",
  },
  {
    id: "clinical",
    name: "Clinical Trials",
    icon: FlaskConical,
    status: "running",
    lastRun: "Running...",
    processed: "8,234",
  },
  {
    id: "journals",
    name: "Scientific Journals",
    icon: BookOpen,
    status: "active",
    lastRun: "5 min ago",
    processed: "45,678",
  },
  {
    id: "patents",
    name: "Patents",
    icon: FileText,
    status: "active",
    lastRun: "8 min ago",
    processed: "23,456",
  },
  {
    id: "market",
    name: "Market Insights",
    icon: TrendingUp,
    status: "error",
    lastRun: "API Error",
    processed: "15,234",
  },
];

const statusConfig = {
  active: {
    icon: CheckCircle2,
    className: "text-accent bg-accent/10",
    dotClassName: "bg-accent",
  },
  running: {
    icon: Loader2,
    className: "text-chart-2 bg-chart-2/10",
    dotClassName: "bg-chart-2 animate-pulse",
  },
  error: {
    icon: AlertCircle,
    className: "text-destructive bg-destructive/10",
    dotClassName: "bg-destructive",
  },
};

export function AgentStatus() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="font-semibold">AI Agents Status</h3>
        <p className="text-sm text-muted-foreground mt-1">Real-time agent monitoring</p>
      </div>
      <div className="grid gap-3 p-4">
        {agents.map((agent) => {
          const status = statusConfig[agent.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <div
              key={agent.id}
              className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
            >
              <div className={cn("rounded-lg p-2", status.className)}>
                <agent.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <div className={cn("h-2 w-2 rounded-full", status.dotClassName)} />
                </div>
                <p className="text-xs text-muted-foreground">{agent.lastRun}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{agent.processed}</p>
                <p className="text-xs text-muted-foreground">processed</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
