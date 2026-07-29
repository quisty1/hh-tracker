import { prisma } from '@/lib/db';

// Один пользователь на инстанс с ключом loginKey = 'local'
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
