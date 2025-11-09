import mongoose, { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    totalEmission: { type: Number, default: 0 }, // total across all categories
    categoryEmission: {
      food: { type: Number, default: 0 },
      energy: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
    },
    token: { type: String },
  },
  { timestamps: true }
);

const User = model("User", UserSchema);
export default User;
