import fs from 'fs/promises';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { createFile } from '../services/fileService';

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return next(new HttpError(400, 'Please choose a file to upload'));
  }

  try {
    const file = await createFile(req.userId!, req.file);
    res.status(201).json({ success: true, data: file });
  } catch (err) {
    await fs.rm(req.file.path, { force: true });
    next(err);
  }
}
