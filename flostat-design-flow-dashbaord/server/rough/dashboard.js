// deviceController.js
import { DeviceRepository, DeviceStatusRepository } from "../../models/Models.js";
import { device_Type, PUMP_STATUS, VALVE_STATUS } from "../../utils/constants.js";
import { storeLogInDB } from "../../utils/logsStoreDB.js";
import { mqttPublish } from "../../utils/mqttPublish.js";

const MIN_THRESHOLD = 25;
const MAX_THRESHOLD = 75;

// ---------------- MQTT ----------------
export const mqttTest = async (req, res) => {
  try {
    const payload = {
      pump: "ON",
      sump: 90,
    };
    const result = await mqttPublish("pump/status", payload);
    return res.status(200).json({
      message: "send success",
      result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || error,
    });
  }
};

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

// ---------------- COMMAND UPDATE ----------------
export const updateCommandForDeviceState = async (req, res) => {
  try {
    const { org_id, device_id, device_type, block_id, status, current_level } = req.body;
    const email = req.user?.email || "system";

    if (!org_id || !device_type || !device_id) {
      return res.status(400).json({ success: false, message: "Missing params" });
    }

    let block = block_id || "none";

    if (current_level !== undefined) {
      if (!block) {
        return res.status(404).json({
          success: false,
          message: "Block id is required",
        });
      }
      await updateDeviceStatus(
        org_id,
        device_id,
        device_type,
        block,
        current_level,
        null,
        { email }
      );
    }

    const result = await managementLogicSystem(
      org_id,
      device_id,
      device_type,
      block,
      status,
      { email }
    );

    let status_code = result.success ? 200 : 400;
    return res.status(status_code).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ---------------- MANAGEMENT LOGIC ----------------
async function managementLogicSystem(org_id, device_id, device_type, block, status = null, options = {}) {
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

// ---------------- STOP PUMPS ----------------
async function stopAllPumps(org_id, sump_id, options = {}) {
  const devices = await DeviceRepository.getByField("org_id", org_id);
  const pumps = devices.filter((d) => d.device_type === device_Type.PUMP && d.parent_id === sump_id);

  for (const pump of pumps) {
    await updateDeviceStatus(org_id, pump.device_id, device_Type.PUMP, pump.block_id, null, "OFF", options);
  }

  return { success: true, message: "All pumps stopped" };
}

// ---------------- DEVICE STATUS ----------------
export async function updateDeviceStatus(
  org_id,
  device_id,
  device_type,
  block_id = "none",
  level = null,
  status = null,
  options = {}
) {
  const { email } = options;

  const item = {
    device_type,
    updated_by: email || "system",
    last_updated: new Date().toISOString(),
  };

  if (status !== null) item.status = status;
  if (level !== null) item.current_level = level;
  // if (email) item.updated_by = email;

  const topic = `flostat/${org_id}/command/${block_id}/${device_type}/${device_id}`;

  const deviceStatus = await DeviceStatusRepository.update({ org_id, device_id: device_id }, item);

  const payload = {
    type: "DEVICE_UPDATE",
    data: deviceStatus,
    updated_by: email || "system",
  };

  await mqttPublish(topic, payload);
  await storeLogInDB(deviceStatus);

  return item;
}

// ---------------- PUMP LOGIC ----------------
async function pumpUpdateLogic(org_id, device_id, block_id, parent_id, current_status, update_status, options = {}) {
  if (current_status === update_status)
    return { success: true, message: "Pump already in requested state" };

  if (update_status === "OFF") {
    await updateDeviceStatus(org_id, device_id, device_Type.PUMP, block_id, null, "OFF", options);
    return { success: true, message: "Pump turned OFF" };
  }

  const sumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: parent_id });
  const sump_level = parseInt(sumpStatus?.current_level || 0, 10);

  if (sump_level <= MIN_THRESHOLD) {
    return { success: false, message: `Sump level too low (${sump_level}), pump not started` };
  }

  await updateDeviceStatus(org_id, device_id, device_Type.PUMP, block_id, null, "ON", options);
  return { success: true, message: "Pump turned ON" };
}

// ---------------- VALVE LOGIC ----------------
async function valveUpdateLogic(org_id, device_id, block_id, parent_id, current_status, update_status, options = {}) {
  if (current_status === update_status)
    return { success: true, message: "Already updated" };

  if (update_status === VALVE_STATUS.OPEN)
    return valveOpenLogic(org_id, device_id, block_id, options);
  if (update_status === VALVE_STATUS.CLOSE)
    return valveCloseLogic(org_id, device_id, block_id, options);

  return { success: false, message: "Invalid valve update" };
}

async function valveOpenLogic(org_id, device_id, block_id, options = {}) {
  const valve = await DeviceRepository.getById({ org_id, device_id });
  if (!valve) return { success: false, message: "Valve not found" };

  const pump_id = valve.parent_id;
  if (!pump_id) return { success: false, message: "Parent pump not found" };

  const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: pump_id });
  if (pumpStatus?.state === "ON") {
    await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.OPEN, options);
    return { success: true, message: "Valve opened, pump already ON" };
  }

  const sump_id = (await DeviceRepository.getById({ org_id, device_id: pump_id }))?.parent_id;
  const sumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: sump_id });
  const sump_lvl = parseInt(sumpStatus?.current_level || 0, 10);

  if (sump_lvl <= MIN_THRESHOLD) {
    return { success: false, message: `Sump level too low (${sump_lvl}), valve not opened` };
  }

  await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.OPEN, options);
  await updateDeviceStatus(org_id, pump_id, device_Type.PUMP, block_id, null, "ON", options);
  return { success: true, message: "Valve opened and pump turned ON" };
}

