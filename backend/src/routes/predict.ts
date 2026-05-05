import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, LabelPenyakit } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';
import { predictImage } from '../services/mlService';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

router.post('/', authMiddleware, uploadMiddleware.single('image'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Call ML Service
    const mlResponse = await predictImage(req.file.path);

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Save Citra
      const citra = await tx.citra.create({
        data: {
          userId: req.user!.id,
          namaFile: req.file!.filename,
          ukuranFile: req.file!.size,
        },
      });

      // 2. Save HasilPrediksi
      // mlResponse fields: label, confidence, all_probs, process_time_ms
      const label = mlResponse.label.toUpperCase() as LabelPenyakit;
      
      const prediksi = await tx.hasilPrediksi.create({
        data: {
          citraId: citra.id,
          labelPenyakit: label,
          nilaiAkurasi: mlResponse.confidence,
          allProbs: mlResponse.all_probs,
          waktuProses: mlResponse.process_time_ms / 1000, 
        },
      });

      return { citra, prediksi };
    });

    res.status(201).json({
      message: 'Prediction successful',
      data: result,
    });
  } catch (error: any) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

export default router;
