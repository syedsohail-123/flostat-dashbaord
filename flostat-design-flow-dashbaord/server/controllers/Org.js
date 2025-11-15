import { v4 as uuidv4 } from "uuid";
import { BlockRepository, DeviceRepository, OrgRepository, UserOrgRepository } from "../models/Models.js";
import { device_Type, roles, roleStatus, USER_DEVICE } from "../utils/constants.js";
import { mqttPublish } from "../utils/mqttPublish.js";
// create org
export const createOrg = async (req, res) => {
  try {
    // get email, orgName , orgDesc ,location 
    console.log("=== CREATE ORG REQUEST ===");
    console.log("Request user:", req.user);
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    
    const {email} = req.user || {};
    const { orgName, orgDesc, location} = req.body;
    
    console.log("Extracted data:", {email, orgName, orgDesc, location});
    
    if(!email || !orgName || !orgDesc || !location){
        console.log("Missing parameters:", {
            email: !!email,
            orgName: !!orgName,
            orgDesc: !!orgDesc,
            location: !!location
        });
        return res.status(404).json({
            success:false,
            message:"Some params missing! "
        })
    }
    
    // generate uniuqe org_id uuid
    const org_id = uuidv4();
    console.log("Org_id : ",org_id)
    // create org
    const newOrg = await OrgRepository.create({
        createdBy:email,
        orgName,
        orgDesc,
        org_id,
        location
    })
    console.log("new org : ",newOrg);
    // create userOrg to add the entry of user and org
    const entryUserOrgRole = await UserOrgRepository.create({
        email,
        org_id,
        orgName,
        role:roles.SUPER_ADMIN,
        status:roleStatus.ACTIVE
    })

    console.log("Entry ",entryUserOrgRole);
    const queryUserOrgTable = await UserOrgRepository.getByField("email",email);
    return res.status(200).json({
      success: true,
      org_id,
      org:newOrg,
      orgs:queryUserOrgTable,
      message: "get all users"
    });
  } catch (error) {
    console.error("Error in get_all_users_of_org-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// update org
export const updateOrg = async (req, res) => {
  try {
    
    return res.status(200).json({
      success: true,
      message: "get all users"
    });
  } catch (error) {
    console.error("Error in get_all_users_of_org-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// deleteOrg
export const deleteOrg = async (req, res) => {
  try {
    
    return res.status(200).json({
      success: true,
      message: "get all users"
    });
  } catch (error) {
    console.error("Error in get_all_users_of_org-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get Single org
export const getSingleOrg = async (req, res) => {
  try {
    
    return res.status(200).json({
      success: true,
      message: "get all users"
    });
  } catch (error) {
    console.error("Error in get_all_users_of_org-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get all user of org
export const getAllUsersForOrg = async (req, res) => {
  try {
    const org_id = req.params.org_id;
    console.log("org id",org_id)
    if(!org_id){
      return res.status(400).json({
      success: false,
      message: "org_id not found!"
    });
  }
    const org = await OrgRepository.getById({ org_id});
    if(!org){
        return res.status(404).json({
          success:false,
          message:"Org not found!"
        })
    }
    const userOfOrgId = await UserOrgRepository.getByField("org_id",org_id);
    console.log("User of org_id: ",userOfOrgId)
    return res.status(200).json({
      success: true,
      users:userOfOrgId,
      message: "get all users"
    });
  } catch (error) {
    console.error("Error in get_all_users_of_org-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GetOrgTopics
 */
export const getOrgTopics = async (req, res) => {
  try {
       const { org_id } = req.params;
    console.log("GET running...")
    if (!org_id) {
      return res.status(400).json({
        success: false,
        message: "org_id is required",
      });
    }

    // 🔍 Get all devices for this org_id
    const devicesOfOrg = await DeviceRepository.getByField("org_id", org_id);
    // console.log("Device of org: ",devicesOfOrg);

    if (!devicesOfOrg || devicesOfOrg.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No devices found for this org",
      });
    }
    const topics = [];
    // const devices = [];
    // const blocks = new Set();
    // Device Id topics
    devicesOfOrg.forEach((device) => {
      let topic = "";
      console.log("TUOE: ",device.device_type,device_Type.SUMP,device.device_Type !== device_Type.SUMP)
      if (device.device_type !== device_Type.SUMP) {
        // blocks.add(device.block_id);
        topic = `flostat/${device.org_id}/command/${device.block_id}/${device.device_type}/${device.device_id}`;
      } else {
        topic = `flostat/${device.org_id}/command/none/${device.device_type}/${device.device_id}`;
      }
      
      topics.push(topic);
      // devices.push({
      //   device_id: device.device_id,
      //   block_id: device.block_id,
      // });
    });
    // Block Id topics
    const blocks = await BlockRepository.getByField("org_id",org_id);

    blocks.forEach((block)=>{
      let topic = `flostat/${block.org_id}/${block.block_id}`;
      topics.push(topic);

    })
    const topic = `flostat/${org_id}`;
    topics.push(topic);
    // console.log("Blocks: ",blocks)
    console.log("Topics: ",topics)
    // console.log("Devices: ",devices)
    return res.status(200).json({
      success: true,
      topics,
      // devices,
      // blocks: [...blocks],
      message: "getOrgTopics",
    });
  } catch (error) {
    console.error("Error in getOrgTopics-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// updateOrgThreshold
export const updateOrgThreshold = async (req, res) => {
  try {
   const {org_id,max_threshold,min_threshold } = req.body;
  
      if(!org_id  || !(min_threshold || max_threshold)){
          return res.status(404).json({
              success:false,
              message:"org_id and (min or max thrush)  required!"
          })
      }
      // device_type
      const device_type = device_Type.TANK;
      // 1️⃣ Get all matching items
      const devices = await DeviceRepository.getByFields({ org_id,device_type });
      console.log("Devices tank: ",devices)
      if (!devices || devices.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No devices found for given org_id and block_id",
        });
      }
      
      // keys for update
      const keys = devices.map((d)=>({
          org_id:d.org_id,
          device_id: d.device_id
      }));
       if(min_threshold && max_threshold && (min_threshold>=max_threshold)){
        return res.status(400).json({
          success: false,
          message: "max_threshold should be greater then min_threshold",
        });
      }
  
     const updatesValues = {};
     if(min_threshold) updatesValues["min_threshold"] = min_threshold;
     if(max_threshold) updatesValues["max_threshold"] = max_threshold;
      // 3️⃣ Batch update all with new threshold
      await DeviceRepository.batchUpdate(keys,updatesValues);

       const devicesUpdate = await DeviceRepository.getByFields({ org_id,device_type });
      //  publish mqtt updated threshold
          // const payload = {
    //   type:"UPDATE_THRESHOLD",
    //   data:{
    //     org_id,
    //     device_id,
    //     threshold
    //   }
    // }
    const updatedDevices = devicesUpdate.map((d)=>({
      org_id,
      device_id:d.device_id,
      min_threshold,
      max_threshold
    }))
    console.log("MQTT payload for Org threshold: ",updatedDevices)
     const topic = `flostat/${org_id}`
     const payload = {
      type:"UPDATE_THRESHOLD",
      data:{
        updatedDevices
      }
     }
     await mqttPublish(topic,payload);
      return res.status(200).json({
        success: true,
        message: "updated updateBlockThreshold",
        updatedDevice: devicesUpdate
      });
  } catch (error) {
    console.error("Error in updateOrgThreshold-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


