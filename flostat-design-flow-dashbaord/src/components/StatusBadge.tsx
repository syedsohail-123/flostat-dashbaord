import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive" | "warning" | "error";
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
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

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {label || config.defaultLabel}
    </span>
  );
}
