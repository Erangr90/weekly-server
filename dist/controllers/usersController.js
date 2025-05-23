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
exports.getUsers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(dummyUsers);
}));
