import { Router } from "express";
import {
  getEndowments,
  createEndowment,
  contributeToEndowment,
} from "../controllers/alumniEndowmentController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Publicly browse and filter campus alumni endowment funds
router.get("/campus/endowments", getEndowments);

// Create new endowment fund (authenticated campus representative/alumni)
router.post("/campus/endowments", authMiddleware, createEndowment);

// Contribute to an existing endowment fund
router.post("/campus/endowments/:id/contribute", authMiddleware, contributeToEndowment);

export default router;
