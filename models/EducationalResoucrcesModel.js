import mongoose from "mongoose";
const { Schema, model } = mongoose;

const EducationalResourcesSchema = new Schema({
  category: {
    type: String,
    enum: ["food", "energy", "transport", "general"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  fact: {
    type: String,
    required: true,
  },
  tip: {
    type: String,
  },
  image: {
    type: String,
  },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EducationalResources = model(
  "EducationalResources",
  EducationalResourcesSchema
);

export default EducationalResources;
