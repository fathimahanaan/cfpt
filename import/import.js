import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import * as dotenv from "dotenv";
dotenv.config();
import Food from "../models/FoodModel.js";

async function main() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    // Drop the foods collection to avoid duplicates
    const collections = await mongoose.connection.db
      .listCollections({ name: "foods" })
      .toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.dropCollection("foods");
      console.log("Existing 'foods' collection dropped.");
    }

    // Path to CSV
    const csvFile = path.join("./data/Food_Product_Emissions.csv");
    const data = [];

    // Read CSV and push relevant fields
    fs.createReadStream(csvFile)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(), // remove extra spaces from headers
        })
      )
      .on("data", (row) => {
        const food = row["Food product"]?.trim();
        const emission =
          row["Total Global Average GHG Emissions per kg"]?.trim();
        if (food && emission) {
          data.push({
            foodProduct: food,
            totalEmission: Number(emission),
          });
        }
      })
      .on("end", async () => {
        try {
          await Food.insertMany(data);
          console.log(`${data.length} records inserted into MongoDB Atlas!`);

          // Display all imported foods
          const foods = await Food.find();
          console.log(`\nTotal foods: ${foods.length}\n`);
          foods.forEach((f) => {
            console.log(
              `Food: ${f.foodProduct}, Total Emission: ${f.totalEmission}`
            );
          });
        } catch (err) {
          console.error("Error inserting data:", err);
        } finally {
          mongoose.connection.close();
        }
      });
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

main();
