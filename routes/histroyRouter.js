import express from "express";
import { calculateAllEmissions } from "../controllers/historyController.js";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";

const router = express.Router();

// POST: calculate all emissions (vehicle, food, energy) in one go
router.post("/calculate", authenticateUser, calculateAllEmissions);

export default router;
