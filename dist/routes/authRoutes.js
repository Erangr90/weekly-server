"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.route("/register").post(authController_1.register);
router.route("/login").post(authController_1.login);
router.route("/verifyCode").post(authController_1.verifyCode);
router.route("/resetPassword").post(authController_1.resetPassword);
router.route("/verifyEmail").post(authController_1.verifyEmail);
exports.default = router;
