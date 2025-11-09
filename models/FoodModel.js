import mongoose, { model, Schema } from "mongoose";

const FoodSchema = new Schema(
  {
    foodProduct: {
      type: String,
      required: true,
    },
    totalEmission: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "kg CO2e / kg",
    },
  },
  { timestamps: true }
);

const Food = model("Food", FoodSchema);
export default Food;
