import { prisma } from '../prisma';

export const fileSelect = {
  id: true,
  originalName: true,
  mimeType: true,
  size: true,
  createdAt: true,
};

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
