import { Router } from "express";
import {
  addResources,
  deleteResources,
  getAllResources,
  getSingleResources,
  updateResource,
} from "../controllers/resourcesController.js";
import { authenticateUser, isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/", authenticateUser, isAdmin, addResources);
router.get("/", authenticateUser, getAllResources);
router.get("/:id", authenticateUser, getSingleResources);
router.patch("/:id", authenticateUser, isAdmin, updateResource);
router.delete("/:id", authenticateUser, isAdmin, deleteResources);

export default router;
