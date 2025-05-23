import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string({ message: "אימייל הוא חובה" })
    .email("כתובת האימייל אינה תקינה"),
  fullName: z
    .string({ message: "שם הוא חובה" })
    .min(2, "השם חייב להכיל לפחות 2 תווים")
    .max(50, "השם יכול להכיל עד 50 תווים")
    .regex(
      /^[A-Za-z\u0590-\u05FF ]+$/,
      "השם יכול להכיל רק אותיות באנגלית או בעברית ורווחים",
    ),
  password: z
    .string({ message: "סיסמא היא חובה" })
    .min(8, "סיסמא חייבת להכיל לפחות 8 תווים")
    .max(50, "הסיסמא יכולה להכיל עד 50 תווים")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "הסיסמה חייבת להכיל לפחות אות גדולה, אות קטנה, ספרה ותו מיוחד",
    ),
});
export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const loginUserSchema = z.object({
  email: z
    .string({ message: "אימייל הוא חובה" })
    .email("כתובת האימייל אינה תקינה"),
  password: z
    .string({ message: "סיסמא היא חובה" })
    .min(8, "סיסמא חייבת להכיל לפחות 8 תווים")
    .max(50, "הסיסמא יכולה להכיל עד 50 תווים")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "הסיסמה חייבת להכיל לפחות אות גדולה, אות קטנה, ספרה ותו מיוחד",
    ),
});
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
