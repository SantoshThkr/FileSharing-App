import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { HttpError } from '../middleware/errorHandler';

const userSelect = { id: true, name: true, email: true, createdAt: true };

function createToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new HttpError(400, 'Name, email and password are required');
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
    const { email, password } = req.body;
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
