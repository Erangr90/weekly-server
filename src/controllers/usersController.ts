import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { prisma } from "../config/db";
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

export const updateUserLike = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const { id } = req.params;
    if (!ids || !id || id == "") {
      throw new Error("בקשה לא תקינה");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      throw new Error("המשתמש לא קיים במערכת");
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        ingredientIds: ids,
      },
    });
    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        ingredientIds: updatedUser.ingredientIds,
        allergyIds: updatedUser.allergyIds,
        role: updatedUser.role,
      },
      message: "העדפות עודכנו בהצלחה",
    });
  },
);

export const updateUserAllergy = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const { id } = req.params;
    if (!ids || !id || id == "") {
      throw new Error("בקשה לא תקינה");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      throw new Error("המשתמש לא קיים במערכת");
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        allergyIds: ids,
      },
    });
    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        ingredientIds: updatedUser.ingredientIds,
        allergyIds: updatedUser.allergyIds,
        role: updatedUser.role,
      },
      message: "הרגישויות עודכנו בהצלחה",
    });
  },
);
