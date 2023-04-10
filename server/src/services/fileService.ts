import fs from 'fs/promises';
import path from 'path';
import { Prisma } from '@prisma/client';
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

export const fileTypes: Record<string, string[]> = {
  pdf: ['application/pdf'],
  doc: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  txt: ['text/plain'],
  image: ['image/png', 'image/jpeg'],
  zip: ['application/zip', 'application/x-zip-compressed'],
};

interface ListOptions {
  search?: string;
  type?: string;
  page: number;
  limit: number;
}

export async function listFiles(userId: string, { search, type, page, limit }: ListOptions) {
  const where: Prisma.FileWhereInput = { userId };
  if (search) {
    where.originalName = { contains: search, mode: 'insensitive' };
  }
  if (type) {
    where.mimeType = { in: fileTypes[type] };
  }

  const [files, total] = await prisma.$transaction([
    prisma.file.findMany({
      where,
      select: fileSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.file.count({ where }),
  ]);

  return {
    files,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
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

export async function removeFile(file: { id: string; path: string }) {
  await fs.rm(getFilePath(file), { force: true });
  await prisma.file.delete({ where: { id: file.id } });
}
