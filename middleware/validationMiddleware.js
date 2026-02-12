import { body, validationResult } from "express-validator";
import { BadRequestError } from "../error/customErrors.js";

const sections = {
  vehicleData: ["activity", "type", "fuel", "unit", "distance"],
  energyData: ["activity", "unit", "amount"],
};

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      console.log("Incoming data:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateRegisterInput = withValidationErrors([
  body("password").notEmpty().withMessage("password is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("userId")
    .notEmpty()
    .withMessage("UserId is required")
    .isUUID()
    .withMessage("Invalid user id format"),
  body("password").notEmpty().withMessage("Password is required"),
]);

export const validateCalculateEmissionsInput = withValidationErrors([
 
  ...Object.entries(sections).flatMap(([section, fields]) => {
    return fields.map((field) =>
      body(`${section}.${field}`)
        .if(body(section).exists()) 
        .notEmpty()
        .withMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
    );
  }),
 
  body("foodItems")
    .optional()
    .isArray()
    .withMessage("Food items must be an array"),
  body("foodItems.*.product")
    .if(body("foodItems").exists())
    .notEmpty()
    .withMessage("Food product is required"),
  body("foodItems.*.amount")
    .if(body("foodItems").exists())
    .notEmpty()
    .withMessage("Food amount is required")
    .isNumeric()
    .withMessage("Food amount must be a number"),
  body("foodItems.*.unit")
    .if(body("foodItems").exists())
    .notEmpty()
    .withMessage("Food unit is required"),
]);