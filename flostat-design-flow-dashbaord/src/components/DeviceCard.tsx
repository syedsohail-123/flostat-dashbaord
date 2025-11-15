import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Droplets, Gauge, ThermometerSun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface DeviceCardProps {
  id: string;
  name: string;
  type: "pump" | "valve" | "tank" | "sump";
  status: "active" | "inactive" | "warning" | "error";
  value: number;
  unit: string;
  threshold?: { min: number; max: number };
  location: string;
}

const typeIcons = {
  pump: Droplets,
  valve: Gauge,
  tank: ThermometerSun,
  sump: Droplets,
} as const;

export function DeviceCard({ name, type, status, value, unit, threshold, location }: DeviceCardProps) {
  const Icon = typeIcons[type];
  const initialActive = status === "active";
  const [isOn, setIsOn] = useState<boolean>(initialActive);
  const derivedStatus: "active" | "inactive" | "warning" | "error" =
    status === "warning" || status === "error" ? status : isOn ? "active" : "inactive";
  const isActive = derivedStatus === "active";
  const nextActionLabel = type === "valve" ? (isOn ? "Close valve" : "Open valve") : (isOn ? "Turn power off" : "Turn power on");

  // Tank-specific percent conversion and color classification
  let displayValue = value;
  let displayUnit = unit;
  let tankPercent: number | null = null;
  let tankLevelCategory: 'low' | 'normal' | 'high' | null = null;
  // Sump-specific percent conversion and color classification
  let sumpPercent: number | null = null;
  let sumpLevelCategory: 'low' | 'normal' | 'high' | null = null;
  if (type === 'tank') {
    // If threshold provided treat max as 100%; else assume raw value already percent if <=100
    const maxCap = threshold?.max && threshold.max > 0 ? threshold.max : 100;
    tankPercent = Math.min(100, Math.round((value / maxCap) * 100));
    displayValue = tankPercent;
    displayUnit = '%';
    if (tankPercent <= 25) tankLevelCategory = 'low';
    else if (tankPercent >= 80) tankLevelCategory = 'high';
    else tankLevelCategory = 'normal';
  }
  if (type === 'sump') {
    const maxCap = threshold?.max && threshold.max > 0 ? threshold.max : 100;
    sumpPercent = Math.min(100, Math.round((value / maxCap) * 100));
    displayValue = sumpPercent;
    displayUnit = '%';
    if (sumpPercent <= 25) sumpLevelCategory = 'low';
    else if (sumpPercent >= 80) sumpLevelCategory = 'high';
    else sumpLevelCategory = 'normal';
  }

  return (
    <Card className="shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isActive ? "bg-aqua/10" : "bg-muted"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                isActive ? "text-aqua" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{location}</p>
            </div>
          </div>
          <StatusBadge
            status={derivedStatus}
            label={type === 'tank' && tankLevelCategory ? (
              tankLevelCategory === 'low' ? 'Low' : tankLevelCategory === 'normal' ? 'Normal' : 'High'
            ) : undefined}
            className={type === 'tank' && tankLevelCategory ? (
              tankLevelCategory === 'low'
                ? 'bg-[#C00000] text-white'
                : tankLevelCategory === 'normal'
                  ? 'bg-[#FFC107] text-white'
                  : 'bg-[hsl(var(--aqua))] text-white'
            ) : undefined}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          {type !== 'valve' && (
            <div>
              <span className="text-3xl font-bold">{displayValue}</span>
              <span className="ml-2 text-sm text-muted-foreground">{displayUnit}</span>
            </div>
          )}
          <Badge
            className={cn(
              'text-xs flex items-center gap-1 font-medium rounded-full px-2 py-0.5 bg-[hsl(var(--navy))] text-white',
              type === 'valve' && 'ml-auto'
            )}
            aria-label={type === 'sump' && sumpLevelCategory ? `Sump level ${sumpLevelCategory}` : undefined}
          >
            {type.toUpperCase()}
            {type === 'tank' && tankLevelCategory && (
              <span
                className={cn(
                  'ml-1 inline-block h-2 w-2 rounded-full',
                  tankLevelCategory === 'low' && 'bg-[#C00000]',
                  tankLevelCategory === 'normal' && 'bg-[#FFC107]',
                  tankLevelCategory === 'high' && 'bg-[hsl(var(--aqua))]'
                )}
                aria-label={`Tank level ${tankLevelCategory}`}
              />
            )}
          </Badge>
        </div>

        {threshold && type !== 'tank' && type !== 'valve' && type !== 'pump' && type !== 'sump' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {threshold.min}</span>
              <span>Max: {threshold.max}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  value >= threshold.min && value <= threshold.max ? 'bg-success' : 'bg-warning'
                )}
                style={{ width: `${Math.min((value / threshold.max) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {type === 'tank' && tankPercent !== null && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden" aria-label={`Tank level ${tankPercent}%`}>
              <div
                className={cn(
                  'h-full transition-all',
                  tankLevelCategory === 'low' && 'bg-[#C00000]',
                  tankLevelCategory === 'normal' && 'bg-[#FFC107]',
                  tankLevelCategory === 'high' && 'bg-[hsl(var(--aqua))]'
                )}
                style={{ width: `${tankPercent}%` }}
              />
            </div>
          </div>
        )}

        {type !== "tank" && (
          <div className="flex items-center justify-between border rounded-md p-2.5 bg-card">
            <span className="text-sm font-medium text-soft">{type === "valve" ? "Valve" : "Power"}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {isOn ? (type === "valve" ? "OPEN" : "ON") : (type === "valve" ? "CLOSED" : "OFF")}
              </span>
              <Switch
                checked={isOn}
                onCheckedChange={setIsOn}
                aria-label={nextActionLabel}
              />
            </div>
          </div>
        )}

        {/* Live region for assistive tech announcing status changes */}
        <span className="sr-only" aria-live="polite">
          {type === 'tank' && tankLevelCategory ? (
            `${name} level ${tankLevelCategory}`
          ) : type === 'sump' && sumpLevelCategory ? (
            `${name} level ${sumpLevelCategory}`
          ) : (
            `${name} status ${derivedStatus}`
          )}
        </span>

        {/* Details button removed per request */}
      </CardContent>
    </Card>
  );
}
