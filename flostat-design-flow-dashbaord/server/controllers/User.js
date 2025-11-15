import { OrgRepository, UserOrgRepository, UserRepository } from "../models/Models.js";
import { v4 as uuidv4 } from "uuid";
import { roles, roleStatus, USER_DEVICE } from "../utils/constants.js";

// get_all_orgs_of_user
export const getAllOrgsOfUser = async (req, res) => {
  try {
    const { email} = req.user;
    if(!email) return res.status(400).json({
        success:false,
        message:"email not their token missing or expire!"
    })
    
    const queryUserOrgTable = await UserOrgRepository.getByField("email",email);
    console.log("ALL ORGS: ",queryUserOrgTable)
    return res.status(200).json({
      success: true,
      orgs:queryUserOrgTable,
      message: "get all orgs"
    });
  } catch (error) {
    console.error("Error in get_all_orgs_of_user-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// invite user
export const inviteUser = async (req, res) => {
  try {
    const { email, org_id,role} = req.body;
    if( !email || !org_id || !role){
       return res.status(400).json({
        success:false,
        message:"params missing!"
    })
    }
    const existingUser = await UserRepository.getById({email});
    console.log("User: ",existingUser)
    if(!existingUser){
       return res.status(400).json({
        success:false,
        message:"User does Not exist!"
    })
    }
    const org = await OrgRepository.getById({org_id});
    if(!org){
      return res.status(400).json({
        success:false,
        message:"Org does Not exist!"
    })
    }
    const userInOrg = await UserOrgRepository.getById({email,org_id});
    console.log("Userin org: ",userInOrg);

    if(userInOrg){
      return res.status(404).json({
        success:false,
        message:"User Already in  org"
      })
    }
    let items = {
            email,
            org_id,
            orgName:org?.orgName,
            role,
            
            status:roleStatus.PENDING
        };
      if(existingUser?.mobile_fcm){
        items["mobile_fcm"] = existingUser.mobile_fcm;
      }
      if(existingUser?.laptop_fcm) items["laptop_fcm"] = existingUser.laptop_fcm;
      if(existingUser?.desktop_fcm) items["desktop_fcm"] = existingUser.desktop_fcm;
    const entryUserOrgRole = await UserOrgRepository.create(items)

    console.log("ALL ORGS: ",entryUserOrgRole)
    const queryUserOrgTable = await UserOrgRepository.getByField("org_id",org_id);
    console.log("ALL Users: ",queryUserOrgTable)
    return res.status(200).json({
      success: true,
      users:queryUserOrgTable,
      message: "get all orgs"
    });
  } catch (error) {
    console.error("Error in get_all_orgs_of_user-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// accepte invitation

export const acceptInvite = async (req, res) => {
  try {
    const { email} = req.user;
    const {org_id}  = req.body;
    if( !org_id){
       return res.status(400).json({
        success:false,
        message:"params missing!"
    })
    }
    
    // const org = await OrgRepository.getById({org_id});
    // if(!org){
    //   return res.status(400).json({
    //     success:false,
    //     message:"Org does Not exist!"
    // })
    // }

    const updateInvite = await UserOrgRepository.update({email, org_id},{
      status:roleStatus.ACTIVE
    })
    console.log("Role update: ",updateInvite);
    const queryUserOrgTable = await UserOrgRepository.getByField("email",email);
    console.log("ALL ORGS: ",queryUserOrgTable)
    return res.status(200).json({
      success: true,
      orgs:queryUserOrgTable,
      message: "get all orgs"
    });
  } catch (error) {
    console.error("Error in get_all_orgs_of_user-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// updateAccess
export const updateAccess = async (req,res)=>{
  try {
    // role change 
    const {email,role,org_id} = req.body;
    if(!email || !role || !org_id){
      return res.status(404).json({
        success:false,
        message:"Some params missing"
      })
    }

   
    const userInOrg = await UserOrgRepository.getById({email,org_id});
    console.log("Userin org: ",userInOrg);

    if(!userInOrg){
      return res.status(404).json({
        success:false,
        message:"No user in this org"
      })
    }
     if(userInOrg.role===roles.SUPER_ADMIN){
       return res.status(400).json({
        success:false,
        message:"You can't update root user"
       })
    }

    await UserOrgRepository.update({email,org_id},{role});

    const users  = await UserOrgRepository.getByField("org_id",org_id);

    return res.status(200).json({
      success:true,
      message:"Role Update",
      users
    })


    
  } catch (error) {
     console.error("Error in get_all_orgs_of_user-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

//  removeUser
export const removeUser = async (req,res)=>{
  try {
    const {email,org_id,role} = req.body;

    if(!email || !org_id || !role){
      return res.status(404).json({
        success:false,
        message:"Some params missing"
      })
    }
    if(role===roles.SUPER_ADMIN){
       return res.status(400).json({
        success:false,
        message:"You can't remove root user"
       })
    }
    const userInOrg = await UserOrgRepository.getById({email,org_id});
    console.log("Userin org: ",userInOrg);
    if(!userInOrg){
      return res.status(404).json({
        success:false,
        message:"No user in this org"
      })
    }

    await UserOrgRepository.remove({email,org_id});

    const users = await UserOrgRepository.getByField("org_id",org_id);
    return res.status(200).json({
      success:true,
      message:"Removed user "+email,
      users
    })

  } catch (error) {
     console.error("Error in deleteUser-b:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export const registerFcm = async (req, res) => {
  try {
        const { user_device, fcm_token} = req.body;
      const { email} = req.user;
    console.log("Email: ",email);
    if (!fcm_token || !user_device) {
      return res.status(400).json({
        success: false,
        message: "Missing params!",
      });
    }

    // check for org_id
    const user = await UserRepository.getById({email});

    if(!user){
      return res.status(400).json({
        success: false,
        message: "user is not found!",
      });
    }
    if(user?.mobile_fcm || user?.laptop_fcm){
      // on of the token exist
      if(user_device === USER_DEVICE.LAPTOP && user?.laptop_fcm ){
        // check for fcm match
        if(user.laptop_fcm===fcm_token){
           return res.status(200).json({
             success:true,
             message:"Laptop token matched, no need to update fcm"
           })
        }
      }
      if(user_device === USER_DEVICE.MOBILE && user?.mobile_fcm){
         // check for fcm match
        if(user.mobile_fcm===fcm_token){
           return res.status(200).json({
             success:true,
             message:"Mobile token matched, no need to update fcm"
           })
        }
      }

      if(user_device === USER_DEVICE.DESKTOP && user?.desktop_fcm){
         // check for fcm match
        if(user.desktop_fcm===fcm_token){
           return res.status(200).json({
             success:true,
             message:"Destop token matched, no need to update fcm"
           })
        }
      }
    }
    // now in this condition either fcm token not found or expire(meant's token missmatch)
    let items = {};
    if(user_device===USER_DEVICE.MOBILE){
       items["mobile_fcm"] = fcm_token;
    }
    if(user_device===USER_DEVICE.LAPTOP){
       items["laptop_fcm"] = fcm_token;
    }
    if(user_device===USER_DEVICE.DESKTOP){
       items["destop_fcm"] = fcm_token;
    }
    
    console.log("Items to update: ",items);
    // update the token in user
    const updatedUser = await UserRepository.update({email},items);
    console.log("Updated user: ",updatedUser)
    // also you need to updated this token in all the userOrgRole 
    // get all the userorg
    const userOrgs = await UserOrgRepository.getByField("email",email);
    // loop to update items in them
    for(const userOrg of userOrgs){
      await UserOrgRepository.update({email:userOrg.email,org_id:userOrg.org_id},items)
    }
    return res.status(200).json({
      success: true,
      message: "register or update fcm token with orgRole fcm updated",
      updatedUser
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
