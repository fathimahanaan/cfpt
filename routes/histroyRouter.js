import express, { Router } from "express";
import {
  calculateAllEmissions,
  deleteHistory,
  getHistory,
  getMonthlyEmissions,
  getMonthlyStats,
  getProgress,
  getWeeklyEmissions,
} from "../controllers/historyController.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import { validateCalculateEmissionsInput } from "../middleware/validationMiddleware.js";

const router = Router();

// POST: calculate all emissions (vehicle, food, energy) in one go
router.post("/calculate", authenticateUser, validateCalculateEmissionsInput, calculateAllEmissions);
router.get("/weekly", authenticateUser, getWeeklyEmissions);
router.get("/monthly", authenticateUser, getMonthlyEmissions);
router.get("/progress", authenticateUser, getProgress);
router.get("/monthlyStats", authenticateUser, getMonthlyStats);
router.get("/viewHistory", authenticateUser, getHistory);
 
router.delete("/deleteHistory/:id", authenticateUser, deleteHistory);

export default router;
