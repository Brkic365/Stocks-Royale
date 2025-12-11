import express from "express";
import { openPosition, getMyPositions, closePosition, coinflipPosition } from "../controllers/positionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All position routes require authentication
router.post("/", authenticateToken, openPosition);
router.get("/", authenticateToken, getMyPositions);
router.post("/:id/close", authenticateToken, closePosition);
router.post("/:id/coinflip", authenticateToken, coinflipPosition);

export default router;
