import { Router } from "express";
import {
  getPatents,
  registerPatent,
  licensePatent,
} from "../controllers/researchPatentController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Publicly browse and filter campus research patents
router.get("/campus/patents", getPatents);

// Register a new university patent / IP asset
router.post("/campus/patents", authMiddleware, registerPatent);

// License a patent to a commercial partner
router.post("/campus/patents/:id/license", authMiddleware, licensePatent);

export default router;
