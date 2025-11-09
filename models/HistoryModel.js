import mongoose, { Schema, model } from "mongoose";

const HistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      required: true,
      enum: ["transport", "energy", "food", "water"],
    },
    activity: { type: String, required: true }, // e.g., "Cars (by market segment)" or "Beef" or "Electricity"
    unit: { type: String, required: true }, // e.g., "km", "kWh", "kg", "liters"
    amount: { type: Number, required: true }, // distance, consumption, or quantity
    kgCO2e: { type: Number, required: true }, // emission factor per unit
    totalEmission: { type: Number, required: true },
    date: { type: Date, default: Date.now }, // optional for past entries
  },
  { timestamps: true }
);

const History = model("History", HistorySchema);
export default History;
