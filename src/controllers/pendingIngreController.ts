import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { ingredientSchema } from "../dto/ingredient.dto";
import { AuthenticatedRequest } from "../types/request";

export const createPending = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name } = req.body;
    const result = ingredientSchema.safeParse({
      name: name,
    });
    if (!result.success) {
      const errors = [];
      for (const error of result.error.errors) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }
    let existingIngredient = await prisma.ingredient.findUnique({
      where: { name: name.trim() },
    });
    if (existingIngredient) {
      throw new Error("המרכיב קיים במערכת");
    }
    existingIngredient = null;
    existingIngredient = await prisma.pendingIng.findUnique({
      where: { name: name.trim() },
    });
    if (existingIngredient) {
      throw new Error("המרכיב מחכה לאישור המנהל");
    }
    await prisma.pendingIng.create({
      data: {
        name: name.trim(),
        userId: req.user!.id,
      },
    });
    res.status(201).json({ message: "המרכיב התווסף ומחכה לאישור" });
  },
);

export const getAllPending = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const pending = await prisma.pendingIng.findMany({
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        // Add other fields you want to include
      },
    });

    res.json(pending);
  },
);

export const getAllPendingLen = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await prisma.pendingIng.count();
    res.status(200).json({ len: count });
  },
);

//   async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const ingredient = await prisma.pendingIng.findUnique({
//       where: { id: Number(id) },
//     });
//     if (!ingredient) {
//       throw new Error("המרכיב לא קיים במערכת");
//     }
//     res.status(200).json(ingredient);
//   },
// );

export const deletePending = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const ingredient = await prisma.pendingIng.findUnique({
      where: { id: Number(id) },
    });
    if (!ingredient) {
      throw new Error("המרכיב לא קיים במערכת");
    }
    await prisma.pendingIng.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "המרכיב נמחק בהצלחה" });
  },
);

export const approvePending = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
      },
    });

    const pending = await prisma.pendingIng.findUnique({
      where: { id: Number(id) },
    });

    await prisma.user.update({
      where: { id: pending!.userId },
      data: {
        ingredients: {
          connect: {
            id: ingredient.id,
          },
        },
      },
    });

    await prisma.pendingIng.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "המרכיב התווסף בהצלחה" });
  },
);
