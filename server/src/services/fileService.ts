import path from 'path';
import { prisma } from '../prisma';
import { HttpError } from '../middleware/errorHandler';
import { uploadDir } from '../middleware/upload';

export const fileSelect = {
  id: true,
  originalName: true,
  mimeType: true,
  size: true,
  createdAt: true,
};

export function listFiles(userId: string) {
  return prisma.file.findMany({
    where: { userId },
    select: fileSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function findUserFile(userId: string, id: string) {
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    throw new HttpError(404, 'File not found');
  }
  if (file.userId !== userId) {
    throw new HttpError(403, 'You do not have access to this file');
  }
  return file;
}

export function getFilePath(file: { path: string }) {
  return path.join(uploadDir, file.path);
}

export function createFile(userId: string, upload: Express.Multer.File) {
  return prisma.file.create({
    data: {
      userId,
      originalName: upload.originalname,
      storedName: upload.filename,
      mimeType: upload.mimetype,
      size: upload.size,
      path: `${userId}/${upload.filename}`,
    },
    select: fileSelect,
  });
}
