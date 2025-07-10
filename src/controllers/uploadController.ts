import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { convertToWebP } from "../middlewares/webpUpload";
import asyncHandler from "../middlewares/asyncHandler";
import fs from "fs/promises";
// Extend Request to include Multer's file
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

/**
 * @swagger
 * /image:
 *   post:
 *     summary: Admin Upload an image, convert it to WebP, and get the hosted URL
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded and converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: https://res.cloudinary.com/yourcloud/image/upload/v123456/weekly/abc123.webp
 *       400:
 *         description: No image file was provided in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No image provided
 *       500:
 *         description: Server error occurred during image processing or upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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
