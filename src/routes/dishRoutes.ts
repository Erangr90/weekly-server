import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import {
  createDish,
  getDishesPage,
  getDishById,
  updateDish,
  getUserDishes,
} from "../controllers/dishController";
const router = express.Router();
router.route("/user").get(protect, getUserDishes);
router.route("/page").get(protect, isAdmin, getDishesPage);
router.route("/").post(protect, isAdmin, createDish);
router
  .route("/:id")
  .get(protect, isAdmin, getDishById)
  .put(protect, isAdmin, updateDish);

export default router;
