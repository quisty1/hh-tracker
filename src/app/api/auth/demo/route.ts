// POST /api/auth/demo — вход без пароля: seed демо-данных + сессия
import { NextResponse } from 'next/server';
import { getOrCreateLocalUser } from '@/lib/auth';
import { seedDemoApplications } from '@/lib/demo-seed';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST() {
  try {
    const user = await getOrCreateLocalUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Демо Пользователь' },
    });
    // Перезаписывает все отклики пользователя
    await seedDemoApplications(user.id);

    const session = await getSession();
    session.userId = user.id;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось открыть демо';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
