import Energy from "../models/EnergyModel.js";

import { NotFoundError } from "../error/customErrors.js";

// Admin: Add new energy emission factor
export const addEnergyData = async (req, res) => {
  const { activity, unit, kgCO2e } = req.body;
  const newEnergy = new Energy({ activity, unit, kgCO2e });
  const savedEnergy = await newEnergy.save();
  res.status(201).json({
    message: "Energy factor added successfully",
    energy: savedEnergy,
    url: `/api/v1/energy/${savedEnergy._id}`,
  });
};

// Admin: Get all energy factors
export const getAllEnergyData = async (req, res) => {
  const energies = await Energy.find();
  if (!energies) throw new NotFoundError("Energy data not found");
  res.status(200).json(energies);
};

export const updateEnergyData = async (req, res) => {
  const { activity, unit, kgCO2e } = req.body;
  const { id } = req.params;
  const energy = await Energy.findById(id);
  if (!energy) throw new NotFoundError("Energy factor not found");

  // Update fields
  energy.Activity = activity;
  energy.Unit = unit;
  energy.kg_CO2e = kgCO2e;

  // Save changes
  await energy.save();

  res
    .status(200)
    .json({ message: "Energy factor updated successfully", energy });
};

export const getSingleEnergyData = async (req, res) => {
  const { id } = req.params;
  const energy = await Energy.findById(id);
  if (!energy) throw new NotFoundError("data not found");
  res.status(200).json(energy);
};

export const deleteEnergyData = async (req, res) => {
  const { id } = req.params;
  const energy = await Energy.findByIdAndDelete(id);
  if (!energy) throw new NotFoundError(" data not found");
  res.status(200).json({ message: "deleted successfully" });
};

export const getEnergyOptions = async (req, res) => {
  const energy = await Energy.find();

  if (!energy.length) {
    throw new NotFoundError("Energy data not found");
  }

  const options = {
    activities: [...new Set(energy.map(v => v.Activity))],
    units: [...new Set(energy.map(v => v.Unit))],
  };

  res.status(200).json(options);
};


 