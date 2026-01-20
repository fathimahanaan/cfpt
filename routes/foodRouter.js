import { Router } from "express";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import { getAllFoodData, getFoodOptions } from "../controllers/foodController.js";

const router = Router();
router.get("/", authenticateUser, getAllFoodData);
router.get("/options", authenticateUser, getFoodOptions);
export default router;
