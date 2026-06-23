import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// Get all featured testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isFeatured: true },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6 // Limit to 6 latest
    });
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get my testimonials
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Return the first one as "myTestimonial" for simplicity, or all of them.
    // Assuming users only submit one or we just want the latest.
    res.json(testimonials[0] || null);
  } catch (error) {
    console.error('Error fetching my testimonial:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create testimonial
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, role, text, rating, avatar } = req.body;
  const userId = req.user?.id;
  
  try {
    if (userId) {
      // Check if user already has a testimonial
      const existing = await prisma.testimonial.findFirst({ where: { userId } });
      if (existing) {
        return res.status(400).json({ message: 'User already has a testimonial. Please update instead.' });
      }
    }

    const testimonial = await prisma.testimonial.create({
      data: { name, role, text, rating, avatar, userId }
    });
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(400).json({ message: 'Bad request' });
  }
});

// Update my testimonial
router.put('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { text, rating } = req.body;
  const userId = req.user?.id;
  
  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const existing = await prisma.testimonial.findFirst({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const updated = await prisma.testimonial.update({
      where: { id: existing.id },
      data: { text, rating }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(400).json({ message: 'Bad request' });
  }
});

export default router;
