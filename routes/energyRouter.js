import { Router } from "express";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import { getAllEnergyData, getEnergyOptions } from "../controllers/energyController.js";

const router = Router();
router.get("/", authenticateUser, getAllEnergyData);
router.get("/options",authenticateUser,getEnergyOptions);
export default router;
