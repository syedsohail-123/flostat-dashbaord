import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string; // allow any string input
  label?: string;
  className?: string;
}

// Map raw device states → UI states
const statusTransformMap: Record<string, keyof typeof statusConfig> = {
  ON: "active",
  OFF: "inactive",
  OPEN: "warning",
  CLOSE: "inactive",
};

// UI configuration
const statusConfig = {
  active: {
    className: "bg-[hsl(var(--aqua))] text-white",
    defaultLabel: "Active",
  },
  inactive: {
    className: "bg-[#4B5563] text-white",
    defaultLabel: "Inactive",
  },
  warning: {
    className: "bg-warning text-white",
    defaultLabel: "Warning",
  },
  error: {
    className: "bg-destructive text-white",
    defaultLabel: "Error",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  // Normalize unknown values safely
  const normalized = statusTransformMap[status] ?? "error";
  const config = statusConfig[normalized];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {label ?? config.defaultLabel}
    </span>
  );
}
