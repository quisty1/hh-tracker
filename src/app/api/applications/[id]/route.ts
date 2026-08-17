// PATCH|DELETE /api/applications/[id] — update (merge with existing) and delete
import { NextResponse } from 'next/server';
import {
  applicationPatchSchema,
  asStatus,
  toApplicationData,
} from '@/lib/applications';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await requireSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const appId = Number(id);
  if (Number.isNaN(appId)) {
    return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
  }

  const existing = await prisma.application.findFirst({
    where: { id: appId, userId: session.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = applicationPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' },
      { status: 400 },
    );
  }

  const p = parsed.data;

  try {
    // Partial patch: keep existing for undefined, then run through toApplicationData
    const data = toApplicationData(
      {
        vacancyName:
          p.vacancyName !== undefined ? p.vacancyName : existing.vacancyName,
        vacancyUrl:
          p.vacancyUrl !== undefined ? p.vacancyUrl : existing.vacancyUrl,
        vacancyId: p.vacancyId !== undefined ? p.vacancyId : existing.vacancyId,
        employerName:
          p.employerName !== undefined ? p.employerName : existing.employerName,
        employerId:
          p.employerId !== undefined ? p.employerId : existing.employerId,
        employerLogoUrl:
          p.employerLogoUrl !== undefined
            ? p.employerLogoUrl
            : existing.employerLogoUrl,
        areaName: p.areaName !== undefined ? p.areaName : existing.areaName,
        isRemote: p.isRemote !== undefined ? p.isRemote : existing.isRemote,
        salaryFrom:
          p.salaryFrom !== undefined ? p.salaryFrom : existing.salaryFrom,
        salaryTo: p.salaryTo !== undefined ? p.salaryTo : existing.salaryTo,
        salaryCurrency:
          p.salaryCurrency !== undefined
            ? p.salaryCurrency
            : existing.salaryCurrency,
        salaryGross:
          p.salaryGross !== undefined ? p.salaryGross : existing.salaryGross,
        status: p.status ?? asStatus(existing.status),
        appliedAt: p.appliedAt ?? existing.appliedAt.toISOString(),
        notes: p.notes !== undefined ? p.notes : existing.notes,
        externalId:
          p.externalId !== undefined ? p.externalId : existing.externalId,
      },
      session.userId,
    );

    // Do not update userId from the payload
    const { userId: _userId, ...update } = data;
    const app = await prisma.application.update({
      where: { id: appId },
      data: update,
    });
    return NextResponse.json(app);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Ошибка обновления';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const session = await requireSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const appId = Number(id);
  if (Number.isNaN(appId)) {
    return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
  }

  const existing = await prisma.application.findFirst({
    where: { id: appId, userId: session.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }

  await prisma.application.delete({ where: { id: appId } });
  return NextResponse.json({ ok: true });
}
