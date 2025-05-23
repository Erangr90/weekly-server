import express from "express";
import { getUsers } from "../controllers/usersController";
import { protect, isAdmin } from "../middlewares/authMiddleware";
const router = express.Router();
router.route("/").get(protect, isAdmin, getUsers);
export default router;
