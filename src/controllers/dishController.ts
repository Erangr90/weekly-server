import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { dishSchema } from "../dto/dish.dto";
import { AuthenticatedRequest } from "../types/request";

/**
 * @swagger
 * /dishes/page:
 *   get:
 *     summary: Admin Get a paginated list of dishes with optional search
 *     tags:
 *       - Dishes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starts from 1)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for dish name, description, or restaurant name
 *         example: pasta
 *     responses:
 *       200:
 *         description: Paginated list of matching dishes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Spaghetti Bolognese
 *                   description:
 *                     type: string
 *                     example: Traditional Italian pasta with meat sauce
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 42.50
 *                   image:
 *                     type: string
 *                     format: uri
 *                     example: https://example.com/images/spaghetti.jpg
 *                   ingredients:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["pasta", "beef", "tomato"]
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 3
 *                         name:
 *                           type: string
 *                           example: Gluten
 *                   restaurant:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: Mama Mia Ristorante
 *       500:
 *         description: Server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const getDishesPage = asyncHandler(
  async (req: Request, res: Response) => {
    let page = parseInt(req.query.page as string) || 1;
    if (page < 0) page = 1;
    const pageSize = 8;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * pageSize;

    const dishes = await prisma.dish.findMany({
      skip,
      take: pageSize,
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          {
            restaurant: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        ingredients: true,
        allergies: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(dishes);
  },
);

/**
 * @swagger
 * /dishes/user:
 *   get:
 *     summary: Get personalized dishes for the authenticated user
 *     description: Returns a list of dishes filtered based on the user's allergies and ingredients. Supports search and pagination.
 *     tags:
 *       - Dishes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starts from 1)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter dishes by name, description, or restaurant name
 *         example: pizza
 *     responses:
 *       200:
 *         description: List of personalized dishes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 7
 *                   name:
 *                     type: string
 *                     example: Vegan Margherita Pizza
 *                   description:
 *                     type: string
 *                     example: A dairy-free pizza with tomato and basil
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 39.90
 *                   image:
 *                     type: string
 *                     format: uri
 *                     example: https://example.com/images/pizza.jpg
 *                   ingredients:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["tomato", "basil", "gluten-free dough"]
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         name:
 *                           type: string
 *                           example: Gluten
 *                   restaurant:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: Vegan Delight
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error occurred while retrieving personalized dishes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const getUserDishes = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    let page = parseInt(req.query.page as string) || 1;
    if (page < 1) page = 1;
    const pageSize = 8;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * pageSize;
    // Get user's allergies ids
    const userAllergyIds = req.user!.allergies?.map((allergy) => allergy.id);
    let dishes = null;
    // If user has allergies
    if (userAllergyIds && userAllergyIds.length > 0) {
      // - include ALL of the user's allergies
      // - include NONE of the user's ingredients
      dishes = await prisma.dish.findMany({
        skip,
        take: pageSize,
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
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              restaurant: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          ingredients: true,
          allergies: true,
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else {
      dishes = await prisma.dish.findMany({
        skip,
        take: pageSize,
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
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              restaurant: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          ingredients: true,
          allergies: true,
          restaurant: {
            select: {
              id: true,
              name: true,
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

/**
 * @swagger
 * /dishes:
 *   post:
 *     summary: Admin Create a new dish
 *     tags:
 *       - Dishes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - restaurantId
 *               - image
 *               - description
 *               - allergyIds
 *               - ingredientIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vegan Tofu Bowl
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 45.90
 *               restaurantId:
 *                 type: integer
 *                 example: 2
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/images/tofu-bowl.jpg
 *               description:
 *                 type: string
 *                 example: A hearty bowl of tofu, quinoa, and veggies
 *               allergyIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *               ingredientIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [4, 5, 6]
 *     responses:
 *       201:
 *         description: Dish created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המנה התווספה בהצלחה
 *       400:
 *         description: Validation error (e.g., missing fields or invalid types)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Name is required", "Price must be a number"]
 *       500:
 *         description: Dish with that name already exists or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: שם המנה קיים במערכת
 */
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

/**
 * @swagger
 * /dishes/{id}:
 *   get:
 *     summary: Admin Get a dish by its ID
 *     tags:
 *       - Dishes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the dish to retrieve
 *         example: 7
 *     responses:
 *       200:
 *         description: Dish retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 7
 *                 name:
 *                   type: string
 *                   example: Vegan Tofu Bowl
 *                 description:
 *                   type: string
 *                   example: A hearty bowl of tofu, quinoa, and veggies
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 45.90
 *                 image:
 *                   type: string
 *                   format: uri
 *                   example: https://example.com/images/tofu-bowl.jpg
 *                 allergies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: Soy
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: Tofu
 *                 restaurant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Plant Power Kitchen
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המנה לא קיימת במערכת
 *       500:
 *         description: Server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const getDishById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const dish = await prisma.dish.findUnique({
    where: { id: Number(id) },
    include: {
      allergies: true,
      ingredients: true,
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!dish) {
    throw new Error("המנה לא קיימת במערכת");
  }
  res.status(200).json(dish);
});

/**
 * @swagger
 * /dishes/{id}:
 *   put:
 *     summary: Admin Update an existing dish by ID
 *     tags:
 *       - Dishes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the dish to update
 *         example: 7
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - restaurantId
 *               - image
 *               - description
 *               - allergyIds
 *               - ingredientIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vegan Tofu Bowl
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 45.90
 *               restaurantId:
 *                 type: integer
 *                 example: 2
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/images/tofu-bowl.jpg
 *               description:
 *                 type: string
 *                 example: A hearty bowl of tofu, quinoa, and veggies
 *               allergyIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *               ingredientIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [4, 5, 6]
 *     responses:
 *       200:
 *         description: Dish updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המנה עודכנה בהצלחה
 *       400:
 *         description: Validation error (e.g., missing or invalid fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Name must be a string", "Price must be a number"]
 *       404:
 *         description: Dish not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המנה לא קיימת במערכת
 *       500:
 *         description: Server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const updateDish = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
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

  await prisma.dish.update({
    where: { id: Number(id) },
    data: {
      name: name.trim(),
      price: price,
      description: description.trim(),
      image: image.trim(),
      restaurantId: restaurantId,
      allergies: {
        set: allergyIds.map((id: number) => ({ id })),
      },
      ingredients: {
        set: ingredientIds.map((id: number) => ({ id })),
      },
    },
  });
  res.status(200).json({ message: "המנה עודכנה בהצלחה" });
});
