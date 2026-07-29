// POST /api/applications/from-url — создать отклик из ссылки HH через api.hh.ru
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  extractVacancyId,
  fetchVacancyById,
  VacancyFetchError,
} from '@/lib/hh/vacancy';
import { isValidStatus } from '@/lib/statuses';
import { requireSession } from '@/lib/session';

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { url?: string; status?: string; appliedAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  if (!body.url) {
    return NextResponse.json({ error: 'Укажи URL вакансии' }, { status: 400 });
  }

  const vacancyId = extractVacancyId(body.url);
  if (!vacancyId) {
    return NextResponse.json(
      { error: 'Не удалось извлечь id вакансии из ссылки' },
      { status: 400 },
    );
  }

  try {
    const vacancy = await fetchVacancyById(vacancyId);
    const appliedAt = body.appliedAt ? new Date(body.appliedAt) : new Date();
    if (Number.isNaN(appliedAt.getTime())) {
      return NextResponse.json(
        { error: 'Некорректная дата отклика' },
        { status: 400 },
      );
    }

    const status = body.status ?? 'sent';
    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: 'Неизвестный статус' },
        { status: 400 },
      );
    }

    const app = await prisma.application.create({
      data: {
        userId: session.userId,
        // Дедуп по вакансии HH для пользователя
        externalId: `vacancy-${vacancy.vacancyId}`,
        vacancyId: vacancy.vacancyId,
        vacancyName: vacancy.vacancyName,
        vacancyUrl: vacancy.vacancyUrl,
        employerId: vacancy.employerId,
        employerName: vacancy.employerName,
        employerLogoUrl: vacancy.employerLogoUrl,
        areaName: vacancy.areaName,
        isRemote: vacancy.isRemote,
        salaryFrom: vacancy.salaryFrom,
        salaryTo: vacancy.salaryTo,
        salaryCurrency: vacancy.salaryCurrency,
        salaryGross: vacancy.salaryGross,
        status,
        appliedAt,
      },
    });

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    if (error instanceof VacancyFetchError) {
      return NextResponse.json(
        {
          error: error.message,
          vacancyId,
          hint: 'Можно добавить отклик вручную, если hh не отдаёт вакансию',
        },
        { status: 502 },
      );
    }
    // Prisma unique constraint [userId, externalId]
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Отклик по этой вакансии уже есть' },
        { status: 409 },
      );
    }
    const message = error instanceof Error ? error.message : 'Ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
