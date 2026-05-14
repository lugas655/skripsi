import { Router, Request, Response, NextFunction } from 'express';
import { LabelPenyakit } from '@prisma/client';
import prisma from '../prisma';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';
import { predictImage } from '../services/mlService';
import { generateAdvice } from '../services/geminiService';
import fs from 'fs';

const router = Router();

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
    const label = mlResponse.label.toUpperCase() as LabelPenyakit;
    
    // Generate AI Advice
    const aiAdvice = await generateAdvice(label, mlResponse.confidence);

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
      const prediksi = await tx.hasilPrediksi.create({
        data: {
          citraId: citra.id,
          labelPenyakit: label,
          nilaiAkurasi: mlResponse.confidence,
          allProbs: mlResponse.all_probs,
          saranAI: aiAdvice,
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
    // Async cleanup of uploaded file if error occurs
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (e) {
        console.error('Failed to cleanup file on error', e);
      }
    }
    next(error);
  }
});

export default router;
