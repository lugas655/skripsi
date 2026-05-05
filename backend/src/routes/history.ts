import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

// 1. STATS ROUTE MUST BE AT THE TOP (To avoid being caught by /:id)
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user!.id);
    console.log(`[DEBUG] Fetching stats for userId: ${userId}`);

    const totalDiagnoses = await prisma.citra.count({
      where: { userId },
    });

    const labelCounts = await prisma.hasilPrediksi.groupBy({
      by: ['labelPenyakit'],
      where: {
        citra: { userId },
      },
      _count: {
        labelPenyakit: true,
      },
    });

    const recentChecks = await prisma.citra.findMany({
      where: { userId },
      include: { hasilPrediksi: true },
      orderBy: { tanggalUnggah: 'desc' },
      take: 5,
    });

    res.json({
      totalDiagnoses,
      labelCounts: labelCounts.reduce((acc: Record<string, number>, curr: any) => {
        acc[curr.labelPenyakit] = curr._count.labelPenyakit;
        return acc;
      }, {}),
      recentChecks,
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET ALL HISTORY
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = await prisma.citra.findMany({
      where: { userId: req.user!.id },
      include: {
        hasilPrediksi: true,
      },
      orderBy: {
        tanggalUnggah: 'desc',
      },
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// 3. GET DETAIL BY ID (MUST BE BELOW /stats)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const detail = await prisma.citra.findFirst({
      where: {
        id: id,
        userId: req.user!.id,
      },
      include: {
        hasilPrediksi: true,
      },
    });

    if (!detail) {
      return res.status(404).json({ message: 'History not found' });
    }

    res.json(detail);
  } catch (error) {
    next(error);
  }
});

export default router;
