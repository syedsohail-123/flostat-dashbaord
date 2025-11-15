import { cn } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EventStatus = "scheduled" | "active" | "completed" | "cancelled";

interface EventPillProps {
  title: string;
  device: string;
  startHour: number;
  durationHours: number;
  status: EventStatus;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  timeRangeStart?: number;
  timeRangeEnd?: number;
}

const statusColors: Record<EventStatus, string> = {
  // Scheduled: navy via theme tokens
  scheduled: "bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-hover))] active:bg-[hsl(var(--navy))]/90 border-[hsl(var(--navy))]",
  active: "bg-success/90 hover:bg-success/80 active:bg-success/70 border-success/80",
  completed: "bg-muted hover:bg-muted/90 active:bg-muted/80 border-muted-foreground/50",
  cancelled: "bg-destructive/90 hover:bg-destructive/80 active:bg-destructive/70 border-destructive/80",
};

const statusDots: Record<EventStatus, string> = {
  scheduled: "bg-[hsl(38,82%,58%)]", // Softer Yellow dot for scheduled
  active: "bg-white/90",
  completed: "bg-muted-foreground/70",
  cancelled: "bg-white/90",
};

export function EventPill({
  title,
  device,
  startHour,
  durationHours,
  status,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  className,
  timeRangeStart = 0,
  timeRangeEnd = 24,
}: EventPillProps) {
  const totalHours = timeRangeEnd - timeRangeStart;
  const width = `${(durationHours / totalHours) * 100}%`;
  const left = `${((startHour - timeRangeStart) / totalHours) * 100}%`;

  // Format time helper
  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const startTime = formatTime(startHour);
  const endTime = formatTime(startHour + durationHours);

  return (
    <div
      className={cn(
        "absolute group cursor-pointer rounded-md px-3 py-2 text-white transition-all duration-200 border shadow-soft-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
        statusColors[status],
        selected && "ring-2 ring-[hsl(var(--ring))]/80 ring-offset-2 ring-offset-background z-20 shadow-soft-lg",
        "hover:shadow-soft-md hover:z-10 hover:-translate-y-0.5",
        className
      )}
      style={{
        left,
        width,
        minWidth: "60px",
        top: "20%",
        height: "60%",
      }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div className="flex items-center gap-2 h-full pr-12">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full shrink-0 shadow-sm",
            statusDots[status]
          )}
        />
        <div className="flex-1 min-w-0 text-[11px] leading-tight">
          <div className="font-medium truncate">
            {startTime} - {endTime}
          </div>
          <div className="text-white/90 truncate text-[10px]">{title}</div>
        </div>
      </div>

      {selected && (
        <div className="absolute right-1 bottom-1 flex gap-1 z-30">
          <Button
            aria-label="Edit event"
            title="Edit"
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white/10 hover:bg-white/20 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            aria-label="Delete event"
            title="Delete"
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white/10 hover:bg-destructive/20 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
