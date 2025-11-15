import { Router } from "express";

import { googleOuth, login, sendOtp, signUp, verifyOtp } from "../controllers/Auth.js";


const router = Router()
router.post("/sendOtp",sendOtp)
router.post("/verifyOtp",verifyOtp)
router.post("/signUp",signUp)
router.post("/login",login)
router.post("/googleOuth",googleOuth)
export default router;