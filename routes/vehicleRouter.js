import { Router } from "express";
import {
  addVehicleData,
  deleteVehicleData,
  getAllVehicleData,
  getSingleVehicleData,
  updateVehicleData,
} from "../controllers/vehicleController.js";

const router = Router();
router.post("/", addVehicleData);
router.get("/", getAllVehicleData);
router.get("/:id", getSingleVehicleData);
router.patch("/:id", updateVehicleData);
router.delete("/:id", deleteVehicleData);
// router.post("/calculate", calculateVehicleEmission);

export default router;
