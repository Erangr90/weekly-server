import { randomBytes } from "crypto";

export function generateSecret(length: number = 64): string {
  return randomBytes(length).toString("hex");
}
