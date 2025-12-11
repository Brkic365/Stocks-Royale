import express from "express";
import { placeBet, getActiveBets } from "../controllers/betController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, placeBet);
router.get("/", authenticateToken, getActiveBets);

export default router;
