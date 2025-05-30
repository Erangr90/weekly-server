import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { signToken } from "../utils/jwt";
import { createUserSchema, loginUserSchema } from "../dto/users.dto";
import { sendVerificationEmail } from "../sendEmail/mailer";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = loginUserSchema.safeParse({
    email: email.trim(),
    password: password.trim(),
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.errors) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!user) {
    throw new Error("המשתמש לא קיים במערכת");
  }

  if (!(await bcrypt.compare(password.trim(), user.password))) {
    throw new Error("סיסמא שגויה");
  }

  const token = signToken({ id: user.id, fullName: user.fullName });
  return res.status(200).json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      allergyIds: user.allergyIds,
      role: user.role,
      ingredientIds: user.ingredientIds,
    },
    token,
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, allergyIds } = req.body;

  const result = createUserSchema.safeParse({
    email: email.trim(),
    password: password.trim(),
    fullName: fullName.trim(),
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.errors) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("המשתמש קיים במערכת");
  }

  const hashedPassword = await bcrypt.hash(password.trim(), 10);
  const newUser = await prisma.user.create({
    data: {
      email: email.trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
      allergyIds,
    },
  });
  const token = signToken({ id: newUser.id, fullName: newUser.fullName });

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      allergyIds: newUser.allergyIds,
      role: newUser.role,
      ingredientIds: newUser.ingredientIds,
    },
    token,
  });
});

export const verifyCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const existsUser = await prisma.user.findUnique({
    where: { email: email.trim() },
  });
  if (existsUser) {
    throw new Error("המשתמש קיים במערכת");
  }
  let code: string | number = Math.floor(Math.random() * 1000000);
  code = code.toString().padStart(6, "0");
  await sendVerificationEmail(email, code);
  res.status(200).json({ code });
});

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });
    if (!user) {
      throw new Error("המשתמש לא קיים במערכת");
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    user.password = hashedPassword;
    await prisma.user.update({
      where: { email: email.trim() },
      data: { password: hashedPassword },
    });
    res.status(200).json({ message: "הסיסמא שונתה בהצלחה" });
  },
);
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!user) {
    throw new Error("המשתמש לא קיים במערכת");
  }
  let code: string | number = Math.floor(Math.random() * 1000000);
  code = code.toString().padStart(6, "0");
  await sendVerificationEmail(email, code);
  res.status(200).json({ code });
});
