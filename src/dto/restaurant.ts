import { z } from "zod";

export const restaurantSchema = z.object({
  email: z
    .string({ message: "אימייל הוא חובה" })
    .email("כתובת האימייל אינה תקינה"),
  name: z
    .string({ message: "שם המסעדה הוא חובה" })
    .min(2, "שם המסעדה חייב להכיל לפחות 2 תווים")
    .max(50, "שם המסעדה יכול להכיל עד 50 תווים")
    .regex(
      /^[A-Za-z\u0590-\u05FF ]+$/,
      "שם המסעדה יכול להכיל רק אותיות באנגלית או בעברית ורווחים",
    ),
  phone: z
    .string({ message: "טלפון הוא חובה" })
    .min(9, "מספר הטלפון חייב להכיל לפחות 9 מספרים")
    .max(10, "מספר הטלפון חייב להכיל עד 10 מספרים")
    .regex(/^[0-9]{9,10}$/, "מספר הטלפון לא תקין"),
});
export type RestaurantDTO = z.infer<typeof restaurantSchema>;
