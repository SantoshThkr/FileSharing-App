import fs from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';
import { uploadDir } from '../src/middleware/upload';

let ownerToken: string;
let otherToken: string;
const fileIds: Record<string, string> = {};

async function cleanUp() {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test.local' } } });
}

async function registerUser(email: string) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'File User', email, password: 'password123' });
  return res.body.data.token as string;
}

function uploadFile(
  token: string,
  content: string | Buffer,
  filename: string,
  contentType: string
) {
  return request(app)
    .post('/api/files')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from(content), { filename, contentType });
}

beforeAll(async () => {
  await cleanUp();
  ownerToken = await registerUser('owner@test.local');
  otherToken = await registerUser('other@test.local');

  const fixtures = [
    ['resume.pdf', 'application/pdf'],
    ['notes.txt', 'text/plain'],
    ['photo.png', 'image/png'],
  ];
  for (const [name, type] of fixtures) {
    const res = await uploadFile(ownerToken, `content of ${name}`, name, type);
    fileIds[name] = res.body.data.id;
  }

  const res = await uploadFile(otherToken, 'private', 'other-user.txt', 'text/plain');
  fileIds['other-user.txt'] = res.body.data.id;
});

afterAll(async () => {
  await cleanUp();
  await prisma.$disconnect();
  fs.rmSync(uploadDir, { recursive: true, force: true });
});

describe('POST /api/files', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/files')
      .attach('file', Buffer.from('hello'), { filename: 'hello.txt', contentType: 'text/plain' });

    expect(res.status).toBe(401);
  });

  it('stores the file on disk under a generated name', async () => {
    const res = await uploadFile(
      ownerToken,
      'quarterly numbers',
      'report.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ originalName: 'report.docx', size: 17 });

    const saved = await prisma.file.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(saved.storedName).not.toBe('report.docx');
    expect(saved.storedName).toMatch(/^[0-9a-f-]{36}\.docx$/);
    expect(fs.existsSync(path.join(uploadDir, saved.path))).toBe(true);
  });

  it('rejects unsupported file types', async () => {
    const res = await uploadFile(ownerToken, 'MZ', 'setup.exe', 'application/x-msdownload');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'This file type is not supported' });
  });

  it('rejects files whose mime type does not match the extension', async () => {
    const res = await uploadFile(ownerToken, 'not really a pdf', 'fake.pdf', 'text/html');

    expect(res.status).toBe(400);
  });

  it('rejects files larger than 10 MB', async () => {
    const bigFile = Buffer.alloc(10 * 1024 * 1024 + 1);

    const res = await uploadFile(ownerToken, bigFile, 'big.pdf', 'application/pdf');

    expect(res.status).toBe(413);
    expect(res.body.message).toBe('File is larger than 10 MB');
  });

  it('returns 400 when no file is sent', async () => {
    const res = await request(app)
      .post('/api/files')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('name', 'nothing');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please choose a file to upload');
  });
});

describe('GET /api/files', () => {
  it('only returns files that belong to the user', async () => {
    const res = await request(app).get('/api/files').set('Authorization', `Bearer ${ownerToken}`);

    const names = res.body.data.files.map((file: { originalName: string }) => file.originalName);
    expect(res.status).toBe(200);
    expect(names).toEqual(expect.arrayContaining(['resume.pdf', 'notes.txt', 'photo.png']));
    expect(names).not.toContain('other-user.txt');
  });

  it('searches by file name', async () => {
    const res = await request(app)
      .get('/api/files?search=RESUME')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.body.data.files).toHaveLength(1);
    expect(res.body.data.files[0].originalName).toBe('resume.pdf');
  });

  it('filters by file type', async () => {
    const res = await request(app)
      .get('/api/files?type=image')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.body.data.files.map((file: { originalName: string }) => file.originalName)).toEqual([
      'photo.png',
    ]);
  });

  it('paginates results', async () => {
    const res = await request(app)
      .get('/api/files?page=2&limit=2')
      .set('Authorization', `Bearer ${ownerToken}`);

    const { total } = res.body.data.pagination;
    expect(res.body.data.files.length).toBe(Math.min(2, total - 2));
    expect(res.body.data.pagination).toEqual({
      page: 2,
      limit: 2,
      total,
      totalPages: Math.ceil(total / 2),
    });
  });

  it('rejects an unknown type filter', async () => {
    const res = await request(app)
      .get('/api/files?type=exe')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/files/:id', () => {
  it('returns file details to the owner', async () => {
    const res = await request(app)
      .get(`/api/files/${fileIds['notes.txt']}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ originalName: 'notes.txt', mimeType: 'text/plain' });
    expect(res.body.data.path).toBeUndefined();
  });

  it("does not return another user's file", async () => {
    const res = await request(app)
      .get(`/api/files/${fileIds['notes.txt']}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/files/:id/download', () => {
  it('downloads the file with its original name', async () => {
    const res = await request(app)
      .get(`/api/files/${fileIds['notes.txt']}/download`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toBe('content of notes.txt');
    expect(res.headers['content-disposition']).toContain('notes.txt');
  });

  it("blocks downloads of another user's file", async () => {
    const res = await request(app)
      .get(`/api/files/${fileIds['other-user.txt']}/download`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You do not have access to this file');
  });

  it('returns 404 for a file that does not exist', async () => {
    const res = await request(app)
      .get('/api/files/missing-id/download')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/files/:id', () => {
  it('does not let another user delete the file', async () => {
    const res = await request(app)
      .delete(`/api/files/${fileIds['resume.pdf']}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(await prisma.file.findUnique({ where: { id: fileIds['resume.pdf'] } })).not.toBeNull();
  });

  it('removes the file from disk and the database', async () => {
    const saved = await prisma.file.findUniqueOrThrow({ where: { id: fileIds['resume.pdf'] } });

    const res = await request(app)
      .delete(`/api/files/${saved.id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(fs.existsSync(path.join(uploadDir, saved.path))).toBe(false);
    expect(await prisma.file.findUnique({ where: { id: saved.id } })).toBeNull();
  });

  it('still deletes the record when the file is already missing on disk', async () => {
    const saved = await prisma.file.findUniqueOrThrow({ where: { id: fileIds['photo.png'] } });
    fs.rmSync(path.join(uploadDir, saved.path));

    const res = await request(app)
      .delete(`/api/files/${saved.id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(await prisma.file.findUnique({ where: { id: saved.id } })).toBeNull();
  });
});
