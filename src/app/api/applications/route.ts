// POST /api/applications — create an application by hand (Zod)
import { NextResponse } from 'next/server';
import { applicationInputSchema, toApplicationData } from '@/lib/applications';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = applicationInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' },
      { status: 400 },
    );
  }

  try {
    const data = toApplicationData(parsed.data, session.userId);
    if (!data.vacancyName && !data.employerName) {
      return NextResponse.json(
        { error: 'Укажи название вакансии или компанию' },
        { status: 400 },
      );
    }
    const app = await prisma.application.create({ data });
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка создания';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
