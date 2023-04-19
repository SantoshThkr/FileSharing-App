import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';

const user = { name: 'Auth User', email: 'auth-user@test.local', password: 'password123' };

async function cleanUp() {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test.local' } } });
}

beforeAll(cleanUp);

afterAll(async () => {
  await cleanUp();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(user);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ name: user.name, email: user.email });
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('stores a hashed password', async () => {
    const saved = await prisma.user.findUnique({ where: { email: user.email } });

    expect(saved?.password).toBeDefined();
    expect(saved?.password).not.toBe(user.password);
  });

  it('rejects an email that is already registered', async () => {
    const res = await request(app).post('/api/auth/register').send(user);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: 'Email is already registered' });
  });

  it('validates the request body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Someone', email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Someone', email: 'short@test.local', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Password must be at least 8 characters');
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe(user.email);
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: 'Invalid email or password' });
  });
});

describe('GET /api/auth/me', () => {
  it('returns the logged in user', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: user.name, email: user.email });
  });

  it('requires a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign({ userId: 'some-id' }, 'test-secret', { expiresIn: -10 });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Session expired, please log in again');
  });
});
