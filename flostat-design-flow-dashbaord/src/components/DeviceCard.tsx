import {
  Battery,
  Droplet,
  Gauge,
  ThermometerSun,
  Waves,
  Wifi,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { StatusBadge } from "./StatusBadge";
import { StatusDeviceBadge } from "./StatusDeviceBadge";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface DeviceCardProps {
  device: any;
}

export const DeviceCard = ({ device }: DeviceCardProps) => {
  const { device_name, device_type } = device;
  console.log("Device in card: ",device)
  const {blocksName} = useSelector((state: RootState)=> state.org);
  const isOn = (device_type==="pump" || device_type==="valve") && device?.status?.toLowerCase() === "ON";

  // status correction
  const derivedStatus: "connected" | "disconnected" =
    device.hardware_status? device.hardware_status:"disconnected";
    

  // icons per device
  const typeIcons = {
    pump: Droplet,
    valve: Gauge,
    tank: ThermometerSun,
    sump: Waves,
  } as const;
  const TypeIcon = typeIcons[device_type as keyof typeof typeIcons] ?? Gauge;

  // values
  const statusPercentage =
    typeof device.status_percentage === "number" ? device.status_percentage : null;
  const wifiStrength =
    typeof device.wifi_strength === "number" ? device.wifi_strength : null;
  const batteryPercentage =
    typeof device.battery_percentage === "number" ? device.battery_percentage : null;

  // tank + sump level category
  function getLevelCategory(level: number | null) {
    if (level === null) return null;
    if (level < 40) return "low";
    if (level <= 70) return "normal";
    return "high";
  }

  const levelCategory =
    device_type === "tank" || device_type === "sump"
      ? getLevelCategory(statusPercentage)
      : null;

  return (
    <Card
      className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
 
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{device_name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {blocksName[device.block_id] ?? "No block"}
            </p>
          </div>
          <TypeIcon className="size-5 text-primary" />
        </div>

        <div className="flex items-center justify-between">
          <StatusDeviceBadge
            status={derivedStatus}
            label={
              levelCategory === "low"
                ? "Low"
                : levelCategory === "normal"
                ? "Normal"
                : levelCategory === "high"
                ? "High"
                : undefined
            }
            className={
              levelCategory
                ? levelCategory === "low"
                  ? "bg-[#C00000] text-white"
                  : levelCategory === "normal"
                  ? "bg-[#FFC107] text-white"
                  : "bg-[hsl(var(--aqua))] text-white"
                : undefined
            }
          />

          {(device_type==="tank" || device_type==="sump") && <div className="">
            {`${device?.status}%`}
          </div> }
          {(device_type==="valve" || device_type==="pump") && <div className="">
            {`${device?.status}`}
          </div> }
        </div>

        {(wifiStrength !== null ||
          batteryPercentage !== null ||
          device.hardware_status) && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            {device.hardware_status && (
              <div className="flex items-center gap-1">
                <Gauge className="size-4 text-primary" />
                <span>HW</span>
              </div>
            )}

            {wifiStrength !== null && (
              <div className="flex items-center gap-1">
                <Wifi className="size-4 text-primary" />
                <span>{wifiStrength} dBm</span>
              </div>
            )}

            {batteryPercentage !== null && (
              <div className="flex items-center gap-1">
                <Battery className="size-4 text-primary" />
                <span>{batteryPercentage}%</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
