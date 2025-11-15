import mongoose from "mongoose";

import Vehicle from "../models/VehicleModel.js";
import Food from "../models/FoodModel.js";
import Energy from "../models/EnergyModel.js";
import EmissionRecord from "../models/emissionRecordModel.js";

// -----------------------------
// Helper: Get or create today's record
// -----------------------------
const getOrCreateTodayRecord = async (userId) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  let record = await EmissionRecord.findOne({
    user: userId,
    date: today,
  });
  if (!record) {
    record = new EmissionRecord({ user: userId, date: today });
  }
  return record;
};

// -----------------------------
// Helper: Calculate total emissions
// -----------------------------
const updateTotalEmission = (record) => {
  const vehicleTotal = record.vehicle?.totalEmission || 0;
  const foodTotal =
    record.food?.reduce((sum, f) => sum + f.totalEmission, 0) || 0;
  const energyTotal = record.energy?.totalEmission || 0;

  record.totalEmission = vehicleTotal + foodTotal + energyTotal;
};

// -----------------------------
// Main Controller: Calculate & Save All
// -----------------------------
export const calculateAllEmissions = async (req, res) => {
  const { vehicleData, foodItems, energyData } = req.body;
  const userId = req.user.userId;

  const record = await getOrCreateTodayRecord(userId);

  // -----------------------------
  // Vehicle Emission
  // -----------------------------
  if (vehicleData) {
    const vehicle = await Vehicle.findOne({
      activity: vehicleData.activity,
      type: vehicleData.type,
      unit: vehicleData.unit,
      fuel: vehicleData.fuel,
    });

    record.vehicle = {
      data: vehicleData,
      totalEmission: vehicle ? vehicleData.distance * vehicle.kgCO2e : 0,
    };
  }

  // -----------------------------
  // Food Emission
  // -----------------------------
  if (foodItems && Array.isArray(foodItems)) {
    const existingFoods = record.food || [];

    for (const item of foodItems) {
      const food = await Food.findOne({
        foodProduct: new RegExp(`^${item.product}$`, "i"),
      });
      if (!food) continue;

      const amountInKg = item.unit === "g" ? item.amount / 1000 : item.amount;
      const emission = amountInKg * food.totalEmission;

      // Check if product already exists in today's record
      const existingIndex = existingFoods.findIndex(
        (f) => f.data.product.toLowerCase() === item.product.toLowerCase()
      );

      if (existingIndex > -1) {
        // Update totalEmission for existing item
        existingFoods[existingIndex].totalEmission += emission;
        existingFoods[existingIndex].data.amount += item.amount;
      } else {
        // Add new item
        existingFoods.push({ data: item, totalEmission: emission });
      }
    }

    record.food = existingFoods;
  }

  // -----------------------------
  // Energy Emission
  // -----------------------------
  if (energyData) {
    const factor = await Energy.findOne({
      Activity: energyData.activity,
      Unit: energyData.unit,
    });

    record.energy = {
      data: energyData,
      totalEmission: factor ? energyData.amount * factor.kg_CO2e : 0,
    };
  }

  // -----------------------------
  // Update total and save
  // -----------------------------
  updateTotalEmission(record);
  await record.save();

  res.status(200).json({
    success: true,
    message: "Emissions calculated and saved",
    data: record,
  });
};

// {
//   "userId": "64fe1234567890abcdef1234",
//   "vehicleData": {
//     "activity": "Cars (by market segment)",
//     "type": "Mini",
//     "unit": "km",
//     "fuel": "Petrol",
//     "distance": 100
//   },
//   "foodItems": [
//     { "product": "Milk", "amount": 1, "unit": "kg" },
//     { "product": "Beef", "amount": 500, "unit": "g" }
//   ],
//   "energyData": {
//     "activity": "Electricity generated",
//     "unit": "kWh",
//     "amount": 50
//   }
// }
