import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { HttpError } from './errorHandler';

export const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.txt': ['text/plain'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.zip': ['application/zip', 'application/x-zip-compressed'],
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(uploadDir, req.userId as string);
    fs.mkdir(dir, { recursive: true }, err => cb(err, dir));
  },
  filename(req, file, cb) {
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
  },
});

export const upload = multer({
  storage,
  defParamCharset: 'utf8',
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes[ext]?.includes(file.mimetype)) {
      return cb(new HttpError(400, 'This file type is not supported'));
    }
    cb(null, true);
  },
});
