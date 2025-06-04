import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { prisma } from "../config/db";

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
      ingredientIds: true,
      allergyIds: true,
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
        ingredientIds: ids,
      },
    });
    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        ingredientIds: updatedUser.ingredientIds,
        allergyIds: updatedUser.allergyIds,
        role: updatedUser.role,
      },
      message: "העדפות עודכנו בהצלחה",
    });
  },
);

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
        allergyIds: ids,
      },
    });
    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        ingredientIds: updatedUser.ingredientIds,
        allergyIds: updatedUser.allergyIds,
        role: updatedUser.role,
      },
      message: "הרגישויות עודכנו בהצלחה",
    });
  },
);

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
      ingredientIds: true,
      // Add other fields you want to include
    },
  });
  res.json(user);
});
