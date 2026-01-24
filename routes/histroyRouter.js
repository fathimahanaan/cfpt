import express, { Router } from "express";
import {
  calculateAllEmissions,
  deleteHistory,
  getHistory,
  getMonthlyEmissions,
  getMonthlyProgress,
  getMonthlyStats,
  getProgress,
  getWeeklyEmissions,
} from "../controllers/historyController.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";

const router = Router();

// POST: calculate all emissions (vehicle, food, energy) in one go
router.post("/calculate", authenticateUser, calculateAllEmissions);
router.get("/weekly", authenticateUser, getWeeklyEmissions);
router.get("/monthly", authenticateUser, getMonthlyEmissions);
router.get("/progress", authenticateUser, getProgress);
router.get("/monthlyProgress", authenticateUser, getMonthlyProgress);
router.get("/monthlyStats", authenticateUser, getMonthlyStats);
router.get("/viewHistory", authenticateUser, getHistory);

// 🔥 FIXED DELETE ROUTE
router.delete("/deleteHistory/:id", authenticateUser, deleteHistory);

export default router;
