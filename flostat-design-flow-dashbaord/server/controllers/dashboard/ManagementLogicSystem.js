import { DeviceRepository, DeviceStatusRepository } from "../../models/Models.js";
import { device_Type, MIN_THRESHOLD } from "../../utils/constants.js";
import { pumpUpdateLogic } from "./pumpUpdateLogic.js";
import { stopAllPumps } from "./stopAllPumps.js";
import { tankUpdateLogic } from "./tankUpdateLogic.js";
import { valveUpdateLogic } from "./valveUpdateLogic.js";

// ---------------- MANAGEMENT LOGIC ----------------
export async function managementLogicSystem(org_id, device_id, device_type, block, status = null, options = {}) {
  const device = await DeviceRepository.getById({ org_id, device_id });
  if (!device) return { success: false, message: "Device not found!" };

  let block_id = device.block_id || block;
  const parent_id = device.parent_id;
  const device_status = (await DeviceStatusRepository.getById({ org_id, device_id })) || {};
  
  const current_level = parseInt(device_status.current_level || 0, 10);
  const current_status = device_status.status || null;

  switch (device_type) {
    case device_Type.SUMP:
      if (current_level <= MIN_THRESHOLD) return stopAllPumps(org_id, device_id, options);
      return { success: true, message: "Sump updated" };

    case device_Type.PUMP:
      return pumpUpdateLogic(org_id, device_id, block_id, parent_id, current_status, status, options);

    case device_Type.TANK:
      return tankUpdateLogic(org_id, device_id, block_id, parent_id, options);

    case device_Type.VALVE:
      return valveUpdateLogic(org_id, device_id, block_id, parent_id, current_status, status, options);

    default:
      return { success: false, message: "Unknown device type" };
  }
}