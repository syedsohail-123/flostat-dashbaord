import { v4 as uuidv4 } from "uuid";
import {
  DeviceRepository,
  DeviceStatusRepository,
  DeviceTokenRepository,
  OrgRepository,
} from "../models/Models.js";
import { device_Type, deviceStatus, parentType } from "../utils/constants.js";

export const getDevicesByOrgId = async (req, res) => {
  try {
    console.log("Device getDevicesByOrgId");
    const { org_id } = req.body;
    if (!org_id) {
      return res.status(400).json({
        success: false,
        message: "Org is missing!",
      });
    }

    const devices = await DeviceRepository.getByField("org_id", org_id);
    console.log("Devices: ", devices);
    return res.status(200).json({
      success: true,
      message: "Device by " + org_id,
      devices,
    });
  } catch (error) {
    console.error("Error in device-create-b: ", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Device of org with status
 */
export const getDevicesWithStatusByOrgId = async (req, res) => {
  try {
    console.log("Device getDeviceWithStatus");
    const { org_id } = req.params;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        message: "Org is missing!",
      });
    }

    // 1. Get devices
    const devices = await DeviceRepository.getByField("org_id", org_id);
    if (!devices || devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No devices found for this org",
      });
    }

    // 2. Get statuses
    const deviceStatuses = await DeviceStatusRepository.getByField("org_id", org_id);

    // Convert to map for quick lookup
    const statusMap = {};
    if (deviceStatuses && deviceStatuses.length > 0) {
      deviceStatuses.forEach((status) => {
        statusMap[status.device_id] = status;
      });
    }

    // 3. Merge metadata + status
    const devicesWithStatus = devices.map((device) => {
      const statusRecord = statusMap[device.device_id] || {};
      
      // Check what type of status this device has
      let mergedStatus = "unknown";
      let lastUpdated = null;

      if (statusRecord.status) {
        // Pump / Valve case
        mergedStatus = statusRecord.status;
        lastUpdated = statusRecord.last_updated || statusRecord.updated_at || null;
      } else if (statusRecord.current_level !== undefined) {
        // Sump / Tank case
        mergedStatus = statusRecord.current_level
  
        lastUpdated = statusRecord.last_updated || null;
      }

      return {
        ...device,
        status: mergedStatus,
        updated_at: lastUpdated,
      };
    });
     console.log("DEVIce status: ",devicesWithStatus)

    return res.status(200).json({
      success: true,
      devices: devicesWithStatus,
    });
  } catch (error) {
    console.error("Error in getDeviceWithStatus-b: ", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingDevices = async (req, res) => {
  try {
    console.log("Device getPendingDevice");
    const { org_id } = req.body;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        message: "Org is missing!",
      });
    }

    const pendingDevices = await DeviceTokenRepository.getByFields({
      used: false,
      org_id: org_id,
    });
    console.log("Pending of org devie: ", pendingDevices);
    return res.status(200).json({
      success: true,
      message: "Successfull pending devices get",
      devices: pendingDevices,
    });
  } catch (error) {
    console.error("Error in device-getPendingDevice-b: ", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const deviceCreate = async (req, res) => {
  try {
    console.log("Device create");
    const { device_type, org_id } = req.body;
    const { email } = req.user;

    if (!device_type || !org_id) {
      return res.status(404).json({
        success: false,
        message: "Some params missing!",
      });
    }
    const device_id = uuidv4();
    const token_id = uuidv4();

    // save to devicetable
    const newDevice = await DeviceRepository.create({
      org_id,
      device_id,
      device_type,
      status: deviceStatus.PENDING,
      created_by: email,
      created_at: new Date().toISOString(),
    });
    console.log("Device : ", newDevice);

    //2. save to device token table
    const newTokenEntry = await DeviceTokenRepository.create({
      token_id,
      device_id,
      org_id,
      used: false,
      created_at: new Date().toISOString(),
    });
    console.log("New Token: ", newTokenEntry);
    // 3. get all device of org_id
    const devices = await DeviceRepository.getByField("org_id", org_id);
    return res.status(201).json({
      success: true,
      message: "Devices created",
      devices,
      token: newTokenEntry,
    });
  } catch (error) {
    console.error("Error in device-create-b: ", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deviceRegister = async (req, res) => {
  try {
    console.log("Device register");
    const { token_id, device_name, block_id, parent_id } = req.body;
    const { email } = req.user;

    if (!token_id || !device_name) {
      return res.status(404).json({
        success: false,
        message: "missing params!",
      });
    }

    // 1. Fetch token
    const tokenResult = await DeviceTokenRepository.getById({ token_id });

    if (!tokenResult) {
      return res.status(404).json({
        success: false,
        message: "Invalid token",
      });
    }
    console.log("dd1", tokenResult);

    // check if used
    if (tokenResult.used) {
      return res.status(404).json({
        success: false,
        message: "Token already used",
      });
    }
    console.log("dd2");
    const device_id = tokenResult.device_id;
    const org_id = tokenResult.org_id;
    // get device_type
    const device = await DeviceRepository.getById({ org_id, device_id });

    console.log("Device: ",device)
    if(device.device_type !== device_Type.SUMP && !block_id){
        return res.status(404).json({
          success:false,
          message:"block id required!"
        })
    }
    let blockId = block_id || null;
    let parentId = parent_id || null;
    if(device.device_type === device_Type.SUMP){
      blockId = null
       parentId=null
    }

    // update device
    const updateDevice = await DeviceRepository.update(
      { org_id, device_id },
      {
        status: deviceStatus.ACTIVE,
        activated_at: new Date().toISOString(),
        activated_by: email,
        device_name,
        block_id: blockId,
        parent_id: parentId,
      }
    );
    console.log("dd3");
    // update token
    const token = await DeviceTokenRepository.update(
      { token_id },
      { used: true, used_at: new Date().toISOString() }
    );
    console.log("DEvice update: ", updateDevice);
    console.log("token updated: ", token);

    // get all devices by org_id
    const devices = await DeviceRepository.getByField("org_id", org_id);
    return res.status(200).json({
      success: true,
      message: "Device registered",
      devices,
    });
  } catch (error) {
    console.error("Error in device-register-b: ", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDeviceParents = async (req, res) => {
  try {
    console.log("Device getDeviceParents");
    const { org_id, block_id, token_id, device_id } = req.body;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        message: "org_id is required",
      });
    }

    let device;

    // 1. If token_id is provided → resolve device via token
    if (token_id) {
      const deviceToken = await DeviceTokenRepository.getById({ token_id });
      if (!deviceToken) {
        return res.status(400).json({
          success: false,
          message: "Invalid token_id",
        });
      }
      device = await DeviceRepository.getById({
        org_id,
        device_id: deviceToken.device_id,
      });
    }

    // 2. If device_id is provided → fetch directly (for update flow)
    if (!device && device_id) {
      device = await DeviceRepository.getById({ org_id, device_id });
    }

    // 3. Validate device
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // 4. Special case: sump has no parent
    if (device.device_type === device_Type.SUMP) {
      return res.status(200).json({
        success: true,
        message: "Sump has no parent",
        devices: [],
      });
    }

    // 5. For Pump/Valve/Tank etc → block_id is required
    if (!block_id) {
      return res.status(400).json({
        success: false,
        message: "block_id is required for this device type",
      });
    }

    // 6. Determine parent type
    const parent_type = parentType[device.device_type];
    console.log("Parent type:", parent_type);

    // 7. Get org devices
    const orgDevices = await DeviceRepository.getByField("org_id", org_id);

    // 8. Filter by type, status, and block
    // const filteredDevices = orgDevices.filter((d) => {
    //   // if (d.status !== deviceStatus.ACTIVE) return false;

    //   if (d.device_type === parent_type) {
    //     // Sump can parent across blocks
    //     if (d.device_type === device_Type.SUMP) return true;

    //     // Pump/Valve parent must match block
    //     if (d.block_id && d.block_id === block_id) return true;
    //   }

    //   return false;
    // });

    //  8 new filter for 
    const filteredDevices = orgDevices.filter((d) => {
      // if (d.status !== deviceStatus.ACTIVE) return false;

      if (d.device_type === parent_type || (device.device_type===device_Type.TANK && d.device_type === device_Type.PUMP) ) {
        // Sump can parent across blocks
        if (d.device_type === device_Type.SUMP) return true;

        // Pump/Valve/Tank parent must match block
        if (d.block_id && d.block_id === block_id) return true;
      }

      return false;
    });
    console.log("Filer: ",filteredDevices)
    return res.status(200).json({
      success: true,
      message: "Parent devices fetched successfully",
      devices: filteredDevices,
    });
  } catch (error) {
    console.error("Error in getDeviceParents:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// getBlockValve
export const getBlockValve = async (req, res) => {
  try {
    console.log("Device getBlockValve");
    const { org_id, block_id} = req.body;

    if (!org_id || !block_id) {
      return res.status(400).json({
        success: false,
        message: "org_id is required",
      });
    }

    //  Get org devices
    const orgDevices = await DeviceRepository.getByField("org_id", org_id)

    //  8 new filter for 
    const filteredDevices = orgDevices.filter((d) => {
      // if (d.status !== deviceStatus.ACTIVE) return false;

      if (d.device_type === device_Type.VALVE){
        // Pump/Valve/Tank parent must match block
        if (d.block_id && d.block_id === block_id) return true;
      }

      return false;
    });
    console.log("Filer: ",filteredDevices)
    return res.status(200).json({
      success: true,
      message: "Parent devices fetched successfully",
      devices: filteredDevices,
    });
  } catch (error) {
    console.error("Error in getDeviceParents:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * Update Device
 */
export const deviceUpdate = async (req, res) => {
  try {
    console.log("Device update");
    const { device_id, org_id, device_name, block_id, parent_id } = req.body;
    const { email } = req.user;

    if (!device_id || !org_id) {
      return res.status(400).json({
        success: false,
        message: "device_id is required",
      });
    }
    console.log("devi id: ",org_id,device_id)
    // Update device record
    // if(!block_id){
    //   if( device.device_type !== device_Type.SUMP){
    //      return res.status(404).json({
    //       success:false,
    //       message:"Block id required"
    //      })
    //   }
    // }
    const device = await DeviceRepository.getById({org_id,device_id})
    if(!device){
       return res.status(404).json({
          success:false,
          message:"Device not Found!"
         })
    }
    const items = {
      device_name,
      parent_id: parent_id || null,
      updated_by: email,
      updated_at: new Date().toISOString(),
    }
    
    if(block_id){
      if(device.device_type===device_Type.SUMP){
        items["block_id"] = [block_id];
      }
      else items["block_id"] = block_id;
    }
    const updatedDevice = await DeviceRepository.update({device_id,org_id},items);
    if(updatedDevice.device_type===device_Type.PUMP && parent_id && updatedDevice.block_id){
      const sump = await DeviceRepository.getById({org_id,device_id:parent_id});
      const uniqueBlockIds = Array.from(
        new Set([...(sump?.block_id || []), updatedDevice.block_id])
      );
      const sump_items = {
        block_id:uniqueBlockIds
      }
      console.log("Sump block_ids ",sump_items);
      const sump_update = await DeviceRepository.update({org_id,device_id:sump.device_id},
        sump_items
      );
      console.log("Sump update: ",sump_update);
    }
    console.log("UPDA: ",updatedDevice)
    if (!updatedDevice) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Return updated device list for org
    const devices = await DeviceRepository.getByField(
      "org_id",
      updatedDevice.org_id
    );

    return res.status(200).json({
      success: true,
      message: "Device updated successfully",
      devices,
    });
  } catch (error) {
    console.error("Error in device-update:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Device
 */
export const deviceDelete = async (req, res) => {
  try {
    console.log("Device delete");
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({
        success: false,
        message: "device_id is required",
      });
    }

    // Get the device before deleting to retrieve org_id
    const device = await DeviceRepository.getByField("device_id", device_id);
    if (!device || device.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    // console.log("DEVIV: ",device)
    const org_id = device[0].org_id;
    // console.log("ORG ID : ",org_id)
    // Delete device
    await DeviceRepository.remove({ device_id, org_id });
    const deviceToken = await DeviceTokenRepository.deleteByTokenOrDeviceId(
      device_id
    );
    console.log("DDEL: ", deviceToken);
    // Return updated list
    const devices = await DeviceRepository.getByField("org_id", org_id);

    return res.status(200).json({
      success: true,
      message: "Device deleted successfully",
      devices,
    });
  } catch (error) {
    console.error("Error in device-delete:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateThreshold = async (req, res) => {
  try {
    console.log("Device updateThreshold");
    const { device_id,org_id,max_threshold,min_threshold} = req.body;

    if (!org_id || !device_id || !(min_threshold || max_threshold)) {
      return res.status(400).json({
        success: false,
        message: "parameter is missing!",
      });
    }
      if(min_threshold && max_threshold && (min_threshold>=max_threshold)){
        return res.status(400).json({
          success: false,
          message: "max_threshold should be greater then min_threshold",
        });
      }

    const updates = {};
    if(min_threshold) updates["min_threshold"] = min_threshold;
    if(max_threshold) updates["max_threshold"] = max_threshold;
    const device = await DeviceRepository.update({
      org_id,device_id
    },updates)

    // publish any mqtt message
    // const payload = {
    //   type:"UPDATE_THRESHOLD",
    //   data:{
    
    //     org_id,
    //     device_id,
    //     threshold
    //   }
    // }
 
    return res.status(200).json({
      success: true,
      message: "Parent devices fetched successfully",
      device
    });
  } catch (error) {
    console.error("Error in updateThreshold-b:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTanksOfOrg = async (req, res) => {
  try {
    console.log("Device getTanksOfOrg");
    const { org_id} = req.body;

    // check for org_id exist
    if(!org_id){
      return res.status(404).json({
        success:false,
        message:"Org_id is required!"
      })
    }
    // check for org exist
    const org = await OrgRepository.getById({org_id});

    if(!org){
       return res.status(404).json({
        success:false,
        message:"Org Not found!"
      })
    }

    // fectch all the device with org_id and filter with the device_type= tank
    const orgDevices = await DeviceRepository.getByField("org_id",org_id);

    const tankDevices = orgDevices.filter((device)=> device.device_type===device_Type.TANK);
    console.log("Tanks devices: ",tankDevices);
    // return all the device
    


    return res.status(200).json({
      success: true,
      message: "Tanks device fetch successfully",
      device:tankDevices
    });
  } catch (error) {
    console.error("Error in updateThreshold-b:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};