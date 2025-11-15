import { Router } from "express";
import { createOrg, deleteOrg, getAllUsersForOrg, getOrgTopics, getSingleOrg, updateOrg, updateOrgThreshold } from "../controllers/Org.js";
import { IsController, IsRoot, verifyAuth } from "../middlewares/auth.js";
import { getLogs } from "../controllers/Logs.js";
import { createSchedule, deleteSchedule, getScheduleById, getScheduleByOrgId, updateSchedule } from "../controllers/Scheduler.js";

const router = Router();

// create org
router.post("/", verifyAuth,createOrg)// any
router.get("/:org_id",getSingleOrg)//-
router.put("/",verifyAuth,IsRoot, updateOrg)//r
router.delete("/deleteOrg",verifyAuth,IsRoot,deleteOrg)//r 
// add verify auth and root or admin permit 
router.get('/:org_id/users', verifyAuth,getAllUsersForOrg);//-

// logs 
router.post("/logs",getLogs)//-
// get org topics
router.get("/:org_id/getOrgTopics",getOrgTopics)//-


// ---------------Threshold ----------------------
router.put("/updateOrgThreshold",verifyAuth,IsController, updateOrgThreshold)//c
// ---------------SCHEDULES----------------------
router.post("/createSchedule",verifyAuth,IsController,createSchedule)//c
// updateSchedule
router.put("/updateSchedule",verifyAuth,IsController,updateSchedule)//c
// deleteSchedule
router.delete("/deleteSchedule",verifyAuth,IsController,deleteSchedule)//c
// getScheduleById
router.post("/getScheduleById",getScheduleById)
// getScheduleByOrgId
router.post("/getScheduleByOrgId",getScheduleByOrgId)


export default router;