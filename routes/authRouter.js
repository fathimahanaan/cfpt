import { Router } from "express";
import {
  loginUser,
  logout,
  registerUser,
} from "../controllers/authController.js";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/register",  registerUser);
router.post("/login", validateLoginInput, loginUser);
router.post("/logout", logout);

export default router;

// {
//   "userId": "d3edc871-f5c8-4df3-8b44-049d9b353b14",
//   "password": "password"
// }
