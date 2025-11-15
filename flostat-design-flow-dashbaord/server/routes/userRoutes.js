import { Router } from "express";
import { IsAdmin, verifyAuth } from "../middlewares/auth.js";
import { acceptInvite, getAllOrgsOfUser, inviteUser, registerFcm, removeUser, updateAccess } from "../controllers/User.js";
import { createQuery, customerSupportChat, deleteQuery, getAllOrgQuery, getQuery, updateQuery } from "../controllers/CustomerSupport.js";
import multer from "multer";
const router = Router();
const upload = multer(); // memory storage
router.get("/getOrgsUser",verifyAuth,getAllOrgsOfUser)//-

// add middler var for root & admin only
router.post("/inviteUser",verifyAuth,IsAdmin, inviteUser)//a
//  remove user
router.delete("/removeUser",verifyAuth,IsAdmin,removeUser)//a
// update access
router.put("/updateAccess",verifyAuth,IsAdmin,updateAccess)//a
// accept invite
router.put("/acceptInvite",verifyAuth,acceptInvite)//-
// register-fcm
router.post("/register-fcm",verifyAuth,registerFcm)//-
// ------------Customer support----------------------
// createQuery
router.post("/createQuery",verifyAuth,IsAdmin,createQuery);//a
// updateQuery
router.put("/updateQuery",verifyAuth,IsAdmin,updateQuery);//a
// deleteQuery
router.delete("/deleteQuery",verifyAuth,IsAdmin,deleteQuery)//a
// getQuery
router.post("/getQuery",verifyAuth,getQuery)//-
// getAllOrgQuery
router.post("/getAllOrgQuery",verifyAuth,getAllOrgQuery);//-
// customerSupportChat
router.post("/customerSupportChat",verifyAuth,IsAdmin,customerSupportChat)//a
export default router;