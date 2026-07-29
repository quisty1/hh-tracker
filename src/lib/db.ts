import { PrismaClient } from '@prisma/client';

// Singleton Prisma: в dev один инстанс между HMR-перезагрузками
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// В production не кладём клиент в globalThis — процесс живёт один раз
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
