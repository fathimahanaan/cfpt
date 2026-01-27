import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
//router imports
import vehicleRouter from "./routes/vehicleRouter.js";
import userRouter from "./routes/userRouter.js";
import energyRouter from "./routes/energyRouter.js";
import foodRouter from "./routes/foodRouter.js";
import historyRouter from "./routes/histroyRouter.js";
import authRouter from "./routes/authRouter.js";
import resourcesRouter from "./routes/resourcesRouter.js"
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Ensure all necessary methods are allowed
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

//routes
app.use("/api/v1/vehicle", vehicleRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/energy", energyRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/resources", resourcesRouter);

app.use("*", (req, res) => {
  res.status(404).json({ message: "not found" }); //this error will trigger when the request route do not match any of the above routes
});

app.use(errorHandlerMiddleware); //all errors other than 404

const port = process.env.PORT || 3000;
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
//just 