import { DeviceStatusRepository } from "../../models/Models.js";
import { device_Type, MIN_THRESHOLD } from "../../utils/constants.js";
import { updateDeviceStatus } from "./updateDeviceStatus.js";

// ---------------- PUMP LOGIC ----------------
export async function pumpUpdateLogic(org_id, device_id, block_id, parent_id, current_status, update_status, options = {}) {
  if (current_status === update_status)
    return { success: true, message: "Pump already in requested state" };

  if (update_status === "OFF") {
    await updateDeviceStatus(org_id, device_id, device_Type.PUMP, block_id, null, "OFF", options);
    return { success: true, message: "Pump turned OFF" };
  }
  console.log("Pump parent_id : ",parent_id)
  if(parent_id===null){
    console.warn("Asuming pump has connected to infinity source of water")
     await updateDeviceStatus(org_id, device_id, device_Type.PUMP, block_id, null, "ON", options);
  return { success: true, message: "Pump turned ON,Asuming pump has connected to infinity source of water" };
  }
  const sumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: parent_id });
  const sump_level = parseInt(sumpStatus?.current_level || 0, 10);

  if (sump_level <= MIN_THRESHOLD) {
    return { success: false, message: `Sump level too low (${sump_level}), pump not started` };
  }

  await updateDeviceStatus(org_id, device_id, device_Type.PUMP, block_id, null, "ON", options);
  return { success: true, message: "Pump turned ON" };
}