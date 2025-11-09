import Vehicle from "../models/VehicleModel.js";
import { NotFoundError } from "../error/customErrors.js";
import User from "../models/UserModel.js";

export const addVehicleData = async (req, res) => {
  const { activity, type, fuel, unit, kgCO2e } = req.body;
  const newVehicle = new Vehicle({
    activity,
    type,
    fuel,
    unit,
    kgCO2e,
  });
  const savedVehicle = await newVehicle.save();
  res.status(201).json({
    message: "successfully created new vehicle data",
    vehicle: savedVehicle,
    url: `/api/v1/vehicle/${savedVehicle._id}`,
  });
};

export const getAllVehicleData = async (req, res) => {
  const vehicles = await Vehicle.find();
  if (!vehicles) throw new NotFoundError("vehicle datas not found");
  res.status(200).json(vehicles);
};

export const updateVehicleData = async (req, res) => {
  const { activity, type, fuel, unit, kgCO2e } = req.body;
  const { id } = req.params;
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw new NotFoundError("vehicle data not found");
  vehicle.activity = activity;
  vehicle.type = type;
  vehicle.unit = unit;
  vehicle.kgCO2e = kgCO2e;
  await vehicle.save();
  res.status(200).json({ message: "vehicle data field is updated" });
};

export const getSingleVehicleData = async (req, res) => {
  const { id } = req.params;
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw new NotFoundError("data not found");
  res.status(200).json(vehicle);
};

export const deleteVehicleData = async (req, res) => {
  const { id } = req.params;
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) throw new NotFoundError(" data not found");
  res.status(200).json({ message: "deleted successfully" });
};
