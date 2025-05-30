import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { allergySchema } from "../dto/allergy.dto";

export const createAllergy = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const result = allergySchema.safeParse({
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
    const existingAllergy = await prisma.allergy.findUnique({
      where: { name: name.trim() },
    });
    if (existingAllergy) {
      throw new Error("האלגריה קיימת במערכת");
    }
    await prisma.allergy.create({
      data: {
        name: name.trim(),
      },
    });
    res.status(201).json({ message: "האלגריה התווספה בהצלחה" });
  },
);

export const getAllergies = asyncHandler(
  async (req: Request, res: Response) => {
    const allergies = await prisma.allergy.findMany();
    res.status(200).json(allergies);
  },
);

export const getAllergyById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const allergy = await prisma.allergy.findUnique({
      where: { id: Number(id) },
    });
    if (!allergy) {
      throw new Error("האלגריה לא קיימת במערכת");
    }
    res.status(200).json(allergy);
  },
);

export const updateAllergy = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    const existingAllergy = await prisma.allergy.findUnique({
      where: { id: Number(id) },
    });
    if (!existingAllergy) {
      throw new Error("האלגריה לא קיימת במערכת");
    }
    const result = allergySchema.safeParse({
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
    await prisma.allergy.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
      },
    });
    res.status(200).json({ message: "האלגריה עודכנה בהצלחה" });
  },
);

export const deleteAllergy = asyncHandler(
  async (res: Response, req: Request) => {
    const { id } = req.params;
    const allergy = await prisma.allergy.findUnique({
      where: { id: Number(id) },
    });
    if (!allergy) {
      throw new Error("האלגריה לא קיימת במערכת");
    }
    await prisma.allergy.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "האלגריה נמחקה בהצלחה" });
  },
);
