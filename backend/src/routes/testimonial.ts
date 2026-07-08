import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

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

// Zod validation schemas
const createTestimonialSchema = z.object({
  text: z.string().min(10, 'Ulasan minimal 10 karakter').max(500, 'Ulasan maksimal 500 karakter'),
  rating: z.number().int().min(1).max(5),
});

const updateTestimonialSchema = z.object({
  text: z.string().min(10, 'Ulasan minimal 10 karakter').max(500, 'Ulasan maksimal 500 karakter'),
  rating: z.number().int().min(1).max(5),
});

// Create testimonial
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const validatedData = createTestimonialSchema.parse(req.body);

    // Check if user already has a testimonial
    const existing = await prisma.testimonial.findFirst({ where: { userId } });
    if (existing) {
      return res.status(400).json({ message: 'User already has a testimonial. Please update instead.' });
    }

    // Fetch user data from DB to prevent spoofing name/role
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { nama_lengkap: true } });

    const testimonial = await prisma.testimonial.create({
      data: {
        name: user?.nama_lengkap || 'Pengguna',
        role: 'Pengguna AyamSehat.AI',
        text: validatedData.text,
        rating: validatedData.rating,
        userId,
      }
    });
    res.status(201).json(testimonial);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Error creating testimonial:', error);
    res.status(400).json({ message: 'Bad request' });
  }
});

// Update my testimonial
router.put('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const validatedData = updateTestimonialSchema.parse(req.body);

    const existing = await prisma.testimonial.findFirst({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const updated = await prisma.testimonial.update({
      where: { id: existing.id },
      data: { text: validatedData.text, rating: validatedData.rating }
    });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Error updating testimonial:', error);
    res.status(400).json({ message: 'Bad request' });
  }
});

export default router;
