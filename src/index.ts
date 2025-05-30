import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
import allergyRoutes from "./routes/allergyRoutes";
import ingredientRoutes from "./routes/ingredientRoutes";
import pendingRoutes from "./routes/pendingRoutes";
import { notFound, errorHandler } from "./middlewares/errorsMiddleware";
import { connectToDb } from "./config/db";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    credentials: true,
  }),
);
app.use(express.json());

connectToDb();

app.get("/", (req, res) => {
  res.send("Server is up!");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/allergies", allergyRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/pending", pendingRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port as number, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
