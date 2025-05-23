"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TOKEN_SECRET = process.env.TOKEN_SECRET;
function signToken(payload) {
    try {
        return jsonwebtoken_1.default.sign(payload, TOKEN_SECRET, { expiresIn: "7d" });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Error generating refresh token: ${errorMessage}`);
    }
}
