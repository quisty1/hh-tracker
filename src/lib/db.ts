import { PrismaClient } from '@prisma/client';

// Prisma singleton: one instance across HMR reloads in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// In production, skip globalThis — the process starts once (no HMR)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
