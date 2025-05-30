import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { ingredientSchema } from "../dto/ingredient.dto";

export const createIngredient = asyncHandler(
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
    await prisma.ingredient.create({
      data: {
        name: name.trim(),
      },
    });
    res.status(201).json({ message: "המרכיב התווסף בהצלחה" });
  },
);

export const getAllIngredients = asyncHandler(
  async (req: Request, res: Response) => {
    const ingredients = await prisma.ingredient.findMany();
    res.status(200).json(ingredients);
  },
);

export const getIngredientById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: Number(id) },
    });
    if (!ingredient) {
      throw new Error("המרכיב לא קיים במערכת");
    }
    res.status(200).json(ingredient);
  },
);

export const updateIngredient = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id: Number(id) },
    });
    if (!existingIngredient) {
      throw new Error("האלגריה לא קיימת במערכת");
    }
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
    await prisma.ingredient.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
      },
    });
    res.status(200).json({ message: "המרכיב עודכן בהצלחה" });
  },
);

export const deleteIngredient = asyncHandler(
  async (res: Response, req: Request) => {
    const { id } = req.params;
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: Number(id) },
    });
    if (!ingredient) {
      throw new Error("המרכיב לא קיים במערכת");
    }
    await prisma.ingredient.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "המרכיב נמחק בהצלחה" });
  },
);
