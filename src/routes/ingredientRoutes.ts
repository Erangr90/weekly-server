import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import {
  createIngredient,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
  getAllIngredients,
  getAllIngredPage,
} from "../controllers/ingredientController";
const router = express.Router();
router
  .route("/")
  .get(protect, getAllIngredients)
  .post(protect, isAdmin, createIngredient);
router
  .route("/:id")
  // .get(protect, isAdmin, getIngredientById)
  .put(protect, isAdmin, updateIngredient)
  .delete(protect, isAdmin, deleteIngredient);

router.route("/page").get(protect, isAdmin, getAllIngredPage);
export default router;
