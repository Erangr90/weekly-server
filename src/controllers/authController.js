"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resetPassword = exports.verifyCode = exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const jwt_1 = require("../utils/jwt");
const users_dto_1 = require("../dto/users.dto");
const mailer_1 = require("../sendEmail/mailer");
exports.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const result = users_dto_1.loginUserSchema.safeParse(req.body);
    if (!result.success) {
        const errors = [];
        for (const error of result.error.errors) {
            errors.push(error.message);
        }
        res.status(400).json({ message: [...errors] });
        return;
    }
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("המשתמש לא קיים במערכת");
    }
    if (!(await bcrypt_1.default.compare(password, user.password))) {
        throw new Error("סיסמא שגויה");
    }
    const token = (0, jwt_1.signToken)({ id: user.id, fullName: user.fullName });
    return res.status(200).json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        token,
    });
});
exports.register = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { email, password, fullName } = req.body;
    const result = users_dto_1.createUserSchema.safeParse(req.body);
    if (!result.success) {
        const errors = [];
        for (const error of result.error.errors) {
            errors.push(error.message);
        }
        res.status(400).json({ message: [...errors] });
        return;
    }
    const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("המשתמש קיים במערכת");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newUser = await db_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            fullName,
        },
    });
    const token = (0, jwt_1.signToken)({ id: newUser.id, fullName: newUser.fullName });
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        token,
    });
});
exports.verifyCode = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    const existsUser = await db_1.prisma.user.findUnique({ where: { email } });
    if (existsUser) {
        throw new Error("המשתמש קיים במערכת");
    }
    let code = Math.floor(Math.random() * 1000000);
    code = code.toString().padStart(6, "0");
    await (0, mailer_1.sendVerificationEmail)(email, code);
    res.status(200).json({ code });
});
exports.resetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("המשתמש לא קיים במערכת");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    user.password = hashedPassword;
    await db_1.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    res.status(200).json({ message: "הסיסמא שונתה בהצלחה" });
});
exports.verifyEmail = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("המשתמש לא קיים במערכת");
    }
    let code = Math.floor(Math.random() * 1000000);
    code = code.toString().padStart(6, "0");
    await (0, mailer_1.sendVerificationEmail)(email, code);
    res.status(200).json({ code });
});
