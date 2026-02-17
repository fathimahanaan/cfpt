import mongoose from "mongoose";
import Vehicle from "../models/VehicleModel.js";
import Food from "../models/FoodModel.js";
import Energy from "../models/EnergyModel.js";
import { NotFoundError } from "../error/customErrors.js";
import EmissionRecord from "../models/EmissionRecordModel.js";
import { fillMissingDays, predictNextDaysML } from "../utils/emissionHelper.js";

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
        (f) => f.data.product.toLowerCase() === item.product.toLowerCase(),
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

    const emission = factor ? energyData.amount * factor.kg_CO2e : 0;

    record.energy = {
      data: energyData,
      totalEmission: Number(emission.toFixed(2)),
      unit: "kg CO2e",
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

export const getWeeklyEmissions = async (req, res) => {
  const userId = req.user.userId;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const last7 = new Date();
  last7.setDate(today.getDate() - 6);
  last7.setHours(0, 0, 0, 0);

  const records = await EmissionRecord.find({
    user: userId,
    date: { $gte: last7, $lte: today },
  }).sort({ date: 1 });

  const recordMap = {};
  records.forEach((r) => {
    recordMap[new Date(r.date).toDateString()] = r.totalEmission || 0;
  });

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - i));

    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
      }),
      emission: recordMap[date.toDateString()] || 0,
    };
  });

  res.status(200).json({
    success: true,
    days: weeklyData.length,
    data: weeklyData,
  });
};
 

export const getDailyEmission = async (req, res) => {
  const userId = req.user.userId;

  const today = new Date().toISOString().slice(0, 10);

  const record = await EmissionRecord.findOne({ user: userId, date: today });

  if (!record) {
    return res.status(200).json({
      success: true,
      data: {
        vehicle: 0,
        food: 0,
        energy: 0,
        total: 0,
      },
    });
  }

  // Calculate emissions per category
  const vehicleEmission = record.vehicle ? record.vehicle.totalEmission : 0;
  const foodEmission = record.food
    ? record.food.reduce((sum, item) => sum + item.totalEmission, 0)
    : 0;
  const energyEmission = record.energy ? record.energy.totalEmission : 0;

  res.status(200).json({
    success: true,
    data: {
      vehicle: vehicleEmission,
      food: foodEmission,
      energy: energyEmission,
      total: record.totalEmission || 0,
    },
  });
};

export const getHistory = async (req, res) => {
  const userId = req.user.userId;
  const records = await EmissionRecord.find({ user: userId }).sort({
    date: -1,
  });

  res.json({
    success: true,
    data: records,
  });
};

export const deleteHistory = async (req, res) => {
  const { id } = req.params;
  console.log("DELETE ID:", id);

  const record = await EmissionRecord.findOneAndDelete({
    _id: id,
    user: req.user.userId,
  });

  if (!record) {
    throw new NotFoundError("History record not found");
  }

  res.status(200).json({ message: "History record deleted successfully" });
};
 

 

 

export const getDailyPrediction = async (req, res) => {
  try {
    const userId = req.user.userId;

    const records = await EmissionRecord.find({ user: userId }).sort({ date: 1 });

    if (!records.length) {
      return res.status(200).json({ success: true, predicted: [] });
    }

    const rawData = records.map(r => {
      const vehicleValue = r.vehicle?.totalEmission ?? 0;
      const foodValue = Array.isArray(r.food)
        ? r.food.reduce((sum, item) => sum + (item.totalEmission ?? 0), 0)
        : 0;
      const energyValue = r.energy?.totalEmission ?? 0;

      const dateString = new Date(r.date).toISOString().split("T")[0];

      console.log("📝 Parsed record:", {
        date: dateString,
        vehicle: vehicleValue,
        food: foodValue,
        energy: energyValue,
      });

      return {
        date: dateString,
        vehicle: vehicleValue,
        food: foodValue,
        energy: energyValue,
      };
    });

    console.log("📌 Raw data ready for ML:", rawData);

    const filled = fillMissingDays(
      rawData,
      rawData[0].date,
      rawData[rawData.length - 1].date
    );

    console.log("📌 Filled timeline:", filled);

    const predicted = predictNextDaysML(filled, 7);

    console.log("📌 Predicted values:", predicted);

    res.status(200).json({
      success: true,
      predicted,
    });

  } catch (error) {
    console.error("❌ Prediction error:", error);
    res.status(500).json({ success: false, message: "Prediction failed" });
  }
};

 


 