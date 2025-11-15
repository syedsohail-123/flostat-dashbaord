import { DeviceRepository } from "../../models/Models.js";
import { device_Type } from "../../utils/constants.js";
import { updateDeviceStatus } from "./updateDeviceStatus.js";

// ---------------- STOP PUMPS ----------------
export async function stopAllPumps(org_id, sump_id, options = {}) {
  const devices = await DeviceRepository.getByField("org_id", org_id);
  const pumps = devices.filter((d) => d.device_type === device_Type.PUMP && d.parent_id === sump_id);

  for (const pump of pumps) {
    await updateDeviceStatus(org_id, pump.device_id, device_Type.PUMP, pump.block_id, null, "OFF", options);
  }

  return { success: true, message: "All pumps stopped" };
}
