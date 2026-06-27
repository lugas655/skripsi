import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import axios from 'axios';
import * as archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import prisma from '../prisma';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Apply auth and admin middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

/**
 * GET /api/admin/stats
 * Get general statistics for the admin dashboard
 */
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [userCount, citraCount, predictionCount] = await Promise.all([
      prisma.user.count(),
      prisma.citra.count(),
      prisma.hasilPrediksi.count(),
    ]);

    const diseaseStats = await prisma.hasilPrediksi.groupBy({
      by: ['labelPenyakit'],
      _count: {
        id: true,
      },
    });

    res.json({
      users: userCount,
      totalUploads: citraCount,
      totalPredictions: predictionCount,
      diseaseStats: diseaseStats.map(stat => ({
        label: stat.labelPenyakit,
        count: stat._count.id,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/health
 * Check status of external services (ML Service & Gemini API)
 */
router.get('/health', async (req: AuthRequest, res: Response) => {
  const health: any = {
    mlService: { status: 'offline', latency: 0 },
    geminiApi: { status: 'offline', latency: 0 },
  };

  // 1. Check ML Service
  const mlStart = Date.now();
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    await axios.get(`${mlUrl}/health`, { timeout: 3000 });
    health.mlService = { status: 'online', latency: Date.now() - mlStart };
  } catch (e) {
    health.mlService = { status: 'offline', latency: 0 };
  }

  // 2. Check Gemini API
  const geminiStart = Date.now();
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('No API Key');
    health.geminiApi = { 
      status: process.env.GEMINI_API_KEY ? 'online' : 'misconfigured', 
      latency: Date.now() - geminiStart 
    };
  } catch (e) {
    health.geminiApi = { status: 'offline', latency: 0 };
  }

  res.json(health);
});

/**
 * GET /api/admin/users
 * List all registered users
 */
router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: { citras: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/users
 * Create a new user (Admin only)
 */
const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  nama_lengkap: z.string().min(1),
  role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
});

router.post('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createUserSchema.parse(req.body);

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
        role: validatedData.role,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/users/:id/password
 * Change a user's password
 */
const changePasswordSchema = z.object({
  newPassword: z.string().min(6),
});

router.patch('/users/:id/password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = changePasswordSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user and all their related data (Citra & HasilPrediksi)
 */
router.delete('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent admin from deleting themselves
    if (userId === req.user?.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    // Use transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Get all citras to delete files later
      const citras = await tx.citra.findMany({
        where: { userId },
        select: { namaFile: true },
      });

      // 2. Delete HasilPrediksi related to user's citras
      await tx.hasilPrediksi.deleteMany({
        where: {
          citra: { userId },
        },
      });

      // 3. Delete Citras
      await tx.citra.deleteMany({
        where: { userId },
      });

      // 4. Delete User
      await tx.user.delete({
        where: { id: userId },
      });

      // 5. Cleanup files from disk (optional but recommended)
      for (const citra of citras) {
        const filePath = path.join(__dirname, '../../uploads', citra.namaFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    res.json({ message: 'User and all related data deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/uploads
 * List all uploaded images across all users
 */
router.get('/uploads', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const uploads = await prisma.citra.findMany({
      include: {
        user: {
          select: {
            username: true,
            nama_lengkap: true,
          },
        },
        hasilPrediksi: true,
      },
      orderBy: { tanggalUnggah: 'desc' },
    });
    res.json(uploads);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/uploads/download/:id
 * Download a single image
 */
router.get('/uploads/download/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const citraId = parseInt(req.params.id);
    const citra = await prisma.citra.findUnique({
      where: { id: citraId },
    });

    if (!citra) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../uploads', citra.namaFile);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, citra.namaFile);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/uploads/download-all
 * Download all images as a ZIP file
 */
router.get('/uploads/download-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const citras = await prisma.citra.findMany({
      select: { namaFile: true },
    });

    if (citras.length === 0) {
      return res.status(400).json({ message: 'No files to download' });
    }

    const archive = (archiver as any)('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    res.attachment('all-uploads.zip');

    archive.on('error', (err: any) => {
      throw err;
    });

    archive.pipe(res);

    for (const citra of citras) {
      const filePath = path.join(__dirname, '../../uploads', citra.namaFile);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: citra.namaFile });
      }
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/testimonials
 * List all testimonials for management
 */
router.get('/testimonials', async (req: AuthRequest, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
});

/**
 * DELETE /api/admin/testimonials/:id
 * Remove a testimonial
 */
router.delete('/testimonials/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.testimonial.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting testimonial' });
  }
});

/**
 * PATCH /api/admin/testimonials/:id/feature
 * Toggle isFeatured status
 */
router.patch('/testimonials/:id/feature', async (req: AuthRequest, res: Response) => {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    
    const updated = await prisma.testimonial.update({
      where: { id: parseInt(req.params.id) },
      data: { isFeatured: !testimonial.isFeatured },
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating testimonial' });
  }
});

export default router;
