import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { dishSchema } from "../dto/dish.dto";
import { AuthenticatedRequest } from "../types/request";

export const getDishesPage = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 12;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * pageSize;

    const dishes = await prisma.dish.findMany({
      skip,
      take: pageSize,
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
      },
    });

    res.json(dishes);
  },
);

export const getUserDishes = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Get user's allergies ids
    const userAllergyIds = req.user!.allergies?.map((allergy) => allergy.id);
    let dishes = null;
    // If user has allergies
    if (userAllergyIds && userAllergyIds.length > 0) {
      // - include ALL of the user's allergies
      // - include NONE of the user's ingredients
      dishes = await prisma.dish.findMany({
        where: {
          // Ingredients must NOT contain any of the user's ingredients
          ingredients: {
            none: {
              users: {
                some: {
                  id: req.user!.id,
                },
              },
            },
          },
          // Allergies must contain ALL of the user's allergy IDs
          AND: userAllergyIds!.map((allergyId) => ({
            allergies: {
              some: { id: allergyId },
            },
          })),
        },
      });
    } else {
      dishes = await prisma.dish.findMany({
        where: {
          // Must include at least one allergy from the user's allergies
          allergies: {
            some: {
              users: {
                some: {
                  id: req.user!.id,
                },
              },
            },
          },
          // Must NOT include any ingredients from the user's ingredients
          ingredients: {
            none: {
              users: {
                some: {
                  id: req.user!.id,
                },
              },
            },
          },
        },
      });
    }
    if (dishes) {
      res.json(dishes);
    } else {
      res.json([]);
    }
  },
);

export const createDish = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    price,
    restaurantId,
    image,
    description,
    allergyIds,
    ingredientIds,
  } = req.body;
  const result = dishSchema.safeParse({
    name: name,
    price: price,
    description: description,
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.errors) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }
  const dish = await prisma.dish.findUnique({
    where: { name: name.trim() },
  });
  if (dish) {
    throw new Error("שם המנה קיים במערכת");
  }
  await prisma.dish.create({
    data: {
      name: name.trim(),
      price: price,
      description: description.trim(),
      image: image.trim(),
      restaurantId: restaurantId,
      allergies: {
        connect: allergyIds.map((id: number) => ({ id })),
      },
      ingredients: {
        connect: ingredientIds.map((id: number) => ({ id })),
      },
    },
  });
  res.status(201).json({ message: "המנה התווספה בהצלחה" });
});
