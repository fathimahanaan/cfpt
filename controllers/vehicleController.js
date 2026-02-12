import Vehicle from "../models/VehicleModel.js";
import { NotFoundError } from "../error/customErrors.js";

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


export const getSingleVehicleData = async (req, res) => {
  const { id } = req.params;
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw new NotFoundError("data not found");
  res.status(200).json(vehicle);
};


export const getVehicleOptions = async (req, res) => {
  const { activity } = req.query;

  const allVehicles = await Vehicle.find();
  if (!allVehicles.length) throw new NotFoundError("Vehicle data not found");

  const filteredVehicles = activity
    ? allVehicles.filter((v) =>
        v.activity?.trim().toLowerCase() === activity?.trim().toLowerCase()
      )
    : allVehicles;

  const options = {
    activities: [...new Set(allVehicles.map((v) => v.activity))],
    types: [...new Set(filteredVehicles.map((v) => v.type))],
    fuels: [...new Set(filteredVehicles.map((v) => v.fuel))],
    units: [...new Set(filteredVehicles.map((v) => v.unit))],
  };

  res.status(200).json(options);
};




