import express from "express";
import { getNewsHistory } from "../controllers/newsController.js";

const router = express.Router();

router.get("/", getNewsHistory);

export default router;
