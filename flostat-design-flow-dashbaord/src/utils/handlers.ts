import { toast } from "sonner";
import { DEVICE_TYPE, VALVE_STATUS } from "./constants";
import { updateDeviceStatus } from "@/lib/operations/dashboardApis";
import { store } from "@/store";
// import { useSelector } from "react-redux";

  export const handleDeviceUpdate = async (token,device, state,level = null) => {
    //   const { token } = useSelector((state: RootState) => state.auth);
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