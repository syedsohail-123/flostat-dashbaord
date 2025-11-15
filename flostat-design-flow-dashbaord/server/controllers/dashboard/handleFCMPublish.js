import { UserOrgRepository } from "../../models/Models.js";
import { sendNotification } from "../../utils/fcm.js"

export const fcmPublishNotification = async(org_id,title,body,payload)=>{
    try {
        const fcmTokens =await getFCMTopics(org_id);
        /**
         * Title - HIGH/LOW water level in Tankname | device name  + status 
         * Body - Water level is water level %
         */
        const fcmSendNotification = fcmTokens.map(token=>
            sendNotification(
                token,
                title,
                body,   
                payload.data
            )
        )
        await Promise.all(fcmSendNotification)
         console.log("✅ Notifications sent successfully!");
    } catch (error) {
        console.error("Error in fcmPublishNotification: ",error)
    }
}
export const getFCMTopics = async (org_id)=>{
  const usersOfOrg = await UserOrgRepository.getByField("org_id",org_id);
//   console.log("Users of the org_id: ",usersOfOrg);
  // mobile_fcm and desktop_fcm
  let fcmTopics = [];
  for(let user of usersOfOrg){
    if(user?.mobile_fcm){
      fcmTopics.push(user.mobile_fcm);
    }
    if(user?.desktop_fcm){
      fcmTopics.push(user.desktop_fcm);
    }
    if(user?.laptop_fcm){
      fcmTopics.push(user.laptop_fcm);
    }
  }
  console.log("GET FCM finshied!",fcmTopics)
  return fcmTopics;
}
