import { v4 as uuidv4 } from "uuid";
import { DeviceRepository, ScheduleRepository } from "../models/Models.js";
import { mqttPublish } from "../utils/mqttPublish.js";
import {  addSecondsToISO, isoToSeconds } from "../utils/timeUtilities.js";
import { device_Type, SCHEDULE_PENDING_STATUS } from "../utils/constants.js";


// ✅ CREATE schedule
export const createSchedule = async (req, res) => {
  try {
    const {
      org_id,
      block_id,
      device_type,
      device_id,
      start_time,
      end_time,
      recurrence,
      created_by,
      safety_offset,
    } = req.body;

    if (!org_id || !block_id || !device_type || !device_id || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: "Missing required fields!" });
    }
        const device = await DeviceRepository.getById({device_id,org_id})
      if(!device){
        return res.status(400).json({
          success: false,
          message: "Device not Found!",
        });
      }

      if(!device?.parent_id){
         return res.status(404).json({
        success: false,
        message: "Valve is not connected to pump!",
      });
      }
    // Validate time
    if (start_time > end_time) {
      return res.status(400).json({
        success: false,
        message: "Start time must be earlier than end time!",
      });
    }
    const newStart =isoToSeconds(start_time)
    const newEnd = isoToSeconds(end_time)
    // 🔍 Check for overlapping schedules
    const existingSchdeules = await ScheduleRepository.getByField("org_id",org_id);
    console.log("Existing Sch:org: ",existingSchdeules);
    console.log("REAL: ",start_time,end_time)
    console.log("NEW sta: sec ",newStart,newEnd)
     const fileterSchedules = existingSchdeules.filter((schedule)=>{
        
        return (block_id=== schedule.block_id && device_id===schedule.device_id)
    })
    console.log("Filter sch: ",fileterSchedules)
    const conflicts = fileterSchedules.filter((schedule)=>{
        const existingStart = isoToSeconds(schedule?.start_time);
        const existingEnd = isoToSeconds(schedule?.end_time)
       
        console.log("Confilet check :ex end ",existingEnd,"ex st: ",existingStart,"new s: ",newStart,"new e: ",newEnd)
        return (newStart===existingStart && newEnd===existingEnd) || (existingEnd >= newStart && newStart >= existingStart ) || (existingEnd >= newEnd && newEnd >= existingStart );
    })
    console.log("Confilt: ",conflicts)
    if (conflicts.length > 0) {
      return res.status(409).json({
        success:false,
        message:"Conflict occured",
        status: "conflict",
        // conflicting_schedules: conflicts,
        options: ["delete_existing", "shorten_existing", "shorten_new"],
      });
    }

    const p_start_time = addSecondsToISO(start_time,30);
    console.log("Pump start: ",p_start_time)
    // ✅ Create new schedule
    const schedule_id = uuidv4();
    const newSchedule = await ScheduleRepository.create({
      schedule_id,
      org_id,
      block_id,
      device_type,
      device_id,
      schedule_status:SCHEDULE_PENDING_STATUS.CREATING,
      start_time,
      p_start_time,
      end_time,
      recurrence,
      pump_ack:false,
      valve_ack:false,
      acknowledge:{
        valve_id:device_id,
        pump_id:  device.parent_id,

      }
      ,
      created_by,
      safety_offset: safety_offset || { pre: 30, post: 30 },
      created_at: new Date().toISOString(),
    });

    // 🚀 Publish to MQTT for acknowledgement
    const valve_topic = `flostat/${org_id}/command/${block_id}/${device_type}/${device_id}/hardware`;
    const pump_topic = `flostat/${org_id}/command/${block_id}/${device_Type.PUMP}/${device.parent_id}/hardware`;
    console.log("Topci: ",valve_topic,pump_topic)
   
    const payload = {
        type: "SCHEDULE_CREATED",
        data: newSchedule,
        timestamp: new Date().toISOString(),
    }
    console.log("Mqtt ack payload: ",payload)
    await mqttPublish(valve_topic, payload);
    await mqttPublish(pump_topic,payload);
    // const schedules = await ScheduleRepository.getByField("org_id",org_id);
    return res.status(200).json({ success: true, 
        message:"Schedule created",
        schedule:newSchedule});
  } catch (error) {
    console.error("Error in createSchedule:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




// ✅ GET all schedules by org_id
export const getScheduleByOrgId = async (req, res) => {
  try {
    const { org_id } = req.body;
    if(!org_id){
        return res.status(404).json({
            success:false,
            message:"Org_id is required!"
        })
    }
    const schedules = await ScheduleRepository.getByField("org_id", org_id);
    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error("Error in getScheduleByOrgId:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ GET schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { schedule_id } = req.params;
    const schedule = await ScheduleRepository.getById(schedule_id);
    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }