import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { HttpError } from '../middleware/errorHandler';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSelect = { id: true, name: true, email: true, createdAt: true };

function createToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const name = readString(req.body.name);
    const email = readString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!name || !email || !password) {
      throw new HttpError(400, 'Name, email and password are required');
    }
    if (name.length > 100) {
      throw new HttpError(400, 'Name must be 100 characters or less');
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new HttpError(400, 'Please enter a valid email address');
    }
    if (password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }
    // bcrypt silently ignores everything after the first 72 bytes
    if (Buffer.byteLength(password) > 72) {
      throw new HttpError(400, 'Password is too long');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError(409, 'Email is already registered');
    }

    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10) },
      select: userSelect,
    });

    res.status(201).json({ success: true, data: { user, token: createToken(user.id) } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const email = readString(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpError(401, 'Invalid email or password');
    }

    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        token: createToken(user.id),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: userSelect });
    if (!user) {
      throw new HttpError(401, 'User not found');
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
