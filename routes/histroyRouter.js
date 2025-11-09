import express from "express";
import { calculateAllEmissions } from "../controllers/historyController.js";

const router = express.Router();

// POST: calculate all emissions (vehicle, food, energy) in one go
router.post("/calculate", calculateAllEmissions);

export default router;
