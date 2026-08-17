// POST /api/auth/login — verify APP_PASSWORD and create a session
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateLocalUser } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: 'APP_PASSWORD не задан в .env' },
      { status: 500 },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  if (!body.password || body.password !== password) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  const user = await getOrCreateLocalUser();
  const session = await getSession();
  session.userId = user.id;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
