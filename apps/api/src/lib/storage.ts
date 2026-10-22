import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { AppError } from '../middleware/error-handler.js';

// Base directory for receipt uploads
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads/receipts');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else ext = '.jpg';
    }
    const safeName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

export const receiptUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new AppError(
          400,
          'INVALID_FILE_TYPE',
          'Only JPEG, PNG, and WebP receipt images are supported.'
        )
      );
    }
    cb(null, true);
  },
});

/**
 * Saves a base64 receipt payload safely to disk.
 * Supports data:image/jpeg;base64,... or raw base64.
 */
export async function saveBase64Receipt(base64Data: string): Promise<{ filename: string; size: number; mimetype: string }> {
  let mimeType = 'image/jpeg';
  let cleanBase64 = base64Data;

  const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches) {
    mimeType = matches[1].toLowerCase();
    cleanBase64 = matches[2];
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AppError(
      400,
      'INVALID_FILE_TYPE',
      'Only JPEG, PNG, and WebP receipt images are supported.'
    );
  }

  const buffer = Buffer.from(cleanBase64, 'base64');

  if (buffer.length > 5 * 1024 * 1024) {
    throw new AppError(
      400,
      'FILE_TOO_LARGE',
      'Receipt image must be 5 MB or smaller.'
    );
  }

  let ext = '.jpg';
  if (mimeType === 'image/png') ext = '.png';
  if (mimeType === 'image/webp') ext = '.webp';

  const filename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(filePath, buffer);

  return {
    filename,
    size: buffer.length,
    mimetype: mimeType,
  };
}

/**
 * Returns the absolute path for a receipt, strictly preventing path traversal.
 */
export function getSafeReceiptPath(filenameOrKey: string): string | null {
  // Extract strictly the basename to prevent path traversal like ../../etc
  const safeFilename = path.basename(filenameOrKey);
  const targetPath = path.join(UPLOADS_DIR, safeFilename);

  // Verify the target path resides inside UPLOADS_DIR
  if (!targetPath.startsWith(UPLOADS_DIR)) {
    return null;
  }

  if (!fs.existsSync(targetPath)) {
    return null;
  }

  return targetPath;
}
