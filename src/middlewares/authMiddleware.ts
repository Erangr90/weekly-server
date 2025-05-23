import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "./asyncHandler";
import { prisma } from "../config/db";
import { User } from "../types/users";
import dotenv from "dotenv";
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const protect = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;
    const authHeader = req.headers["authorization"];
    token = authHeader?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.TOKEN_SECRET as string,
        ) as JwtPayload;
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
        });
        if (!user) {
          throw new Error("המשתמש לא נמצא");
        }
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        throw new Error("אין הרשאה, נא להתחבר");
      }
    } else {
      throw new Error("אין הרשאה, נא להתחבר");
    }
  },
);

export const isAdmin = asyncHandler(
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401);
      throw new Error("אין הרשאת אדמין");
    }
  },
);
