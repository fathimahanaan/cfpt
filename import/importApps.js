import mongoose from "mongoose";
import * as dotenv from "dotenv";
import AppCO2 from "../models/AppCO2Model.js";

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    // Drop collection if exists to avoid duplicates
    const collections = await mongoose.connection.db
      .listCollections({ name: "appco2s" }) // collection name pluralized by default
      .toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.dropCollection("appco2s");
      console.log("Existing 'appco2s' collection dropped.");
    }

    // Data from your table
    const data = [
      {
        app: "Chrome",
        CO2_per_min_g: 0.8,
        type: "per_minute",
        notes: "Average web page load; +0.2 per Google search",
      },
      {
        app: "WhatsApp",
        CO2_per_min_g: 1.8,
        type: "per_minute",
        notes: "Messaging, assumes half session with images/GIFs",
      },
      {
        app: "Amazon Shopping",
        CO2_per_min_g: 1.49,
        type: "per_minute",
        notes: "Average shopping session",
      },
      {
        app: "YouTube",
        CO2_per_min_g: 0.46,
        type: "per_minute",
        notes: "Video streaming",
      },
      {
        app: "LinkedIn",
        CO2_per_min_g: 0.71,
        type: "per_minute",
        notes: "Average usage",
      },
      {
        app: "Facebook",
        CO2_per_min_g: 0.79,
        type: "per_minute",
        notes: "Average usage",
      },
      {
        app: "Instagram",
        CO2_per_min_g: 1.05,
        type: "per_minute",
        notes: "Average usage",
      },
      {
        app: "Reddit",
        CO2_per_min_g: 2.48,
        type: "per_minute",
        notes: "Average usage",
      },
      {
        app: "ChatGPT",
        CO2_per_min_g: 4.32,
        type: "per_session",
        notes: "Per chat request",
      },
      {
        app: "Gmail",
        CO2_per_min_g: 2.15,
        type: "per_email",
        notes: "Average email sent/received",
      },
    ];

    await AppCO2.insertMany(data);
    console.log(`${data.length} records inserted into MongoDB Atlas!`);

    const apps = await AppCO2.find();
    apps.forEach((a) =>
      console.log(`${a.app} - ${a.CO2_per_min_g} g CO2 (${a.type})`)
    );
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

main();
