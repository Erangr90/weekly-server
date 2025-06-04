import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import {
  createPending,
  getAllPending,
  // getPendingById,
  deletePending,
  getAllPendingLen,
  approvePending,
} from "../controllers/pendingIngreController";
const router = express.Router();
router.route("/len").get(protect, isAdmin, getAllPendingLen);
router
  .route("/")
  .get(protect, isAdmin, getAllPending)
  .post(protect, createPending);
router
  .route("/:id")
  .delete(protect, isAdmin, deletePending)
  .post(protect, isAdmin, approvePending);
export default router;