async function valveCloseLogic(org_id, device_id, block_id, options = {}) {
  const valve = await DeviceRepository.getById({ org_id, device_id });
  if (!valve) return { success: false, message: "Valve not found" };

  const pump_id = valve.parent_id;
  if (!pump_id) return { success: false, message: "Parent pump not found" };

  const siblings = await DeviceRepository.getByField("org_id", org_id);
  const valves = siblings.filter((v) => v.device_type === device_Type.VALVE && v.parent_id === pump_id);

  let open_valves = 0;
  for (const v of valves) {
    const vs = await DeviceStatusRepository.getById({ org_id, device_id: v.device_id });
    if (vs?.status === VALVE_STATUS.OPEN) open_valves++;
  }

  if (open_valves > 1) {
    await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.CLOSE, options);
    return { success: true, message: "Valve closed, pump kept ON" };
  }

  const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: pump_id });
  if (pumpStatus.status === PUMP_STATUS.OFF) {
    return { success: false, message: "Last valve remains opened, pump is Already OFF" };
  }

  await updateDeviceStatus(org_id, pump_id, device_Type.PUMP, block_id, null, "OFF", options);
  return { success: true, message: "Last valve closed, pump turned OFF" };
}

// ---------------- TANK LOGIC ----------------
async function tankUpdateLogic(org_id, device_id, block_id, parent_id, options = {}) {
  const tankStatus = (await DeviceStatusRepository.getById({ org_id, device_id })) || {};
  const current_lvl = parseInt(tankStatus.current_level || 0, 10);

  const parentDevice = await DeviceRepository.getById({ org_id, device_id: parent_id });
  if (!parentDevice) return { success: true, message: "Tank Parent Not found!" };

  if (parentDevice.device_type === device_Type.PUMP) {
    const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: parentDevice.device_id });
    if (current_lvl <= MIN_THRESHOLD) {
      if (pumpStatus && pumpStatus.status === "ON") {
        return { success: false, message: "Tank Low ,Pump already turned ON" };
      }
      await updateDeviceStatus(org_id, parentDevice.device_id, device_Type.PUMP, block_id, null, "ON", options);
      return { success: true, message: "Tank level low ,Pump is turned ON" };
    }
    if (current_lvl >= MAX_THRESHOLD) {
      if (pumpStatus && pumpStatus.status === "OFF") {
        return { success: false, message: "Tank high ,Pump already turned OFF" };
      }
      await updateDeviceStatus(org_id, parentDevice.device_id, device_Type.PUMP, block_id, null, "OFF", options);
      return { success: true, message: "Tank level high ,Pump is turned OFF" };
    }
  }

  if (current_lvl >= MAX_THRESHOLD) {
    return valveCloseLogic(org_id, parent_id, block_id, options);
  }
  if (current_lvl <= MIN_THRESHOLD) {
    return valveOpenLogic(org_id, parent_id, block_id, options);
  }

  return { success: true, message: "Tank level within range" };
}
