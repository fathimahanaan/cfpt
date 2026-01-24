import mongoose from "mongoose";
import Vehicle from "../models/VehicleModel.js";
import Food from "../models/FoodModel.js";
import Energy from "../models/EnergyModel.js";
import EmissionRecord from "../models/emissionRecordModel.js";
import { NotFoundError } from "../error/customErrors.js";

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
  const userId = String(req.user._id);
  console.log("REQ USER ID:", userId);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const last7 = new Date();
  last7.setDate(today.getDate() - 6);
  last7.setHours(0, 0, 0, 0);

  const records = await EmissionRecord.find({
    user: userId,
    date: { $gte: last7, $lte: today },
  }).sort({ date: 1 });

  res.json({
    success: true,
    days: records.length,
    data: records,
  });
};

export const getMonthlyEmissions = async (req, res) => {
  const userId = String(req.user._id);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const records = await EmissionRecord.find({
    user: userId,
    date: { $gte: monthStart, $lte: today },
  }).sort({ date: 1 });

  res.json({
    success: true,
    days: records.length,
    data: records,
  });
};

export const getMonthlyStats = async (req, res) => {
  const userId = String(req.user._id);

  const monthStart = new Date();
  monthStart.setDate(1);

  const today = new Date();

  const records = await EmissionRecord.find({
    user: userId,
    date: {
      $gte: monthStart.toISOString().slice(0, 10),
      $lte: today.toISOString().slice(0, 10),
    },
  });

  let total = 0;
  let food = 0;
  let energy = 0;
  let transport = 0;

  records.forEach((r) => {
    total += r.totalEmission || 0;

    if (r.vehicle) transport += r.vehicle.totalEmission;
    if (r.energy) energy += r.energy.totalEmission;
    if (r.food?.length) {
      r.food.forEach((f) => (food += f.totalEmission));
    }
  });

  res.json({
    success: true,
    total: Number(total.toFixed(2)),
    categories: {
      food: Number(food.toFixed(2)),
      energy: Number(energy.toFixed(2)),
      transport: Number(transport.toFixed(2)),
    },
  });
};

export const getProgress = async (req, res) => {
  const userId = String(req.user._id);

  const today = new Date();
  today.setHours(23, 59, 59, 999); // end of today

  // Start of this week (Sunday)
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  thisWeekStart.setHours(0, 0, 0, 0); // start of day

  // Last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  lastWeekEnd.setHours(23, 59, 59, 999);

  // This week total
  const thisWeek = await EmissionRecord.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: thisWeekStart, $lte: today },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalEmission" } } },
  ]);

  // Last week total
  const lastWeek = await EmissionRecord.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: lastWeekStart, $lte: lastWeekEnd },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalEmission" } } },
  ]);

  const TW = thisWeek[0]?.total || 0;
  const LW = lastWeek[0]?.total || 0;

  const change = LW === 0 ? 100 : ((TW - LW) / LW) * 100;

  res.json({
    success: true,
    thisWeek: TW.toFixed(2),
    lastWeek: LW.toFixed(2),
    changePercent: change.toFixed(2),
  });
};
export const getMonthlyProgress = async (req, res) => {
  const userId = String(req.user._id);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Start of this month
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  thisMonthStart.setHours(0, 0, 0, 0);

  // Start and end of last month
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  lastMonthStart.setHours(0, 0, 0, 0);

  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  lastMonthEnd.setHours(23, 59, 59, 999);

  // Sum of emissions this month
  const thisMonth = await EmissionRecord.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: thisMonthStart, $lte: today },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalEmission" } } },
  ]);

  // Sum of emissions last month
  const lastMonth = await EmissionRecord.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalEmission" } } },
  ]);

  const TM = thisMonth[0]?.total || 0;
  const LM = lastMonth[0]?.total || 0;
  const change = LM === 0 ? 100 : ((TM - LM) / LM) * 100;

  res.json({
    success: true,
    thisMonth: Number(TM.toFixed(2)),
    lastMonth: Number(LM.toFixed(2)),
    changePercent: Number(change.toFixed(2)),
  });
};

export const getHistory = async (req, res) => {
  const userId = req.user.userId; // Solar Squirrel UUID

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
    user: req.user.userId
  });

  if (!record) {
    throw new NotFoundError("History record not found");
  }

  res.status(200).json({ message: "History record deleted successfully" });
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

// passowrd hanaan

// {
//   "userId": "d3edc871-f5c8-4df3-8b44-049d9b353b14"
// }
