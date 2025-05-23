import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
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

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(dummyUsers);
});
