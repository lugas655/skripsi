import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
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

// Admin: Create testimonial (optional for now, can be used via postman)
router.post('/', async (req, res) => {
  const { name, role, text, rating, avatar } = req.body;
  try {
    const testimonial = await prisma.testimonial.create({
      data: { name, role, text, rating, avatar }
    });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: 'Bad request' });
  }
});

export default router;
