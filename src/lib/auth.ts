import { prisma } from '@/lib/db';

// One user per instance, keyed by loginKey = 'local'
export async function getOrCreateLocalUser() {
  return prisma.user.upsert({
    where: { loginKey: 'local' },
    create: {
      loginKey: 'local',
      name: 'Я',
    },
    update: {},
  });
}
