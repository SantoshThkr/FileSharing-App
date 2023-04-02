import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'File is larger than 10 MB' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
}
