import mongoose, { Schema, model } from "mongoose";

const VehicleSchema = new Schema(
  {
    activity: {
      type: String,
      required: true,
    }, // e.g., "Cars (by market segment)"
    type: {
      type: String,
      required: true,
    }, // e.g., "Mini", "Supermini", "Small"
    unit: {
      type: String,
      required: true,
    }, // e.g., "km" or "miles"
    fuel: {
      type: String,
      required: true,
    }, // e.g., "Petrol", "Diesel"
    kgCO2e: { type: Number, required: true }, // e.g., 0.10996
  },
  { timestamps: true }
);

const Vehicle = model("Vehicle", VehicleSchema);

export default Vehicle;
