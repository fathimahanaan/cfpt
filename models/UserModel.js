import mongoose, { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    }, // UUID
    name: { type: String, default: "Anonymous Carbon Hero" },
    password: {
      type: String,
      required: true,
    }, // hashed password
    totalEmission: {
      type: Number,
      default: 0,
    }, // total across all categories
    categoryEmission: {
      food: {
        type: Number,
        default: 0,
      },
      energy: {
        type: Number,
        default: 0,
      },
      water: {
        type: Number,
        default: 0,
      },
      transport: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const User = model("User", UserSchema);
export default User;
