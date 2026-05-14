import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance to be shared across the app.
// This avoids opening many connections and improves performance.
const prisma = new PrismaClient({
  // Enable detailed query logging in development only.
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

export default prisma;
