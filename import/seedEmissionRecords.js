import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";
import Food from "../models/FoodModel.js";
import Energy from "../models/EnergyModel.js";
import EmissionRecord from "../models/emissionRecordModel.js";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedEmissionRecords = async () => {
  try {
    console.log("Starting to seed emission records...");

    // Your logged-in user ID (UUID)
    const YOUR_USER_ID = "69c09a9d-91cd-47fa-8261-c0df837b6d21";

    // Get existing data
    const user = await User.findOne({ userId: YOUR_USER_ID }); // Changed to userId
    const vehicles = await Vehicle.find();
    const foods = await Food.find();
    const energies = await Energy.find();

    console.log(
      `Found: ${vehicles.length} vehicles, ${foods.length} foods, ${energies.length} energy sources`
    );

    // Check if user exists
    if (!user) {
      console.error(`❌ User with ID ${YOUR_USER_ID} not found.`);
      process.exit(1);
    }

    console.log(
      `🎯 Seeding for your account: ${user.name} (User ID: ${user.userId})`
    ); // Changed to user.name

    // Check if we have minimum required data
    if (vehicles.length === 0) {
      console.error("❌ No vehicles found. Please seed vehicles first.");
      process.exit(1);
    }
    if (foods.length === 0) {
      console.error("❌ No foods found. Please seed foods first.");
      process.exit(1);
    }
    if (energies.length === 0) {
      console.error(
        "❌ No energy sources found. Please seed energy sources first."
      );
      process.exit(1);
    }

    // Delete existing emission records for YOUR user
    const deleteResult = await EmissionRecord.deleteMany({ user: user._id });
    console.log(
      `🧹 Cleared ${deleteResult.deletedCount} existing emission records for your account`
    );

    const today = new Date();
    let totalRecordsCreated = 0;

    console.log(`📝 Creating 30 days of emission records for your account...`);

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      // Random vehicle emission
      const vehicle = getRandomItem(vehicles);
      const distance = Math.floor(Math.random() * 100) + 1;
      const vehicleEmission = distance * vehicle.kgCO2e;

      // Random food emissions (1-3 different foods)
      const foodCount = Math.floor(Math.random() * 3) + 1;
      const chosenFoods = [];
      for (let j = 0; j < foodCount; j++) {
        const food = getRandomItem(foods);
        const amount = Math.random() * 2 + 0.1;
        const emission = amount * food.totalEmission;
        chosenFoods.push({
          data: {
            product: food.foodProduct,
            amount: Number(amount.toFixed(2)),
            unit: "kg",
          },
          totalEmission: Number(emission.toFixed(2)),
        });
      }

      // Random energy emission
      const energy = getRandomItem(energies);
      const energyAmount = Math.floor(Math.random() * 50) + 1;
      const energyEmission = energyAmount * energy.kg_CO2e;

      // Calculate total emission
      const totalEmission =
        vehicleEmission +
        chosenFoods.reduce((sum, f) => sum + f.totalEmission, 0) +
        energyEmission;

      // Create emission record - this will be linked to YOUR account
      const record = new EmissionRecord({
        user: user._id, // This links the record to your MongoDB user document
        date: dateStr,
        vehicle: {
          data: {
            ...vehicle.toObject(),
            distance,
          },
          totalEmission: Number(vehicleEmission.toFixed(2)),
        },
        food: chosenFoods,
        energy: {
          data: energy,
          totalEmission: Number(energyEmission.toFixed(2)),
        },
        totalEmission: Number(totalEmission.toFixed(2)),
      });

      await record.save();
      totalRecordsCreated++;
      console.log(`✅ Created record for ${dateStr}`);
    }

    console.log(
      `\n🎉 Successfully created ${totalRecordsCreated} emission records for YOUR account!`
    );
    console.log(`👤 User: ${user.name}`);
    console.log(`🆔 User ID: ${user.userId}`);
    console.log(`📅 30 days of emission data created!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(seedEmissionRecords);
