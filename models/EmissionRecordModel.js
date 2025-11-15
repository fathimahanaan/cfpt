import mongoose from "mongoose";
const { Schema, model } = mongoose;

const EmissionRecordSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  date: { type: String, required: true }, // YYYY-MM-DD
  vehicle: {
    type: Object, // { data, totalEmission }
    default: null,
  },
  food: {
    type: [Object], // [{ data, totalEmission }]
    default: [],
  },
  energy: {
    type: Object, // { data, totalEmission }
    default: null,
  },
  totalEmission: {
    type: Number,
    default: 0, // vehicle + sum(food) + energy
  },
  createdAt: { type: Date, default: Date.now },
});

// Create the model
const EmissionRecord = model("EmissionRecord", EmissionRecordSchema);

export default EmissionRecord;
