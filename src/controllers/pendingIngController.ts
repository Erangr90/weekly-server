import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { ingredientSchema } from "../dto/ingredient.dto";

export const createPending = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const result = ingredientSchema.safeParse({
      name: name.trim(),
    });
    if (!result.success) {
      const errors = [];
      for (const error of result.error.errors) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { name: name.trim() },
    });
    if (existingIngredient) {
      throw new Error("המרכיב קיים במערכת");
    }
    await prisma.pendingIng.create({
      data: {
        name: name.trim(),
      },
    });
    res.status(201).json({ message: "המרכיב התווסף ומחכה לאישור" });
  },
);

export const getAllPending = asyncHandler(
  async (req: Request, res: Response) => {
    const ingredients = await prisma.pendingIng.findMany();
    res.status(200).json(ingredients);
  },
);

export const getAllPendingLen = asyncHandler(
  async (req: Request, res: Response) => {
    const ingredients = await prisma.pendingIng.findMany();
    res.status(200).json({ len: ingredients.length });
  },
);

export const getPendingById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const ingredient = await prisma.pendingIng.findUnique({
      where: { id: Number(id) },
    });
    if (!ingredient) {
      throw new Error("המרכיב לא קיים במערכת");
    }
    res.status(200).json(ingredient);
  },
);

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

    await prisma.ingredient.create({
      data: {
        name: name.trim(),
      },
    });

    await prisma.pendingIng.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "המרכיב התווסף בהצלחה" });
  },
);
