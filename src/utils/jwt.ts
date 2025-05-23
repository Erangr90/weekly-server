import jwt from "jsonwebtoken";
import { PayloadType } from "../types/jwt/Payload";
import dotenv from "dotenv";
dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET as string;

export function signToken(payload: PayloadType) {
  try {
    return jwt.sign(payload, TOKEN_SECRET, { expiresIn: "7d" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error generating refresh token: ${errorMessage}`);
  }
}
