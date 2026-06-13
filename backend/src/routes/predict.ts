import { Router, Request, Response, NextFunction } from 'express';
import { LabelPenyakit } from '@prisma/client';
import prisma from '../prisma';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';
import { predictImage } from '../services/mlService';
import { generateAdvice } from '../services/geminiService';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

router.post('/', authMiddleware, uploadMiddleware.single('image'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  let processedFilePath: string | null = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const originalPath = req.file.path;
    const compressedFilename = `compressed-${Date.now()}-${req.file.filename.split('.').slice(0, -1).join('.')}.webp`;
    processedFilePath = path.join(path.dirname(originalPath), compressedFilename);

    // 1. Optimize Image (Compress to WebP)
    await sharp(originalPath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(processedFilePath);

    // 2. Parallelize External Service Calls
    // We start prediction with original or compressed? 
    // Usually ML models need specific size, but let's use original for accuracy if not too big, 
    // or compressed for speed. Let's use original for ML if possible, but for efficiency, 
    // we can use the compressed one if the ML service supports it.
    const [mlResponse, aiAdviceFallback] = await Promise.all([
      predictImage(processedFilePath), // Use compressed for speed & bandwidth
      // We can't call generateAdvice here because it needs the label from ML
      null 
    ]);

    const label = mlResponse.label.toUpperCase() as LabelPenyakit;
    
    // 3. Generate AI Advice (needs label from ML)
    const aiAdvice = await generateAdvice(label, mlResponse.confidence);

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Save Citra
      const citra = await tx.citra.create({
        data: {
          userId: req.user!.id,
          namaFile: compressedFilename, // Save the optimized filename
          ukuranFile: (await fs.promises.stat(processedFilePath!)).size,
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

    // Cleanup original file (only keep compressed)
    try {
      await fs.promises.unlink(originalPath);
    } catch (e) {
      console.error('Failed to cleanup original file', e);
    }

    res.status(201).json({
      message: 'Prediction successful',
      data: result,
    });
  } catch (error: any) {
    // Cleanup files on error
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (e) {}
    }
    if (processedFilePath) {
      try {
        await fs.promises.unlink(processedFilePath);
      } catch (e) {}
    }
    next(error);
  }
});

export default router;
