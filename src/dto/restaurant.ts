import { z } from "zod";

export const createRestaurantSchema = z.object({
  email: z
    .string({ message: "אימייל הוא חובה" })
    .email("כתובת האימייל אינה תקינה"),
  name: z
    .string({ message: "שם הוא חובה" })
    .min(2, "השם חייב להכיל לפחות 2 תווים")
    .max(50, "השם יכול להכיל עד 50 תווים")
    .regex(
      /^[A-Za-z\u0590-\u05FF ]+$/,
      "השם יכול להכיל רק אותיות באנגלית או בעברית ורווחים",
    ),
  phone: z
    .string({ message: "סיסמא היא חובה" })
    .min(8, "סיסמא חייבת להכיל לפחות 8 תווים")
    .max(50, "הסיסמא יכולה להכיל עד 50 תווים")
    .regex(/^[0-9].{9,10}$/, "מספר טלפון לא תקין"),
});
export type CreateRestaurantDTO = z.infer<typeof createRestaurantSchema>;
