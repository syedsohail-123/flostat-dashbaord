import { BlockRepository, DeviceRepository } from "../models/Models.js";
import { v4 as uuidv4 } from "uuid";
import { device_Type, MODE } from "../utils/constants.js";
import { mqttPublish } from "../utils/mqttPublish.js";
// get block by org_id
export const getBlocksOfOrgId = async(req,res)=>{
    try {
        const { org_id} = req.body;
        if(!org_id){
            return res.status(400).json({
            success:false,
            message:" Org id is missing!"
        })
        }
        const blocks = await BlockRepository.getByField("org_id",org_id);

         return res.status(200).json({
            success:true,
            message: "get Block",
            blocks
        })

    } catch (error) {
        console.error("Error in getBlockByorg-b: ",error);
        return res.status(400).json({
            success:false,
            message:error
        })
    }
}
// create block
export const createBlock = async(req,res)=>{
    try {
        const {org_id, block_name} = req.body;

        if(!org_id || !block_name){
            return res.status(400).json({
            success:false,
            message:"Block params missing!"
        })
        }
        const block_id = uuidv4()
        const blockCreate = await BlockRepository.create({
            org_id,
            block_id,
            block_name
        })


        return res.status(200).json({
            success:true,
            message: "Block created",
            block:blockCreate
        })
    } catch (error) {
        console.error("Error in createBlock-b: ",error);
        return res.status(400).json({
            success:false,
            message:error
        })
    }
}
// update block
export const updateBlock = async(req,res)=>{
    try {
        const { block_id,org_id, block_name} = req.body;

        if(!block_id || !org_id || !block_name){
            return res.status(400).json({
            success:false,
            message:"Block params missing!"
        })
        }

        const updateBlockName = await BlockRepository.update({block_id,org_id},{
            block_name
        })

        return res.status(200).json({
            success:true,
            message: "Block name updated",
            block:updateBlockName
        })
    } catch (error) {
        console.error("Error in updateBlock-b: ",error);
        return res.status(400).json({
            success:false,
            message:error
        })
    }
}
// get block by block id
export const getBlockById = async(req,res)=>{
    try {
        const { block_id} = req.body;

        if(!block_id){
            return res.status(400).json({
                success:false,
                message:"Block Id is required!"
            })
        }
        const block = await BlockRepository.getByField("block_id",block_id);

        return res.status(200).json({
            success:true,
            message: "Block",
            block
        })
        
    } catch (error) {
        console.error("Error in getBlockById-b: ",error);
        return res.status(400).json({
            success:false,
            message:error
        })
    }
}
// delte block
export const deleteBlock = (req,res)=>{
    try {
        const { block_id} = req.body;

        if(!block_id){
            return res.status(400).json({
                success:false,
                message:"Block Id is required!"
            })
        }
        // delete the block by id
        // return 
        
    } catch (error) {
        console.error("Error in deleteBlock-b: ",error);
        return res.status(400).json({
            success:false,
            message:error
        })
    }
}

// --------------MODE CONTROLLER ----------------------------

// get mode
export const getBlockMode = async(req,res)=>{
    console.log("Get block Mode")
    try {
        const { block_id,org_id} = req.body;

        if(!block_id || !org_id){
            return res.status(400).json({
                success:false,
                message:"Block_id and org_id is required!"
            })
        }
        const block = await BlockRepository.getById({block_id,org_id});
        console.log("Block : ",block);
        // by default Manual Mode
        return res.status(200).json({
            success:true,
            message: "Block",
            block,
            blockMode:block.mode?block.mode:MODE.MANUAL
        })
        
    } catch (error) {
        console.error("Error in getBlockMode-b: ",error);
        return res.status(400).json({
            success:false,
            message:error
        })
    }
}
// change mode
export const changeMode = async(req,res)=>{
     console.log("Get block Mode")
    try {
        const {org_id, block_id,mode} = req.body;
        const {email} = req.user;

        if(!block_id || !org_id){
            return res.status(400).json({
                success:false,
                message:"Block_id or org_id  is missing!"
            })
        }
        if(!mode || (MODE.AUTO !==mode &&  MODE.MANUAL!==mode)){
            return res.status(400).json({
                success:false,
                message:"Mode only auto or manual"
            })
        }
        
        // update
        const block = await BlockRepository.update({
            org_id,block_id
        },{
            mode,
            mode_updated_at: new Date().toISOString()
        })
         const payload = {
            type: "BLOCK_MODE_UPDATE",
            data: block,
            updated_by: email || "system",
        };
        
        let topic = `flostat/${block.org_id}/${block.block_id}`;
        await mqttPublish(topic,payload)
        console.log("Block : ",block)

        return res.status(200).json({
            success:true,
            message: "Block",
            block,
            blockMode:block.mode
        })
        
    } catch (error) {
        console.error("Error in changeMode-b: ",error);
        return res.status(400).json({
            success:false,
            message:error
        })
    }
}


// updateBlockThreshold
export const updateBlockThreshold = async (req, res) => {
  try {
    const {org_id,block_id,max_threshold,min_threshold } = req.body;

    if(!org_id || !block_id || !(min_threshold || max_threshold)){
        return res.status(404).json({
            success:false,
            message:"org_id and block_id and (min or max thrush)  required!"
        })
    }
    // device_type
    const device_type = device_Type.TANK;
    // 1️⃣ Get all matching items
    const devices = await DeviceRepository.getByFields({ org_id, block_id,device_type });
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
     const devicesUpdate = await DeviceRepository.getByFields({ org_id, block_id,device_type });

     const updatedDevices = devicesUpdate.map((d)=>({
      org_id,
      device_id:d.device_id,
      min_threshold,
      max_threshold
    }))
    console.log("MQTT payload for Org threshold: ",updatedDevices)
     const topic = `flostat/${org_id}/${block_id}`
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
    console.error("Error in updateBlockThreshold-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


