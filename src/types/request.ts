import { Request } from "express";
import { User } from "../types/users";

export interface AuthenticatedRequest extends Request {
  user?: User;
}
