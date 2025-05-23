"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const dummyUsers = [
    {
        id: 1,
        email: "test@test.com",
        fullName: "test test",
    },
    {
        id: 2,
        email: "tes2t@test.com",
        fullName: "test2 test2",
    },
    {
        id: 3,
        email: "tes3t@test.com",
        fullName: "test3 test3",
    },
];
exports.getUsers = (0, asyncHandler_1.default)(async (req, res) => {
    res.status(200).json(dummyUsers);
});
