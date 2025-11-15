import { Router } from "express";
import { deviceCreate, deviceDelete, deviceRegister, deviceUpdate, getBlockValve, getDeviceParents, getDevicesByOrgId, getDevicesWithStatusByOrgId, getPendingDevices, getTanksOfOrg, updateThreshold } from "../controllers/Device.js";
import { IsAdmin, IsController, IsRoot, verifyAuth } from "../middlewares/auth.js";
import { changeMode, createBlock, deleteBlock, getBlockById, getBlockMode, getBlocksOfOrgId, updateBlock, updateBlockThreshold } from "../controllers/Block.js";
import { fcmTest, mqttTest, updateCommandForDeviceState } from "../controllers/dashboard/Dashboard.js";

const router = Router();

router.post("/create",verifyAuth,IsAdmin, deviceCreate)
router.post("/register",verifyAuth,IsAdmin, deviceRegister)//a
router.post("/getOrgDevices",verifyAuth,getDevicesByOrgId)//-
router.post("/getPendingDevices",verifyAuth,IsRoot, getPendingDevices)//r flostat
router.post("/getDeviceParents",getDeviceParents)//g
router.put("/updateDevice",verifyAuth,IsController,deviceUpdate)//c
router.delete("/deleteDevice",verifyAuth,IsAdmin,deviceDelete)//a
// block routes
router.put("/block/updateBlock",verifyAuth,IsAdmin,updateBlock)//a
router.delete("/block/deleteBlock",verifyAuth,IsAdmin,deleteBlock)//a
router.post("/block/createBlock",verifyAuth,IsAdmin,createBlock)//a
router.post("/block/getBlockById",getBlockById)//-
router.post("/block/getBlocksOfOrgId",getBlocksOfOrgId)//-

// ---------------MODE ROUTES ---------------
router.post("/block/getBlockMode",getBlockMode)//-
router.put("/block/changeMode",verifyAuth,IsController,changeMode)//c

router.put("/block/updateBlockThreshold",verifyAuth,IsController,updateBlockThreshold)//c
router.put("/updateThreshold",verifyAuth,IsController,updateThreshold)//c
// --------------- Status
router.get("/getDeviceWithStatus/:org_id",getDevicesWithStatusByOrgId)//-
router.put("/updateDeviceStatus",verifyAuth,IsController,updateCommandForDeviceState)//c
router.post("/getBlockValve",getBlockValve)//-
router.get("/test",mqttTest)
router.get("/fcmtest",fcmTest)
router.post("/getTanksOfOrg",getTanksOfOrg)//-
export default router;