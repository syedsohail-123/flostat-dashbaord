import { BlockRepository, DeviceRepository, DeviceStatusRepository } from "../../models/Models.js";
import { device_Type, MODE } from "../../utils/constants.js";
import { sendNotification } from "../../utils/fcm.js";
import { mqttPublish } from "../../utils/mqttPublish.js";
import { managementLogicSystem } from "./ManagementLogicSystem.js";
import { updateDeviceStatus } from "./updateDeviceStatus.js";

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
export const fcmTest = async (req, res) => {
  try {
    const deviceToken =
     [ "fl1scVZcSreetC9AhIuW_5:APA91bF8UGqWivsQIl5WVRmYzGUqMDprp5VVDKvn_7w3pAXX-_eG9zz7Sv4502GFdFDgvBBPDo3Dtpq5mSG-XfxdF2qpX09XIHl7CZuNEjO38jw4Weci9K4",
  "dKiFD0obQOC5UX6A1ikoUr:APA91bE-QpW3nuq7CY7JgqInvzVODQ8MWlZA79Lz5pKH_MlbbagSAx3yKa8MyAyLykZyGfSUn4yL23dO9htvSFdp9DeYvqAlysKcbwiEZxnUQ_IrYw9J7J8"  
  ]
    deviceToken.forEach((token)=>{
       sendNotification(
      token,
      "Hello 👋",
      "This is a test FCM notification",
      {
        customKey: "customValue",
      }
    );
    })
     
    return res.status(200).json({
      message: "FCM notification send",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || error,
    });
  }
};

// ---------------- COMMAND UPDATE ----------------
export const updateCommandForDeviceState = async (req, res) => {
  try {
    const { org_id, device_id, device_type, block_id, status, current_level } = req.body;
    const email = req.user?.email || req.user?.hardware || "system";

    if (!org_id || !device_type || !device_id) {
      return res.status(400).json({
        success: false,
        message: "Missing params",
      });
    }

    let block = block_id || "none";
    console.log("Device params: ", org_id, device_id);

    // 🧠 Fetch device info
    const device = await DeviceRepository.getById({ org_id, device_id });
    console.log("Device found: ");
    if (!device) {
      return res.status(400).json({
        success: false,
        message: "Device not Found!",
      });
    }
 console.log("Device now update: ");
    // 🧱 Update current level if provided
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
        { email, device }
      );
    }

    console.log("Device Mode change: ");
    // ⚙️ Determine mode (default manual)

    let mode = MODE.MANUAL;
    if (device?.block_id && device.device_type !== device_Type.SUMP) {
      console.log("Block param: ", device?.block_id, org_id);
      const blockDetail = await BlockRepository.getById({
        block_id: device.block_id,
        org_id,
      });
      mode = blockDetail?.mode || MODE.MANUAL;
    }

    console.log("Mode of Update: ", mode);

    // 🧩 Run logic
    const result = await managementLogicSystem(
      org_id,
      device_id,
      device_type,
      block,
      status,
      { email, device, mode }
    );
    const deviceStatusUpdated = await DeviceStatusRepository.getById({org_id,device_id});

    // ✅ Send final single response
    return res.status(result.success ? 200 : 400).json({
      success:result.success,
      message:result.message,
      updatedStatus:deviceStatusUpdated
    });

  } catch (err) {
    console.error("❌ updateCommandForDeviceState Error:", err);
    if (!res.headersSent) {
      return res.status(400).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  }
};


// // ---------------- VALVE LOGIC ----------------
// async function valveUpdateLogic(org_id, device_id, block_id, parent_id, current_status, update_status, options = {}) {
//   if (current_status === update_status)
//     return { success: true, message: "Already updated" };

//   if (update_status === VALVE_STATUS.OPEN)
//     return valveOpenLogic(org_id, device_id, block_id, options);
//   if (update_status === VALVE_STATUS.CLOSE)
//     return valveCloseLogic(org_id, device_id, block_id, options);

//   return { success: false, message: "Invalid valve update" };
// }

// async function valveOpenLogic(org_id, device_id, block_id, options = {}) {
//   const valve = await DeviceRepository.getById({ org_id, device_id });
//   if (!valve) return { success: false, message: "Valve not found" };

//   const pump_id = valve.parent_id;
//   if (!pump_id) return { success: false, message: "Parent pump not found" };

//   const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: pump_id });
//   if (pumpStatus?.state === "ON") {
//     await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.OPEN, options);
//     return { success: true, message: "Valve opened, pump already ON" };
//   }

//   const sump_id = (await DeviceRepository.getById({ org_id, device_id: pump_id }))?.parent_id;
//   const sumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: sump_id });
//   const sump_lvl = parseInt(sumpStatus?.current_level || 0, 10);

//   if (sump_lvl <= MIN_THRESHOLD) {
//     return { success: false, message: `Sump level too low (${sump_lvl}), valve not opened` };
//   }

//   await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.OPEN, options);
//   await updateDeviceStatus(org_id, pump_id, device_Type.PUMP, block_id, null, "ON", options);
//   return { success: true, message: "Valve opened and pump turned ON" };
// }

// async function valveCloseLogic(org_id, device_id, block_id, options = {}) {
//   const valve = await DeviceRepository.getById({ org_id, device_id });
//   if (!valve) return { success: false, message: "Valve not found" };

//   const pump_id = valve.parent_id;
//   if (!pump_id) return { success: false, message: "Parent pump not found" };

//   const siblings = await DeviceRepository.getByField("org_id", org_id);
//   const valves = siblings.filter((v) => v.device_type === device_Type.VALVE && v.parent_id === pump_id);

//   let open_valves = 0;
//   for (const v of valves) {
//     const vs = await DeviceStatusRepository.getById({ org_id, device_id: v.device_id });
//     if (vs?.status === VALVE_STATUS.OPEN) open_valves++;
//   }

//   if (open_valves > 1) {
//     await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.CLOSE, options);
//     return { success: true, message: "Valve closed, pump kept ON" };
//   }

//   const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: pump_id });
//   if (pumpStatus.status === PUMP_STATUS.OFF) {
//     return { success: false, message: "Last valve remains opened, pump is Already OFF" };
//   }

//   await updateDeviceStatus(org_id, pump_id, device_Type.PUMP, block_id, null, "OFF", options);
//   return { success: true, message: "Last valve closed, pump turned OFF" };
// }
