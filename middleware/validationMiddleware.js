import { BadRequestError } from "../error/customErrors";

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
    .withMessage("invalid user id format"),
  body("password").notEmpty().withMessage("password is required"),
]);
