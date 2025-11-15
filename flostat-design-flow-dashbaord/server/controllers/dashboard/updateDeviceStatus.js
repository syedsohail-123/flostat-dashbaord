import {
  DeviceRepository,
  DeviceStatusRepository,
  UserOrgRepository,
} from "../../models/Models.js";
import { device_Type, LEVEL } from "../../utils/constants.js";
import { storeLogInDB } from "../../utils/logsStoreDB.js";
import { mqttPublish } from "../../utils/mqttPublish.js";
import { v4 as uuidv4 } from "uuid";
import { fcmPublishNotification } from "./handleFCMPublish.js";
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
  const { email, device } = options;

  const item = {
    device_type,
    updated_by: email || "system",
    last_updated: new Date().toISOString(),
  };
  // explicitly define none for sump
  if (device_type === device_Type.SUMP) {
    block_id = "none";
  }

  if (status !== null) item.status = status;
  if (level !== null) item.current_level = level;
  // if (email) item.updated_by = email;

  const topic = `flostat/${org_id}/command/${block_id}/${device_type}/${device_id}`;

  const deviceStatus = await DeviceStatusRepository.update(
    { org_id, device_id: device_id },
    item
  );
  const uuid = uuidv4();
  const updated = { ...deviceStatus, uuid };
  const payload = {
    type: "DEVICE_UPDATE",
    data: updated,
    updated_by: email || "system",
  };

  await mqttPublish(topic, payload);
  await storeLogInDB(updated);
  // FCM publish
  if (
    deviceStatus.device_type === device_Type.PUMP ||
    deviceStatus.device_type === device_Type.VALVE
  ) {
    // send the FCM notification
    const title = `${device?.device_name || device.device_id}: ${
      deviceStatus.status
    }`;
    const body = `Updated by ${payload.updated_by}`;
    // Sends notifications Via SNS - FCM
    await fcmPublishNotification(org_id, title, body, payload);
    console.log("SEND FCM NOTIFICATION FOR PUMP?VALVE");
  } else if (deviceStatus.device_type === device_Type.SUMP) {
    // only send when sump min_threshold is below threshold
    const min_threshold = device?.min_threshold | 25;
    if (deviceStatus.current_level <= min_threshold) {
      const title = `${LEVEL.LOW} water level in ${
        device?.device_name || device.device_id
      }`;
      const body = `Water level is ${deviceStatus.current_level}%`;
      console.log("Sump fcm title and body ",title,body)
      // Sends notifications Via SNS - FCM
      await fcmPublishNotification(org_id, title, body, payload);
      console.log("SEND FCM FOR LOW SUMP");
    }
  } else if (deviceStatus.device_type === device_Type.TANK) {
    // only send when tank  min_threshold or max_threshold hit
    const min_threshold = device?.min_threshold | 25;
    const max_threshold = device?.max_threshold | 75;
    if (deviceStatus.current_level <= min_threshold) {
      const title = `${LEVEL.LOW} water level in ${
        device?.device_name || device.device_id
      }`;
      const body = `Water level is ${deviceStatus.current_level}%`;
      await fcmPublishNotification(org_id, title, body, payload);
      console.log("SEND FCM FOR LOW  ALERT");
    }
    if (deviceStatus.current_level >= max_threshold) {
    const title = `${LEVEL.HIGH} water level in ${
        device?.device_name || device.device_id
      }`;
      const body = `Water level is ${deviceStatus.current_level}%`;
      await fcmPublishNotification(org_id, title, body, payload);
      console.log("SEND FCM FOR  HIGH ALERT");
    }
  }

  return item;
}
