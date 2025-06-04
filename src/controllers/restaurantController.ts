import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { createRestaurantSchema } from "../dto/restaurant";

export const getAllRestaurants = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 12;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * pageSize;

    const restaurants = await prisma.restaurant.findMany({
      skip,
      take: pageSize,
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        // Add other fields you want to include
      },
    });

    res.json(restaurants);
  },
);

export const createRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;

    const result = createRestaurantSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    if (!result.success) {
      const errors = [];
      for (const error of result.error.errors) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { email: email.trim() },
    });
    if (existingRestaurant) {
      throw new Error("המסעדה קיימת במערכת");
    }

    await prisma.restaurant.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      },
    });

    res.status(201).json({ message: "המסעדה נוספה בהצלחה" });
  },
);
