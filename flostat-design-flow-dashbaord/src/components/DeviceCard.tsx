import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Droplets, Gauge, ThermometerSun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Device } from "./types/types";


const typeIcons = {
  pump: Droplets,
  valve: Gauge,
  tank: ThermometerSun,
  sump: Droplets,
} as const;
interface DeviceCardProps {
  device: Device;
}
export function DeviceCard({device}:DeviceCardProps) {
  console.log("Device in card: ",device)
  const Icon = typeIcons[device.device_type];
  const initialActive = device?.hardware_status === "connected";
  const [isOn, setIsOn] = useState<boolean>(initialActive);
  const derivedStatus: "active" | "inactive" | "warning" | "error" =
    status === "warning" || status === "error" ? status : isOn ? "active" : "inactive";
  const isActive = derivedStatus === "active";
  const nextActionLabel = device.device_type === "valve" ? (isOn ? "Close valve" : "Open valve") : (isOn ? "Turn power off" : "Turn power on");

  // Tank-specific percent conversion and color classification
  let displayValue = device.status;
  let displayUnit = "";
  let tankPercent: number | null = null;
  let tankLevelCategory: 'low' | 'normal' | 'high' | null = null;
  // Sump-specific percent conversion and color classification
  let sumpPercent: number | null = null;
  let sumpLevelCategory: 'low' | 'normal' | 'high' | null = null;
  if (device.device_type === 'tank') {
    // If device?.max_threshold provided treat max as 100%; else assume raw value already percent if <=100
    const maxCap = device?.max_threshold&& device?.max_threshold > 0 ? device?.max_threshold : 100;
    tankPercent = Math.min(100, Math.round((device?.status / maxCap) * 100));
    displayValue = tankPercent;
    displayUnit = '%';
    if (tankPercent <= 25) tankLevelCategory = 'low';
    else if (tankPercent >= 80) tankLevelCategory = 'high';
    else tankLevelCategory = 'normal';
  }
  if (device.device_type === 'sump') {
    const maxCap = device?.max_threshold&& device?.max_threshold > 0 ? device?.max_threshold : 100;
    sumpPercent = Math.min(100, Math.round((device.status / maxCap) * 100));
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
              <CardTitle className="text-base font-semibold">{device.device_name || device.device_id}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{"location"}</p>
            </div>
          </div>
          <StatusBadge
            status={derivedStatus}
            label={device.device_type === 'tank' && tankLevelCategory ? (
              tankLevelCategory === 'low' ? 'Low' : tankLevelCategory === 'normal' ? 'Normal' : 'High'
            ) : undefined}
            className={device.device_type === 'tank' && tankLevelCategory ? (
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
          {device.device_type !== 'valve' && (
            <div>
              <p className="text-sm text-muted-foreground">{displayValue} {displayUnit}</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last sync</p>
            <p className="text-xs font-medium">Just now</p>
          </div>
        </div>
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {device.device_type === "valve" ? (isOn ? "Open" : "Closed") : (isOn ? "Running" : "Stopped")}
            </span>
            <Switch
              checked={isOn}
              onCheckedChange={setIsOn}
              aria-label={nextActionLabel}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}