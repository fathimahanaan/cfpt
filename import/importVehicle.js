import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import * as dotenv from "dotenv";
import Vehicle from "../models/VehicleModel.js";

// Load environment variables
dotenv.config({ path: "../.env" });

console.log("Mongo URI:", process.env.MONGODB_URI); // Optional debug

async function main() {
  try {
    // 1️⃣ Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // 2️⃣ Drop the vehicles collection (ignore error if it doesn't exist)
    await mongoose.connection.db.dropCollection("vehicles").catch(() => {}); // ignore if collection doesn't exist
    console.log("🧹 Existing 'vehicles' collection dropped (if existed).");

    // 3️⃣ Path to CSV file
    const csvFile = path.join("../data/vehicleEmission.csv"); // Adjust path if needed
    if (!fs.existsSync(csvFile)) {
      console.error(`❌ CSV file not found at: ${csvFile}`);
      process.exit(1);
    }

    const data = [];

    // 4️⃣ Read and parse CSV
    fs.createReadStream(csvFile)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on("data", (row) => {
        const activity = row["Activity"]?.trim();
        const type = row["Type"]?.trim();
        const unit = row["Unit"]?.trim();
        const fuel = row["Fuel"]?.trim();
        const kgCO2e = row["kgCO2e"]?.trim();

        if (activity && type && unit && fuel && kgCO2e) {
          data.push({
            activity,
            type,
            unit,
            fuel,
            kgCO2e: Number(kgCO2e),
          });
        }
      })
      .on("end", async () => {
        try {
          // 5️⃣ Insert all records into MongoDB
          await Vehicle.insertMany(data);
          console.log(`🚀 ${data.length} records inserted successfully!`);

          // 6️⃣ Display a few sample documents
          const sample = await Vehicle.find().limit(5);
          console.log("✅ Sample documents:\n", sample);
        } catch (err) {
          console.error("❌ Error inserting data:", err);
        } finally {
          mongoose.connection.close();
          console.log("🔌 MongoDB connection closed.");
        }
      });
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.connection.close();
  }
}

main();
