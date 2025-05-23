"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "אימייל הוא חובה" })
        .email("כתובת האימייל אינה תקינה"),
    fullName: zod_1.z
        .string({ message: "שם הוא חובה" })
        .min(2, "השם חייב להכיל לפחות 2 תווים")
        .max(50, "השם יכול להכיל עד 50 תווים")
        .regex(/^[A-Za-z\u0590-\u05FF ]+$/, "השם יכול להכיל רק אותיות באנגלית או בעברית ורווחים"),
    password: zod_1.z
        .string({ message: "סיסמא היא חובה" })
        .min(8, "סיסמא חייבת להכיל לפחות 8 תווים")
        .max(50, "הסיסמא יכולה להכיל עד 50 תווים")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, "הסיסמה חייבת להכיל לפחות אות גדולה, אות קטנה, ספרה ותו מיוחד"),
});
exports.loginUserSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "אימייל הוא חובה" })
        .email("כתובת האימייל אינה תקינה"),
    password: zod_1.z
        .string({ message: "סיסמא היא חובה" })
        .min(8, "סיסמא חייבת להכיל לפחות 8 תווים")
        .max(50, "הסיסמא יכולה להכיל עד 50 תווים")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, "הסיסמה חייבת להכיל לפחות אות גדולה, אות קטנה, ספרה ותו מיוחד"),
});
