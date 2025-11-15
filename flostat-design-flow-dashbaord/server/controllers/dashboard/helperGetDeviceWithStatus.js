import { DeviceRepository, DeviceStatusRepository } from "../../models/Models.js";

// ---------------- HELPER FUNCTION TO GET DEVICE WITH STATUS ----------------
export const helperGetDeviceWithStatus = async (org_id) => {
  const devices = await DeviceRepository.getByField("org_id", org_id);
  if (!devices || devices.length === 0) {
    return null;
  }

  const deviceStatuses = await DeviceStatusRepository.getByField("org_id", org_id);

  const statusMap = {};
  if (deviceStatuses && deviceStatuses.length > 0) {
    deviceStatuses.forEach((status) => {
      statusMap[status.device_id] = status;
    });
  }

  return devices.map((device) => {
    const statusRecord = statusMap[device.device_id] || {};

    let mergedStatus = "unknown";
    let lastUpdated = null;

    if (statusRecord.status) {
      mergedStatus = statusRecord.status;
      lastUpdated = statusRecord.last_updated || statusRecord.updated_at || null;
    } else if (statusRecord.current_level !== undefined) {
      mergedStatus = statusRecord.current_level;
      lastUpdated = statusRecord.last_updated || null;
    }

    return {
      ...device,
      status: mergedStatus,
      updated_at: lastUpdated,
    };
  });
};