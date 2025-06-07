// Packages
import express from "express";
import cors from "cors";
// Routes
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
import allergyRoutes from "./routes/allergyRoutes";
import ingredientRoutes from "./routes/ingredientRoutes";
import pendingIngrRoutes from "./routes/pendingIngrRoutes";
import restaurantRoutes from "./routes/restaurantRoutes";
import dishesRoutes from "./routes/dishRoutes";
import uploadRoutes from "./routes/uploadRoutes";
// Middlewares
import { notFound, errorHandler } from "./middlewares/errorsMiddleware";
// Config
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

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/allergies", allergyRoutes);
app.use("/ingredients", ingredientRoutes);
app.use("/pending", pendingIngrRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/dishes", dishesRoutes);
app.use("/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port as number, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
