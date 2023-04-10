import fs from 'fs/promises';
import { existsSync } from 'fs';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import {
  createFile,
  findUserFile,
  getFilePath,
  listFiles,
  removeFile,
} from '../services/fileService';

function toPositiveInt(value: unknown, fallback: number) {
  const number = parseInt(String(value), 10);
  return number > 0 ? number : fallback;
}

export async function getFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, type } = req.query;
    const result = await listFiles(req.userId!, {
      search: typeof search === 'string' ? search.trim() : undefined,
      type: typeof type === 'string' ? type : undefined,
      page: toPositiveInt(req.query.page, 1),
      limit: Math.min(toPositiveInt(req.query.limit, 10), 50),
    });
    res.json({ success: true, data: result });
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

export async function deleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const file = await findUserFile(req.userId!, req.params.id);
    await removeFile(file);
    res.json({ success: true, data: { id: file.id } });
  } catch (err) {
    next(err);
  }
}
