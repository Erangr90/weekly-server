"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController_1 = require("../controllers/usersController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route("/").get(authMiddleware_1.protect, authMiddleware_1.isAdmin, usersController_1.getUsers);
exports.default = router;
