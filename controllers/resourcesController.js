import { NotBeforeError } from "jsonwebtoken";
import EducationalResources from "../models/EducationalResoucrcesModel";
import { NotFoundError } from "../error/customErrors";

export const addResources = async (req, res) => {
  const { category, title, fact, tip, images } = req.body;
  const newResoucres = new EducationalResources({
    category,
    title,
    fact,
    tip,
    images,
  });
  const savedResoucres = await savedEnergy.save();
  res.status(201).json({
    message: "resources added successfully",
    Resources: "newResources",
  });
};

export const getAllResources = async (req, res) => {
  const resources = await EducationalResources.find();
  if (!resources) throw new NotFoundError("Resources not found");
  res.status(200).json(resources);
};

export const updateResourcesData = async (req, res) => {
  const { category, title, fact, tip, images } = req.body;
  const { id } = req.params;
  const resources = await EducationalResources.findById(id);
  if (!resources) throw NotFoundError("resoucres not found");
  resources.category = category;
  resources.title = title;
  resources.fact = fact;
  resources.images = images;
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
