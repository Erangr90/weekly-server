import express from "express";
import {
  getAllRestaurantsPage,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getAllRestaurants,
} from "../controllers/restaurantController";
import { protect, isAdmin } from "../middlewares/authMiddleware";
const router = express.Router();
router
  .route("/")
  .post(protect, isAdmin, createRestaurant)
  .get(protect, isAdmin, getAllRestaurants);
router
  .route("/:id")
  .put(protect, isAdmin, updateRestaurant)
  .delete(protect, isAdmin, deleteRestaurant);
router.route("/page").get(protect, isAdmin, getAllRestaurantsPage);

export default router;
