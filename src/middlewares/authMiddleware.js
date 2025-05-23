"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = __importDefault(require("./asyncHandler"));
const db_1 = require("../config/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.protect = (0, asyncHandler_1.default)(async (req, res, next) => {
    let token;
    const authHeader = req.headers["authorization"];
    token = authHeader?.split(" ")[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
            const user = await db_1.prisma.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                throw new Error("המשתמש לא נמצא");
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.error(error);
            throw new Error("אין הרשאה, נא להתחבר");
        }
    }
    else {
        throw new Error("אין הרשאה, נא להתחבר");
    }
});
exports.isAdmin = (0, asyncHandler_1.default)((req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    }
    else {
        res.status(401);
        throw new Error("אין הרשאת אדמין");
    }
});
