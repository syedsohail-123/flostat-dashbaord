import { Router } from "express";
import { deviceReport, tankRelatedReport } from "../controllers/Report.js";
import { IsController, verifyAuth } from "../middlewares/auth.js";

const router = Router();

// tankRelatedReport
router.post("/tankRelatedReport",verifyAuth,IsController, tankRelatedReport)//c
router.post("/deviceReport",verifyAuth,IsController,deviceReport)//c

export default router;