"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const errorsMiddleware_1 = require("./middlewares/errorsMiddleware");
const db_1 = require("./config/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.SERVER_PORT || 5000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
}));
app.use(express_1.default.json());
(0, db_1.connectToDb)();
app.get("/", (req, res) => {
    res.send("Server is up!");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", usersRoutes_1.default);
app.use(errorsMiddleware_1.notFound);
app.use(errorsMiddleware_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
