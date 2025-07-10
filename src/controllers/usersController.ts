import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { prisma } from "../config/db";

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Admin Get a paginated list of users with optional search
 *     tags:
 *       - Users
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
 *         description: Search term for user full name or email (case-insensitive)
 *         example: "john"
 *     responses:
 *       200:
 *         description: List of users matching criteria
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
 *                   fullName:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: john.doe@example.com
 *                   role:
 *                     type: string
 *                     example: admin
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
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 12;
  const search = (req.query.search as string) || "";
  const skip = (page - 1) * pageSize;

  const users = await prisma.user.findMany({
    skip,
    take: pageSize,
    where: {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      // Add other fields you want to include
    },
  });

  res.json(users);
});

export const updateUserLike = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const { id } = req.params;
    if (!ids || !id || id == "") {
      throw new Error("בקשה לא תקינה");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      throw new Error("המשתמש לא קיים במערכת");
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        ingredients: {
          set: ids.map((id: number) => ({ id })),
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        ingredients: true,
        allergies: true,
      },
    });
    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        ingredients: updatedUser.ingredients,
        allergies: updatedUser.allergies,
        role: updatedUser.role,
      },
      message: "העדפות עודכנו בהצלחה",
    });
  },
);

/**
 * @swagger
 * /users/{id}/allergy:
 *   put:
 *     summary: Update allergies for a specific user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID to update allergies for
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of allergy IDs to set for the user
 *                 example: [1, 3, 5]
 *     responses:
 *       200:
 *         description: User allergies updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     role:
 *                       type: string
 *                       example: user
 *                     ingredients:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["tomato", "cheese"]
 *                     allergies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: Gluten
 *                 message:
 *                   type: string
 *                   example: הרגישויות עודכנו בהצלחה
 *       400:
 *         description: Invalid request (missing ids or user id)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: בקשה לא תקינה
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש לא קיים במערכת
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
export const updateUserAllergy = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const { id } = req.params;
    if (!ids || !id || id == "") {
      throw new Error("בקשה לא תקינה");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      throw new Error("המשתמש לא קיים במערכת");
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        allergies: {
          set: ids.map((id: number) => ({ id })),
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        ingredients: true,
        allergies: true,
      },
    });
    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        ingredients: updatedUser.ingredients,
        allergies: updatedUser.allergies,
        role: updatedUser.role,
      },
      message: "הרגישויות עודכנו בהצלחה",
    });
  },
);

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: Admin Update the role of a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID to update
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש עודכן בהצלחה
 *       400:
 *         description: Invalid request (missing or invalid role or id)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: בקשה לא תקינה
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש לא קיים במערכת
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
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!id || id == "" || !role || role == "") {
      throw new Error("בקשה לא תקינה");
    }
    if (role === "ADMIN") {
      await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          role: "ADMIN",
        },
      });
      res.status(200).json({ message: "המשתמש עודכן בהצלחה" });
      return;
    } else if (role === "USER") {
      await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          role: "USER",
        },
      });
      res.status(200).json({ message: "המשתמש עודכן בהצלחה" });
      return;
    } else {
      throw new Error("בקשה לא תקינה");
    }
  },
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Admin Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *         example: 10
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש נמחק בהצלחה
 *       400:
 *         description: Invalid request (missing or invalid id)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: בקשה לא תקינה
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש לא קיים במערכת
 *       500:
 *         description: Server error occurred while deleting user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || id == "") {
    throw new Error("בקשה לא תקינה");
  }
  await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });
  res.status(200).json({ message: "המשתמש נמחק בהצלחה" });
});

export const getUserIngr = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || id == "") {
    throw new Error("בקשה לא תקינה");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      ingredients: true,
    },
  });
  res.json(user?.ingredients);
});
