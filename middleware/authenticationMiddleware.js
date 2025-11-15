import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../error/customErrors.js";
import { UnauthenticatedError } from "../error/customErrors.js";

export const authenticateUser = (req, res, next) => {
  let token;

  // 1️⃣ Try to get token from cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2️⃣ If not in cookie, try Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  try {
    // 3️⃣ Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId }; // attach userId to request
    next();
  } catch (err) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};
