import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import { createDish } from "../controllers/dishController";
const router = express.Router();
router.route("/").post(protect, isAdmin, createDish);

export default router;
