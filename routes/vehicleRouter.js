import { Router } from "express";
import {
  addVehicleData,
  deleteVehicleData,
  getAllVehicleData,
  getSingleVehicleData,
  updateVehicleData,
} from "../controllers/vehicleController.js";
import {
  authenticateUser,
  isAdmin,
} from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/", authenticateUser, isAdmin, addVehicleData);
router.get("/", authenticateUser, getAllVehicleData);
router.get("/:id", authenticateUser, getSingleVehicleData);
router.patch("/:id", authenticateUser, isAdmin, updateVehicleData);
router.delete("/:id", authenticateUser, isAdmin, deleteVehicleData);

export default router;
