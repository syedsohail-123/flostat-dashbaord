import { DeviceRepository, DeviceStatusRepository } from "../../models/Models.js";
import { device_Type, MAX_THRESHOLD, MIN_THRESHOLD, MODE } from "../../utils/constants.js";
import { updateDeviceStatus } from "./updateDeviceStatus.js";
import { valveCloseLogic, valveOpenLogic } from "./valveUpdateLogic.js";

// ---------------- TANK LOGIC ----------------
export async function tankUpdateLogic(org_id, device_id, block_id, parent_id, options = {}) {
  const tankStatus = (await DeviceStatusRepository.getById({ org_id, device_id })) || {};
  const current_lvl = parseInt(tankStatus.current_level || 0, 10);

  const parentDevice = await DeviceRepository.getById({ org_id, device_id: parent_id });
  if (!parentDevice) return { success: true, message: "Tank Parent Not found!" };
  // if it is in manual mode return
  const {mode,device} = options;
  if(mode ===null || mode===MODE.MANUAL){
     console.log("It is in manual mode do only tank update!");
     return { success: true ,message :"Tank Status updated M"}
  }
    console.log("Device: ",device)
    const maxThreshold = (device.max_threshold || MAX_THRESHOLD)
    const minThreshold = (device.min_threshold || MIN_THRESHOLD)
    console.log("MAX VAL: ",maxThreshold,minThreshold)
  if (parentDevice.device_type === device_Type.PUMP) {
    const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: parentDevice.device_id });
    if (current_lvl <= minThreshold) {
      if (pumpStatus && pumpStatus.status === "ON") {
        return { success: false, message: "Tank Low ,Pump already turned ON" };
      }
      await updateDeviceStatus(org_id, parentDevice.device_id, device_Type.PUMP, block_id, null, "ON", options);
      return { success: true, message: "Tank level low ,Pump is turned ON" };
    }
  
    if (current_lvl >=  maxThreshold) {
      if (pumpStatus && pumpStatus.status === "OFF") {
        return { success: false, message: "Tank high ,Pump already turned OFF" };
      }
      await updateDeviceStatus(org_id, parentDevice.device_id, device_Type.PUMP, block_id, null, "OFF", options);
      return { success: true, message: "Tank level high ,Pump is turned OFF" };
    }
  }

  if (current_lvl >= maxThreshold) {
    return valveCloseLogic(org_id, parent_id, block_id, options);
  }
  if (current_lvl <= minThreshold) {
    return valveOpenLogic(org_id, parent_id, block_id, options);
  }

  return { success: true, message: "Tank level within range" };
}