import { Router } from "express";
import {
  getCheckIns,
  createCheckIn,
  updateCheckInSession,
} from "../controllers/mentalWellnessController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Retrieve and filter student wellness check-in sessions
router.get("/campus/wellness/checkins", authMiddleware, getCheckIns);

// Student creates a new mental wellness check-in
router.post("/campus/wellness/checkins", authMiddleware, createCheckIn);

// Campus counselor updates check-in status or schedules therapy
router.patch("/campus/wellness/checkins/:id", authMiddleware, updateCheckInSession);

export default router;
