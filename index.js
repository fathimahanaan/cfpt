import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";

//router imports
import vehicleRouter from "./routes/vehicleRouter.js";
import userRouter from "./routes/userRouter.js";
import energyRouter from "./routes/energyRouter.js";
import foodRouter from "./routes/foodRouter.js";
import historyRouter from "./routes/histroyRouter.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//routes
app.use("/api/v1/vehicle", vehicleRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/energy", energyRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/history", historyRouter);

app.use("*", (req, res) => {
  res.status(404).json({ message: "not found" }); //this error will trigger when the request route do not match any of the above routes
});

app.use(errorHandlerMiddleware); //all errors other than 404

const port = 3000 || process.env.port;
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("database successfully connected");
  app.listen(port, () => {
    console.log(`server connected on ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
