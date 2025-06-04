import express from "express";
import {
  getAllUsers,
  updateUserLike,
  updateUserAllergy,
  updateUserRole,
  deleteUser,
  getUserIngr,
} from "../controllers/usersController";
import { protect, isAdmin } from "../middlewares/authMiddleware";
const router = express.Router();
router.route("/").get(protect, isAdmin, getAllUsers);
router.route("/:id").delete(protect, isAdmin, deleteUser);
router.route("/:id/like").put(protect, updateUserLike);
router.route("/:id/allergy").put(protect, updateUserAllergy);
router.route("/:id/role").put(protect, isAdmin, updateUserRole);
router.route("/:id/ingr").get(protect, getUserIngr);

export default router;
