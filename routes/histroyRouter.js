import express from "express";
import {
  calculateAllEmissions,
  getMonthlyEmissions,
  getMonthlyProgress,
  getMonthlyStats,
  getProgress,
  getWeeklyEmissions,
} from "../controllers/historyController.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";

const router = express.Router();

// POST: calculate all emissions (vehicle, food, energy) in one go
router.post("/calculate", authenticateUser, calculateAllEmissions);
router.get("/weekly", authenticateUser, getWeeklyEmissions);
router.get("/monthly", authenticateUser, getMonthlyEmissions);
router.get("/progress", authenticateUser, getProgress);
router.get("/monthlyProgress", authenticateUser, getMonthlyProgress);
router.get("/monthlyStats", authenticateUser, getMonthlyStats);

export default router;
