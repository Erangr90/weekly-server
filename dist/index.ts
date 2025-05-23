import express from "express";
import cors from "cors";
import authRoutes from "../src/routes/authRoutes";
import usersRoutes from "../src/routes/usersRoutes";
import { notFound, errorHandler } from "../src/middlewares/errorsMiddleware";
import { connectToDb } from "../src/config/db";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.SERVER_PORT || 5000;

const app = express();

app.use(
  cors({
    credentials: true,
  }),
);
app.use(express.json());

connectToDb();

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
