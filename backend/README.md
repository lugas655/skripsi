# Backend - Chicken Feces Classification

Built with Node.js, Express, TypeScript, and Prisma ORM.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` in `.env` to match your PostgreSQL instance.

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Folder Structure

- `src/controllers`: Request handlers
- `src/routes`: API route definitions
- `src/services`: Business logic and external service calls
- `src/middlewares`: Express middlewares (Auth, Validation, etc.)
- `src/utils`: Helper functions
- `prisma/`: Database schema and migrations
