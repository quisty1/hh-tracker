// POST /api/demo/seed — перезапись откликов текущего пользователя демо-набором
import { NextResponse } from 'next/server';
import { seedDemoApplications } from '@/lib/demo-seed';
import { requireSession } from '@/lib/session';

export async function POST() {
  const session = await requireSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = await seedDemoApplications(session.userId);
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
