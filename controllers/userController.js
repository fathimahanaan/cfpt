import User from "../models/UserModel.js";

export const createUser = async (req, res) => {
  const { name } = req.body;
  const newUser = await User.create({
    name,
    totalEmission: 0,
    categoryEmission: { food: 0, energy: 0, water: 0, transport: 0 },
  });
  res.status(201).json({ message: "User created", user: newUser });
};
