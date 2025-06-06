import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { allergySchema } from "../dto/allergy.dto";
import { User } from "@prisma/client";

export const createAllergy = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const result = allergySchema.safeParse({
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

export const getAllergiesPage = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 12;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * pageSize;

    const allergies = await prisma.allergy.findMany({
      skip,
      take: pageSize,
      where: {
        name: { contains: search, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json(allergies);
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
    const exist = await prisma.allergy.findUnique({
      where: { name: name.trim() },
    });
    if (exist) {
      throw new Error("האלגריה קיימת במערכת");
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
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const allergyId = Number(id);
    const allergy = await prisma.allergy.findUnique({
      where: { id: allergyId },
      include: { users: true },
    });
    if (!allergy) {
      throw new Error("האלגריה לא קיימת במערכת");
    }

    await Promise.all(
      allergy.users.map((user) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            allergies: {
              disconnect: { id: allergyId },
            },
          },
        }),
      ),
    );
    await prisma.allergy.delete({
      where: { id: allergyId },
    });
    res.status(200).json({ message: "האלגריה נמחקה בהצלחה" });
  },
);
