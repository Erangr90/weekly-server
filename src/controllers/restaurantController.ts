import { Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { restaurantSchema } from "../dto/restaurant";

/**
 * @swagger
 * /restaurants/page:
 *   get:
 *     summary: Admin Get paginated list of restaurants with optional search
 *     tags:
 *       - Restaurants
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
 *         description: Search term for restaurant name, email, or phone (case-insensitive)
 *         example: mama
 *     responses:
 *       200:
 *         description: List of restaurants matching criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 12
 *                   name:
 *                     type: string
 *                     example: Mama Mia Ristorante
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: info@mamamia.com
 *                   phone:
 *                     type: string
 *                     example: "+1-555-123-4567"
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

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Admin Get a list of all restaurants (id and name only)
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: List of all restaurants with id and name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 15
 *                   name:
 *                     type: string
 *                     example: Mama Mia Ristorante
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

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Admin Create a new restaurant
 *     tags:
 *       - Restaurants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mama Mia Ristorante
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mamamia@example.com
 *               phone:
 *                 type: string
 *                 example: "+1-555-123-4567"
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המסעדה נוספה בהצלחה
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
 *                   example: ["Name is required", "Invalid email"]
 *       500:
 *         description: Restaurant with that email already exists or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המסעדה קיימת במערכת
 */
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

/**
 * @swagger
 * /restaurants/{id}:
 *   put:
 *     summary: Admin Update an existing restaurant by ID
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant to update
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mama Mia Ristorante
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mamamia@example.com
 *               phone:
 *                 type: string
 *                 example: "+1-555-123-4567"
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המסעדה עודכנה בהצלחה
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המסעדה לא קיימת במערכת
 *       400:
 *         description: Validation error (e.g., invalid input)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Invalid email format"]
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

/**
 * @swagger
 * /restaurants/{id}:
 *   delete:
 *     summary: Admin Delete a restaurant by ID
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the restaurant to delete
 *         example: 10
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המסעדה נמחקה בהצלחה
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המסעדה לא קיימת במערכת
 *       500:
 *         description: Server error occurred while deleting the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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
