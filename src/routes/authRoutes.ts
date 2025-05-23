import express from "express";
import {
  register,
  login,
  verifyCode,
  resetPassword,
  verifyEmail,
} from "../controllers/authController";
const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verifyCode").post(verifyCode);
router.route("/resetPassword").post(resetPassword);
router.route("/verifyEmail").post(verifyEmail);
export default router;
