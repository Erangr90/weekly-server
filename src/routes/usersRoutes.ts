import express from "express";
import {
  getUsers,
  updateUserLike,
  updateUserAllergy,
} from "../controllers/usersController";
import { protect, isAdmin } from "../middlewares/authMiddleware";
const router = express.Router();
router.route("/").get(protect, isAdmin, getUsers);
router.route("/:id/like").put(protect, updateUserLike);
router.route("/:id/allergy").put(protect, updateUserAllergy);

export default router;
