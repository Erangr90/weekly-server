import { z } from "zod";
export const allergySchema = z.object({
  name: z
    .string({ message: "שם אלרגיה הוא חובה" })
    .min(2, "שם אלרגיה חייב להכיל לפחות 2 תווים")
    .max(25, "שם אלרגיה חייב להכיל עד 25 תווים")
    .regex(/^[\u0590-\u05FF ]+$/, "השם יכול להכיל רק אותיות בעברית ורווחים"),
});
export type AllergyDTO = z.infer<typeof allergySchema>;
