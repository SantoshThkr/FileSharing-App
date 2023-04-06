import fs from 'fs/promises';
import { existsSync } from 'fs';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { createFile, findUserFile, getFilePath, listFiles } from '../services/fileService';

export async function getFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const files = await listFiles(req.userId!);
    res.json({ success: true, data: { files } });
  } catch (err) {
    next(err);
  }
}

export async function getFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, originalName, mimeType, size, createdAt } = await findUserFile(
      req.userId!,
      req.params.id
    );
    res.json({ success: true, data: { id, originalName, mimeType, size, createdAt } });
  } catch (err) {
    next(err);
  }
}

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

export async function downloadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const file = await findUserFile(req.userId!, req.params.id);
    const filePath = getFilePath(file);

    if (!existsSync(filePath)) {
      throw new HttpError(404, 'File is missing from storage');
    }

    res.download(filePath, file.originalName, err => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
}
