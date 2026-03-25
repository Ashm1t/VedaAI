import { Router } from "express";
import { googleLogin, getMe, approveUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public
router.post("/google", googleLogin);

// Protected
router.get("/me", requireAuth, getMe);
router.post("/approve", requireAuth, approveUser);

export default router;
