import EducationalResources from "../models/EducationalResoucrcesModel.js";
import { NotFoundError } from "../error/customErrors.js";

export const addResources = async (req, res) => {
  const { category, title, fact, tip, image } = req.body;

  const newResources = new EducationalResources({
    category,
    title,
    fact,
    tip,
    image,
    createdBy: req.user._id,
  });

  const savedResources = await newResources.save();

  res.status(201).json({
    message: "Resources added successfully",
    resources: savedResources,
  });
};

export const getAllResources = async (req, res) => {
  const resources = await EducationalResources.find();
  if (!resources) throw new NotFoundError("Resources not found");
  res.status(200).json(resources);
};

export const updateResource = async (req, res) => {
  const { category, title, fact, tip, image } = req.body;
  const { id } = req.params;
  const resources = await EducationalResources.findById(id);
  if (!resources) throw NotFoundError("resoucres not found");
  resources.category = category;
  resources.title = title;
  resources.fact = fact;
  resources.image = image;
  await resources.save();
  res.status(200).json({ message: " resoucres field is updated" });
};

export const getSingleResources = async (req, res) => {
  const { id } = req.params;
  const resources = await EducationalResources.findById(id);
  if (!resources) throw new NotFoundError("data not found");
  res.status(200).json(resources);
};

export const deleteResources = async (req, res) => {
  const { id } = req.params;
  const resources = await EducationalResources.findByIdAndDelete(id);
  if (!resources) throw new NotFoundError(" data not found");
  res.status(200).json({ message: "deleted successfully" });
};
