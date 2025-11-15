
import { v4 as uuidv4 } from "uuid";
import { CustomerQueryRepository } from "../models/Models.js";
import { QUREY_STATUS, USER_TYPE } from "../utils/constants.js";
import { upload, uploadFileToS3 } from "../utils/uploadImage.js";
import { queryAcknowledgmentEmail } from "../mails/mails.js";
import mailSender from "../utils/mailSender.js";

export const createQuery = async (req, res) => {
  upload.single("attachment")(req, res, async (err) => {
    try {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ success: false, message: "File upload failed", error: err.message });
      }

      const { org_id, description, queryType } = req.body;
      const { email } = req.user;

      if (!description || !org_id || !queryType) {
        return res.status(400).json({ success: false, message: "Missing params!" });
      }
      console.log("File: ",req.file)
      // ✅ Optional file upload
      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = await uploadFileToS3(req.file);
      }

      const query_id = uuidv4();
      await CustomerQueryRepository.create({
        query_id,
        org_id,
        created_by: email,
        created_at: new Date().toISOString(),
        queryType,
        description,
        attachment: attachmentUrl,
        status: QUREY_STATUS.ACTIVE,
      });
      // add the desc to message
      await CustomerQueryRepository.appendToListField({org_id,query_id},"messages",{
      timestamp:new Date().toISOString(),
      user:email,
      userType:USER_TYPE.CUSTOMER,
      message:description
    })
      // add customer message for flostat
     const queryEntry = await CustomerQueryRepository.appendToListField({org_id,query_id},"messages",{
      timestamp:new Date().toISOString(),
      user:process.env.MAIL_USER,
      userType:USER_TYPE.FLOSTAT,
      message:"Thanks for reaching out to us, our executive will get back to you within 24 hours"
    })
      // send the mail 
      const title = `[Support] We’ve received your query — Reference ID: ${query_id}`;
      const body = queryAcknowledgmentEmail(email,query_id,queryType,description,attachmentUrl);
      await mailSender(email,title,body);
      // console.log("Mail send")
      return res.status(201).json({
        success: true,
        message: "Successfully created query",
        customerQuery: queryEntry,
      });
    } catch (error) {
      console.error("Error in createQuery:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  });
};

// export const createQuery = async (req, res) => {
//   try {
//     const {attachement,org_id,description,queryType} = req.body;
//     const { email} = req.user;
//     if(!description || !org_id || !queryType) return res.status(400).json({
//         success:false,
//         message:"Missing params!"
//     })
//     // attachement part is pending...
//     if(attachement){

//     }
//     const query_id = uuidv4();
//     const queryEntry = await CustomerQueryRepository.create({
//       query_id,
//       org_id,
//       created_by:email,
//       created_at: new Date().toISOString(),
//       queryType,
//       description,
//       status:QUREY_STATUS.ACTIVE
//     })
//     return res.status(201).json({
//       success: true,
//       message: "successfully createQuery",
//       customerQuery:queryEntry
//     });
//   } catch (error) {
//     console.error("Error in createQuery-b:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


// updateQuery
export const updateQuery = async (req, res) => {
  try {
    const { query_id,org_id,status} = req.body;
    const { email} = req.user;
    if(!email || !query_id || !org_id || !status) return res.status(400).json({
        success:false,
        message:"missing params!"
    })
    const query = await CustomerQueryRepository.getById({org_id,query_id});
    if(!query){
      return res.status(400).json({
        success:false,
        message:"Customer query Not exists!"
    })
    }
    const updateStatus = await CustomerQueryRepository.update({
      query_id,org_id
    },{
      status,
      updated_by:email,
      updated_at: new Date().toISOString()
    })
   
    return res.status(200).json({
      success: true,
      customerQuery:updateStatus,
      message: "successfully updateQuery"
    });
  } catch (error) {
    console.error("Error in updateQuery-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// deleteQuery
export const deleteQuery = async (req, res) => {
  try {
    const { query_id,org_id} = req.body;
    const { email} = req.user;
    if(!query_id || !org_id ) return res.status(400).json({
        success:false,
        message:"missing params !"
    })
   
    const query = await CustomerQueryRepository.getById({org_id,query_id});
    if(!query){
      return res.status(400).json({
        success:false,
        message:"Customer query Not exists!"
    })
    }
    await CustomerQueryRepository.remove({query_id,org_id});
    return res.status(200).json({
      success: true,
      message: "successfully deleteQuery"
    });
  } catch (error) {
    console.error("Error in deleteQuery-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// getQuery
export const getQuery = async (req, res) => {
  try {
    const { email} = req.user;
    if(!email) return res.status(400).json({
        success:false,
        message:"email not their token missing or expire!"
    })
 
    return res.status(200).json({
      success: true,
      message: "successfully getQuery"
    });
  } catch (error) {
    console.error("Error in getQuery-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// getAllOrgQuery
export const getAllOrgQuery = async (req, res) => {
  try {
    const { email} = req.user;
     const { org_id} = req.body;
    if(!org_id) return res.status(400).json({
        success:false,
        message:"org_id is missing!"
    })
    // query to customer table
    const orgCustomerQuery = await CustomerQueryRepository.getByField("org_id",org_id);
    console.log("Org customer query: ",orgCustomerQuery);
    return res.status(200).json({
      success: true,
      message: "successfully getAllOrgQuery",
      customerQuerys:orgCustomerQuery
    });
  } catch (error) {
    console.error("Error in getAllOrgQuery-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// customerSupportChat
export const customerSupportChat = async (req, res) => {
  try {
    const { org_id,query_id,message,userType,attachement} = req.body;
    const { email} = req.user;
    if(!org_id || !query_id || !message) return res.status(400).json({
        success:false,
        message:"some params missing!"
    })
  
    // store the chat
    const chats = await CustomerQueryRepository.appendToListField({org_id,query_id},"messages",{
      timestamp:new Date().toISOString(),
      user:email,
      userType:userType ?userType:USER_TYPE.CUSTOMER,
      message
    })
   
    return res.status(200).json({
      success: true,
      message: "successfully customerSupportChat",
      chats
    });
  } catch (error) {
    console.error("Error in customerSupportChat-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
