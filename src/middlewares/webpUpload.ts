import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs"; // for existsSync

const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({ storage });

const TEMP_DIR = path.join(__dirname, "../../temp");

async function convertToWebP(buffer: Buffer): Promise<string> {
  try {
    // Ensure temp folder exists
    if (!fsSync.existsSync(TEMP_DIR)) {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    }

    const outputPath = path.join(TEMP_DIR, `${Date.now()}.webp`);

    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    await fs.writeFile(outputPath, webpBuffer);

    return outputPath;
  } catch (error) {
    console.error("Error converting image to WebP:", error);
    throw error;
  }
}

export { upload, convertToWebP };
