import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
}

export function StatusIndicator({ 
  status = "online", 
  className 
}: StatusIndicatorProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-yellow-500"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "h-2 w-2 rounded-full",
          statusColors[status]
        )}
      />
      <span className="text-xs text-muted-foreground capitalize">
        {status}
      </span>
    </div>
  );
}