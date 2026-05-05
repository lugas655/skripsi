import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  nama_lengkap: z.string().min(1),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        password: hashedPassword,
        nama_lengkap: validatedData.nama_lengkap,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        nama_lengkap: user.nama_lengkap,
        avatar: user.avatar 
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
});

const profileSchema = z.object({
  nama_lengkap: z.string().min(1),
});

router.put('/profile', authMiddleware, uploadMiddleware.single('avatar'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = profileSchema.parse(req.body);
    const userId = req.user!.id;

    const updateData: any = {
      nama_lengkap: validatedData.nama_lengkap,
    };

    if (req.file) {
      updateData.avatar = req.file.filename;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        nama_lengkap: updatedUser.nama_lengkap,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
});

export default router;
