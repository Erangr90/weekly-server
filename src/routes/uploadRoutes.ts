// routes/upload.ts
import express from "express";
import { upload } from "../middlewares/webpUpload";
import { uploadImage } from "../controllers/uploadController";

const router = express.Router();

router.route("/image").post(upload.single("image"), uploadImage);

export default router;
