import { Router } from "express";
import { joinWaitlist, getWaitlist } from "../controllers/waitlistController.js";

const router = Router();

router.post("/", joinWaitlist);
router.get("/", getWaitlist); // simple admin view — add auth later if needed

export default router;
