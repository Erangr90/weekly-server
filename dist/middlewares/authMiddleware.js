"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_1 = require("../config/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.protect = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    const authHeader = req.headers["authorization"];
    token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
            const user = yield db_1.prisma.user.findUnique({
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
}));
exports.isAdmin = (0, asyncHandler_1.default)((req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    }
    else {
        res.status(401);
        throw new Error("אין הרשאת אדמין");
    }
});
