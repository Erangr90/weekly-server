import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/db";
import asyncHandler from "../middlewares/asyncHandler";
import { signToken } from "../utils/jwt";
import { createUserSchema, loginUserSchema } from "../dto/users.dto";
import { sendVerificationEmail } from "../sendEmail/mailer";

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     allergies:
 *                       type: array
 *                       items:
 *                         type: string
 *                     role:
 *                       type: string
 *                     ingredients:
 *                       type: array
 *                       items:
 *                         type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation errors | wrong email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error or incorrect credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = loginUserSchema.safeParse({
    email: email,
    password: password,
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.errors) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim() },
    select: {
      id: true,
      fullName: true,
      email: true,
      allergies: true,
      role: true,
      ingredients: true,
      password: true,
    },
  });
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
      allergies: user.allergies,
      role: user.role,
      ingredients: user.ingredients,
    },
    token,
  });
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *               allergyIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                       example: newuser@example.com
 *                     fullName:
 *                       type: string
 *                       example: Jane Doe
 *                     role:
 *                       type: string
 *                       example: user
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
 *                     ingredients:
 *                       type: array
 *                       items:
 *                         type: string
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation errors | Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Email is invalid", "Password must be at least 6 characters"]
 *       500:
 *         description: User already exists or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש קיים במערכת
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, allergyIds } = req.body;

  const result = createUserSchema.safeParse({
    email: email,
    password: password,
    fullName: fullName,
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
      allergies: {
        connect: allergyIds.map((id: number) => ({ id })),
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      allergies: true,
      ingredients: true,
    },
  });
  const token = signToken({ id: newUser.id, fullName: newUser.fullName });

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      allergies: newUser.allergies,
      role: newUser.role,
      ingredients: newUser.ingredients,
    },
    token,
  });
});

/**
 * @swagger
 * /auth/verifyCode:
 *   post:
 *     summary: Send a verification code to the user's email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "348921"
 *       500:
 *         description: User already exists or email sending failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש קיים במערכת
 */
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

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: Reset a user's password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: NewStrongPassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: הסיסמא שונתה בהצלחה
 *       500:
 *         description: User not found or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש לא קיים במערכת
 */
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

/**
 * @swagger
 * /auth/verifyEmail:
 *   post:
 *     summary: Send a verification code to an existing user's email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: existinguser@example.com
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "573920"
 *       500:
 *         description: User not found or email sending failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: המשתמש לא קיים במערכת
 */
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
