import express, { Router } from "express";
import {
  calculateAllEmissions,
  deleteHistory,
  getDailyEmission,
 
  getDailyPrediction,
  getHistory,
  getWeeklyEmissions,
} from "../controllers/historyController.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import { validateCalculateEmissionsInput } from "../middleware/validationMiddleware.js";

const router = Router();

// POST: calculate all emissions (vehicle, food, energy) in one go
router.post(
  "/calculate",
  authenticateUser,
  validateCalculateEmissionsInput,
  calculateAllEmissions,
);
router.get("/weekly", authenticateUser, getWeeklyEmissions);
router.get("/dailyEmission", authenticateUser, getDailyEmission);
router.get("/viewHistory", authenticateUser, getHistory);
router.get("/dailyPrediction", authenticateUser, getDailyPrediction);
router.delete("/deleteHistory/:id", authenticateUser, deleteHistory);

export default router;
