import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../error/customErrors.js";
import { UnauthenticatedError } from "../error/customErrors.js";

export const authenticateUser = (req, res, next) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
    console.log("Cookies received:", req.cookies);

  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      _id: payload._id,
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (err) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

export const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new UnauthorizedError("Access Denied");
  }
};
