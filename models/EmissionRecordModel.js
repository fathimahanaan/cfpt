import mongoose from "mongoose";
const { Schema, model } = mongoose;

const EmissionRecordSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  date: { type: Date, required: true },  
  vehicle: {
    type: Object,  
    default: null,
  },
  food: {
    type: [Object],  
    default: [],
  },
  energy: {
    type: Object,  
    default: null,
  },
  totalEmission: {
    type: Number,
    default: 0, 
  },
  createdAt: { type: Date, default: Date.now },
});

// Create the model
const EmissionRecord = model("EmissionRecord", EmissionRecordSchema);

export default EmissionRecord;
