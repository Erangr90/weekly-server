import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { convertToWebP } from "../middlewares/webpUpload";
import asyncHandler from "../middlewares/asyncHandler";
import fs from "fs/promises";
// Extend Request to include Multer's file
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const multerReq = req as MulterRequest;

  if (!multerReq.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  const webpPath = await convertToWebP(multerReq.file.buffer);

  const uploadResult = await cloudinary.uploader.upload(webpPath, {
    folder: "weekly",
    resource_type: "image",
    format: "webp",
  });

  await fs.unlink(webpPath); // Clean up temporary file

  res.json({ url: uploadResult.secure_url });
});
