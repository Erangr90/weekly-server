import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { allergySchema } from "../dto/allergy.dto";
import { User } from "@prisma/client";

/**
 * @swagger
 * /allergies:
 *   post:
 *     summary: Admin Create a new allergy
 *     tags:
 *       - Allergies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gluten
 *     responses:
 *       201:
 *         description: Allergy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה התווספה בהצלחה
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Name is required"]
 *       500:
 *         description: Allergy already exists or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה קיימת במערכת
 */
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

/**
 * @swagger
 * /allergies:
 *   get:
 *     summary: Get all allergies
 *     tags:
 *       - Allergies
 *     responses:
 *       200:
 *         description: List of all allergies
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
 *                     example: Gluten
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
export const getAllergies = asyncHandler(
  async (req: Request, res: Response) => {
    const allergies = await prisma.allergy.findMany();
    res.status(200).json(allergies);
  },
);

/**
 * @swagger
 * /allergies/page:
 *   get:
 *     summary: Admin Get paginated list of allergies with optional search
 *     tags:
 *       - Allergies
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
 *         description: Filter allergies by name (case-insensitive)
 *         example: glu
 *     responses:
 *       200:
 *         description: Paginated allergies list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 5
 *                   name:
 *                     type: string
 *                     example: Gluten
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
export const getAllergiesPage = asyncHandler(
  async (req: Request, res: Response) => {
    let page = parseInt(req.query.page as string) || 1;
    if (page < 1) page = 1;
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

/**
 * @swagger
 * /allergies/{id}:
 *   get:
 *     summary: Admin Get a specific allergy by ID
 *     tags:
 *       - Allergies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the allergy to retrieve
 *         example: 3
 *     responses:
 *       200:
 *         description: Allergy found and returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 3
 *                 name:
 *                   type: string
 *                   example: Dairy
 *       404:
 *         description: Allergy not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה לא קיימת במערכת
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

/**
 * @swagger
 * /allergies/{id}:
 *   put:
 *     summary: Admin Update an existing allergy by ID
 *     tags:
 *       - Allergies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the allergy to update
 *         example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dairy-Free
 *     responses:
 *       200:
 *         description: Allergy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה עודכנה בהצלחה
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Name must be a non-empty string"]
 *       404:
 *         description: Allergy not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה לא קיימת במערכת
 *       500:
 *         description: Allergy with that name already exists or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה קיימת במערכת
 */
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

/**
 * @swagger
 * /allergies/{id}:
 *   delete:
 *     summary: Admin Delete an allergy by ID and remove it from all associated users
 *     tags:
 *       - Allergies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the allergy to delete
 *         example: 4
 *     responses:
 *       200:
 *         description: Allergy deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה נמחקה בהצלחה
 *       404:
 *         description: Allergy not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האלגריה לא קיימת במערכת
 *       500:
 *         description: Server error occurred while deleting the allergy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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
