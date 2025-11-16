import { Router } from "express";
import { getAllUser } from "../controllers/userController.js";
import {
  authenticateUser,
  isAdmin,
} from "../middleware/authenticationMiddleware.js";

const router = Router();
router.get("/getUsers", authenticateUser, isAdmin, getAllUser);

export default router;
