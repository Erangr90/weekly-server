import { z } from "zod";
export const ingredientSchema = z.object({
  name: z
    .string({ message: "שם המרכיב הוא חובה" })
    .min(2, "שם המרכיב חייב להכיל לפחות 2 תווים")
    .max(25, "שם המרכיב חייב להכיל עד 25 תווים")
    .regex(/^[\u0590-\u05FF ]+$/, "השם יכול להכיל רק אותיות בעברית ורווחים"),
});
export type ingredientDTO = z.infer<typeof ingredientSchema>;
