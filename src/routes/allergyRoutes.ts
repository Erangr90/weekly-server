import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import {
  createAllergy,
  getAllergyById,
  updateAllergy,
  deleteAllergy,
  getAllergies,
} from "../controllers/allergyController";
const router = express.Router();
router.route("/").get(getAllergies).post(protect, isAdmin, createAllergy);
router
  .route("/:id")
  .get(protect, isAdmin, getAllergyById)
  .put(protect, isAdmin, updateAllergy)
  .delete(protect, isAdmin, deleteAllergy);
export default router;
