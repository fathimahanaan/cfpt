import mongoose, { model, Schema } from "mongoose";

const EnergySchema = new Schema(
  {
    Activity: {
      type: String,
      required: true,
    },
    Unit: {
      type: String,
      required: true,
    },
    kg_CO2e: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Energy = model("Energy", EnergySchema);
export default Energy;
