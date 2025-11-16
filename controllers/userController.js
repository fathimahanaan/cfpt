import { NotFoundError } from "../error/customErrors.js";
import User from "../models/UserModel.js";

export const getAllUser = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  if (!users) throw new NotFoundError("user not found");
  res.status(200).json(users);
};
