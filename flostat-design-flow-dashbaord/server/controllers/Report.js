import { DeviceRepository, LogsTableRepository } from "../models/Models.js";
import { device_Type } from "../utils/constants.js";

export const tankRelatedReport = async (req, res) => {
  try {
    const { org_id, date, tank_id } = req.body;

    if (!org_id || !date || !tank_id) {
      return res.status(404).json({
        success: false,
        message: "Missing params!",
      });
    }

    // get  all the connected device for the tank
    const tankDevice = await DeviceRepository.getById({
      org_id,
      device_id: tank_id,
    });
    if (!tankDevice) {
      return res.status(404).json({
        success: false,
        message: "Tank device not Found!",
      });
    }

    if (!tankDevice?.parent_id) {
      return res.status(400).json({
        success: false,
        message: "Tank device Not connected!",
      });
    }
    // get the tank parent->(Valve/Pump)
    let connectedDeviceId = [];
    connectedDeviceId.push(tank_id);
    connectedDeviceId.push(tankDevice.parent_id);
    const tankParent = await DeviceRepository.getById({
      org_id,
      device_id: tankDevice.parent_id,
    });
    // tank_id + tankParent.device_id + tankParent.parent_id
    if (tankParent?.parent_id) {
      connectedDeviceId.push(tankParent.parent_id);
      const tankParentParent = await DeviceRepository.getById({
        org_id,
        device_id: tankParent.parent_id,
      });
      if (tankParentParent?.parent_id) {
        connectedDeviceId.push(tankParentParent.parent_id);
      }
    }
    // console.log("All tank connected device", connectedDeviceId);

    //  get the data form the logs table
    const completeOrgLogs = await LogsTableRepository.getByField(
      "org_id",
      org_id
    );
    // console.log("complete org logs: ", completeOrgLogs);
  const  tank_logs= [];
  const pump_logs= [];
  const valve_logs= [];
  const sump_logs= [];
  const matchedLogs = [];
  const connectedSet = new Set(connectedDeviceId);
  for(const log of completeOrgLogs){
    const logDateStr = log?.last_updated?.split("T")[0]; // extract date portion
    // console.log("Log date: ",logDateStr )
    if(connectedSet.has(log.device_id) &&  logDateStr === date){
      matchedLogs.push(log);
      switch(log.device_type){
        case device_Type.PUMP:
          pump_logs.push(log);
          break;
        case device_Type.SUMP:
          sump_logs.push(log);
          break;
        case device_Type.VALVE:
          valve_logs.push(log)
          break;
        case device_Type.TANK:
          tank_logs.push(log)
          break;
        default: break;
      }
    }
  } 
  // console.log("Pump logs: ",pump_logs)
  // console.log("valve logs: ",valve_logs)
  // console.log("tank logs: ",tank_logs)
  // console.log("sump logs: ",sump_logs)
  // console.log("✅ Matched Logs:", matchedLogs);
    return res.status(200).json({
      success: true,
      message: "Tank device related data fetch successfully",
      connectedLogs:matchedLogs,
      pump_logs,
      sump_logs,
      tank_logs,
      valve_logs
    });
  } catch (error) {
    console.error("Error in createSchedule:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// for device report from_date and to_date(optional)
export const deviceReport = async (req, res) => {
  try {
    const { org_id, from_date,to_date, device_id } = req.body;

    if (!org_id || !from_date || !to_date || !device_id) {
      return res.status(404).json({
        success: false,
        message: "Missing params!",
      });
    }

    // get  all the connected device for the tank
    const device = await DeviceRepository.getById({
      org_id,
      device_id,
    });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "device not Found!",
      });
    }

    
    //  get the data form the logs table
    const completeOrgLogs = await LogsTableRepository.getByField(
      "org_id",
      org_id
    );
    // console.log("complete org logs: ", completeOrgLogs);
  const  device_logs= [];
 
  for(const log of completeOrgLogs){
    const logDateStr = log.last_updated.split("T")[0]; // extract date portion
    if(device_id===log.device_id &&  logDateStr>= from_date && to_date >= logDateStr ){
      device_logs.push(log);
    }
  } 
  console.log("✅ Matched Logs:", device_logs);
    return res.status(200).json({
      success: true,
      message: "Device Logs fetch successfully",
      device_logs
    });
  } catch (error) {
    console.error("Error in deviceReport-b:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};