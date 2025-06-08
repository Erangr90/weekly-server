import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { restaurantSchema } from "../dto/restaurant";

export const getAllRestaurantsPage = asyncHandler(
  async (req: Request, res: Response) => {
    let page = parseInt(req.query.page as string) || 1;
    if (page < 1) page = 1;
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
          { phone: { contains: search, mode: "insensitive" } },
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

export const getAllRestaurants = asyncHandler(
  async (req: Request, res: Response) => {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).json(restaurants);
  },
);

export const createRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;

    const result = restaurantSchema.safeParse({
      name: name,
      email: email,
      phone: phone,
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

export const updateRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const resId = Number(id);
    const { name, email, phone } = req.body;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: resId },
    });
    if (!restaurant) {
      throw new Error("המסעדה לא קיימת במערכת");
    }
    await prisma.restaurant.update({
      where: {
        id: resId,
      },
      data: {
        name: name.trim() || restaurant.name,
        email: email.trim() || restaurant.email,
        phone: phone.trim() || restaurant.phone,
      },
    });
    res.status(200).json({ message: "המסעדה עודכנה בהצלחה" });
  },
);

export const deleteRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const resId = Number(id);
    await prisma.restaurant.delete({
      where: {
        id: resId,
      },
    });
    res.status(200).json({ message: "המסעדה נמחקה בהצלחה" });
  },
);
