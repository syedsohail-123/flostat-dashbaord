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
import { DEVICE_TYPE, PUMP_STATUS, VALVE_STATUS } from "@/utils/constants";
import { toast } from "sonner";
import { updateDeviceStatus } from "@/lib/operations/dashboardApis";
import { Switch } from "./ui/switch";

interface DeviceCardProps {
  device: any;
}

export const DeviceCard = ({ device }: DeviceCardProps) => {
  const { device_name, device_type } = device;
  

  const { blocksName } = useSelector((state: RootState) => state.org);
  const isOn =
    (device_type === "pump" && device?.status === "ON") ||  (device_type === "valve" && device?.status === VALVE_STATUS.OPEN);
  const { token } = useSelector((state: RootState) => state.auth);
  const nextActionLabel = device.device_type === "valve" ? (isOn ? "Close valve" : "Open valve") : (isOn ? "Turn power off" : "Turn power on");
  // status correction
  const derivedStatus: "connected" | "disconnected" = device.hardware_status
    ? device.hardware_status
    : "disconnected";

  const handleDeviceUpdate = async (device, state,level = null) => {
    console.log("State: ",state)
    // const newStatus = device.status === "ON" ? "OFF" : "ON";
    if (!device || !device.device_type || !device.device_id || !device.org_id) {
      toast.error("Missing params!");
      return;
    }
    const data = {
      device_type: device.device_type,
      device_id: device.device_id,
      org_id: device.org_id,
    };
    let newStatus = null;
    if (
      device?.device_type === DEVICE_TYPE.SUMP ||
      device?.device_type === DEVICE_TYPE.TANK
    ) {
      if (!level || level < 0 || level > 100) {
        toast.error("Level required or in between 0-100 " + level);
        return;
      }
      data["current_level"] = Number(level);
      data["block_id"] = device?.block_id ? device.block_id : "none";
    } else if (device?.device_type === DEVICE_TYPE.PUMP) {
      // PUMP Update status  call
      newStatus = device.status === "ON" ? "OFF" : "ON";
      data["status"] = newStatus;
    } else if (device?.device_type === DEVICE_TYPE.VALVE) {
      // VALVE Update status  call
      newStatus =
        device.status === VALVE_STATUS.OPEN
          ? VALVE_STATUS.CLOSE
          : VALVE_STATUS.OPEN;
      data["status"] = newStatus;
    } else {
      toast.error("Undefined device_type mention");
      return;
    }

    console.log("Send for update: ", data);
    const result = await updateDeviceStatus(data, token);
    //  use this when you update and also want to set the devices with status
    console.log("RE: ", result);
    if (result) {
      // device status will update with mqtt
      // dispatch(setDevices(result));
    }
    // updateDevice({ device_id: device.device_id, status: newStatus })
  };

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
    typeof device.status_percentage === "number"
      ? device.status_percentage
      : null;
  const wifiStrength =
    typeof device.wifi_strength === "number" ? device.wifi_strength : null;
  const batteryPercentage =
    typeof device.battery_percentage === "number"
      ? device.battery_percentage
      : null;

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
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
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

          {(device_type === "tank" || device_type === "sump") && (
            <div className="">{`${device?.status}%`}</div>
          )}
          {(device_type === "valve" || device_type==="pump") && (
            <div className="flex items-center justify-end gap-2  w-full py-2">
              {/* Status label */}
              <span className="text-sm font-medium">
                {device_type === "valve"
                  &&( isOn
                    ? VALVE_STATUS.OPEN
                    : VALVE_STATUS.CLOSE)}
                {device_type === "pump"
                  &&( isOn
                    ? PUMP_STATUS.ON
                    : PUMP_STATUS.OFF)}
              </span>

              {/* UI Switch */}
              {/* <Switch
                checked={isOn}
                onCheckedChange={(state) => handleDeviceUpdate(device,state)}
                aria-label={nextActionLabel}
              /> */}
            </div>
          )}
          
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
