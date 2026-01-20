import { NotFoundError } from "../error/customErrors.js";
import Food from "../models/FoodModel.js";

 export const getFoodOptions = async (req,res)=> {
  const food = await Food.find();
   if (!food) throw new NotFoundError("Food data is not found");

   const options = {
    activities: [...new Set(food.map(v=> v.foodProduct
))],
   }
   res.status(200).json(options);
}

export const getAllFoodData = async (req, res) => {
  const foods = await Food.find().select("foodProduct -_id");

  res.status(200).json(foods);
};
