import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import {
  createIngredient,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
  getAllIngredients,
} from "../controllers/ingredientController";
const router = express.Router();
router.route("/").get(protect, getAllIngredients);
router
  .route("/:id")
  .get(protect, isAdmin, getIngredientById)
  .put(protect, isAdmin, updateIngredient)
  .delete(protect, isAdmin, deleteIngredient);
export default router;
