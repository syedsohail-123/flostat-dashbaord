import { DeviceRepository, DeviceStatusRepository, ScheduleRepository } from "../../models/Models.js";
import { device_Type, MIN_THRESHOLD, MODE, PUMP_STATUS, VALVE_STATUS } from "../../utils/constants.js";
import { timeToMinutes } from "../../utils/timeUtilities.js";
import { updateDeviceStatus } from "./updateDeviceStatus.js";

// ---------------- VALVE LOGIC ----------------
export async function valveUpdateLogic(org_id, device_id, block_id, parent_id, current_status, update_status, options = {}) {
  if (current_status === update_status)
    return { success: true, message: "Already updated" };

  if (update_status === VALVE_STATUS.OPEN)
    return valveOpenLogic(org_id, device_id, block_id, options);
  if (update_status === VALVE_STATUS.CLOSE)
    return valveCloseLogic(org_id, device_id, block_id, options);

  return { success: false, message: "Invalid valve update" };
}

export async function valveOpenLogic(org_id, device_id, block_id, options = {}) {
  const valve = await DeviceRepository.getById({ org_id, device_id });
  if (!valve) return { success: false, message: "Valve not found" };

  const pump_id = valve.parent_id;

  if (!pump_id) return { success: false, message: "Parent pump not found" };

  const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: pump_id });
  await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.OPEN, options);

  const {mode} = options;
  if(mode ===MODE.MANUAL){
    return {success:true, message: "Valve opened in Manual mode"}
  }
  //  remaining code for AUTO mode

  if (pumpStatus?.state === "ON") {
    return { success: true, message: "Valve opened, pump already ON" };
  }

  const sump_id = (await DeviceRepository.getById({ org_id, device_id: pump_id }))?.parent_id;
  const sumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: sump_id });
  const sump_lvl = parseInt(sumpStatus?.current_level || 0, 10);

  if (sump_lvl <= MIN_THRESHOLD) {
    return { success: false, message: `Sump level too low (${sump_lvl}), valve not opened` };
  }

 
  await updateDeviceStatus(org_id, pump_id, device_Type.PUMP, block_id, null, "ON", options);
  return { success: true, message: "Valve opened and pump turned ON" };
}

export async function valveCloseLogic(org_id, device_id, block_id, options = {}) {
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
   const {mode} = options;
  // Checking last valve condition for 
  if (open_valves > 1) {
    if(mode===MODE.AUTO)await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.CLOSE, options);
    else{
      // for manual mode
      // check for the schedule match 
      const  {isConflicting,schedule}  = await checkForConflictingSchedule(org_id,device_id);
      console.log("Conflincting result : ",isConflicting);
      if(!isConflicting){
        await updateDeviceStatus(org_id, device_id, device_Type.VALVE, block_id, null, VALVE_STATUS.CLOSE, options);
        
      }else {
        return {
          success:false,
          message:"You can't turn off this valve it is been scheduled!",
          schedule
        }
      }
    }
    return { success: true, message: "Valve closed, pump kept ON" };
  }

 
  if(mode===MODE.MANUAL){
    return {success:true,message:"last Valve can't close, in Manual mode"}
  }
  // remaining for AUTO mode
  const pumpStatus = await DeviceStatusRepository.getById({ org_id, device_id: pump_id });
  if (pumpStatus.status === PUMP_STATUS.OFF) {
    return { success: false, message: "Last valve remains opened, pump is Already OFF" };
  }

  await updateDeviceStatus(org_id, pump_id, device_Type.PUMP, block_id, null, "OFF", options);
  return { success: true, message: "Last valve condition, pump turned OFF" };
}
const checkForConflictingSchedule = async (org_id, device_id) => {
  // 1️⃣ Get existing schedules
  const existingSchedules = await ScheduleRepository.getByField("org_id", org_id);
  // console.log("Existing Schedules (org):", existingSchedules);

  // 2️⃣ Filter schedules for this device
  const filteredSchedules = existingSchedules.filter(
    (schedule) => device_id === schedule.device_id
  );

  // 3️⃣ Get current time in HH:mm and convert to minutes
  // const istFormatter = new Intl.DateTimeFormat("en-IN", {
  //   timeZone: "Asia/Kolkata",
  //   dateStyle: "full",
  //   timeStyle: "long"
  // });
  
  // console.log("Time curr: ",istFormatter.format(new Date()));
   const now = new Date();

const formattedTime = now.toLocaleTimeString("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false, // optional: use 24-hour format
});
  const currentMinutes = timeToMinutes(formattedTime);

  // console.log("Current Time:", formattedTime);
  // console.log("Filtered Schedules:", filteredSchedules);

  // 4️⃣ Check if current time lies within any schedule’s time range
  const conflict = filteredSchedules.find((schedule) => {
    const start = timeToMinutes(schedule.start_time);
    const end = timeToMinutes(schedule.end_time);
    return currentMinutes >= start && currentMinutes <= end;
  });

  // 5️⃣ Return conflicting schedule or false
  if (conflict) {
    console.log("⚠️ Conflict found:", conflict);
     return { isConflicting: true, schedule: conflict };
  } else {
    console.log("✅ No conflict found");
    return { isConflicting: false, schedule: {} };

  }
};
