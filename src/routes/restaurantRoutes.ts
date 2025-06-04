import express from "express";
import {
  getAllRestaurants,
  createRestaurant,
} from "../controllers/restaurantController";
import { protect, isAdmin } from "../middlewares/authMiddleware";
const router = express.Router();
router
  .route("/")
  .get(protect, isAdmin, getAllRestaurants)
  .post(protect, isAdmin, createRestaurant);

export default router;
