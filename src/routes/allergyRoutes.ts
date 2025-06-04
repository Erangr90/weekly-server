import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import {
  createAllergy,
  getAllergyById,
  updateAllergy,
  deleteAllergy,
  getAllergies,
  getAllergiesPage,
} from "../controllers/allergyController";
const router = express.Router();
router.route("/").get(getAllergies).post(protect, isAdmin, createAllergy);
router.route("/page").get(protect, isAdmin, getAllergiesPage);
router
  .route("/:id")
  .put(protect, isAdmin, updateAllergy)
  .delete(protect, isAdmin, deleteAllergy);
export default router;
