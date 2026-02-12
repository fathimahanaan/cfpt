import { Router } from "express";
import {
  addVehicleData,
 
  getAllVehicleData,
  getSingleVehicleData,
  getVehicleOptions,
 
} from "../controllers/vehicleController.js";
import {
  authenticateUser,
  isAdmin,
} from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/", authenticateUser, isAdmin, addVehicleData);
router.get("/", authenticateUser, getAllVehicleData);
router.get("/option",authenticateUser,getVehicleOptions)
router.get("/:id", authenticateUser, getSingleVehicleData);
 

export default router;
