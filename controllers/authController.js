import { NotFoundError } from "../error/customErrors.js";
import User from "../models/UserModel.js";
import { v4 as uuidv4 } from "uuid";
import { createJWT } from "../utils/jwtUtils.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { getRandomName } from "../utils/funnyNames.js";

export const registerUser = async (req, res) => {
  const { password } = req.body;
  if (!password) throw new BadRequestError("Password is required");

  const hashedPassword = await hashPassword(password);

  // create uuid
  const userId = uuidv4();

  const newUser = new User({
    userId,
    password: hashedPassword,
    name: getRandomName(),
  });

  await newUser.save();

  // create jwt
  const token = createJWT({
    userId: newUser.userId,
    _id: newUser._id,
    role: newUser.role || "user",
  });
  const tenDays = 1000 * 60 * 60 * 24 * 10;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDays),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(201).json({
    message: "User created successfully",
    userId: newUser.userId,
    name: newUser.name,
    token,
  });
};
export const loginUser = async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password)
    throw new BadRequestError("userId and password required");

  const user = await User.findOne({ userId });
  if (!user) throw new NotFoundError("User not found");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new BadRequestError("Invalid credentials");

  const token = createJWT({
    userId: user.userId,
    _id: user._id,
    role: user.role,
  });
  const tenDays = 1000 * 60 * 60 * 24 * 10;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDays),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

res.status(200).json({
  message: "Login successful",
  user: {
    userId: user.userId,
    name: user.name,
    role: user.role,
  },
});
};

// ------------------ LOGOUT ------------------
export const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({ message: "Logged out successfully" });
};
