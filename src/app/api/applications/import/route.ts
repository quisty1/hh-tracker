// POST /api/applications/import — CSV-импорт (файл или JSON { csv })
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isValidStatus } from '@/lib/statuses';
import { requireSession } from '@/lib/session';

// Простой CSV-парсер: кавычки, "" как escape, разделитель запятая
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.trim());
      cell = '';
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
    } else if (ch !== '\r') {
      cell += ch;
    }
  }

  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);
  return rows;
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let csvText = '';
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file');
    if (file instanceof File) {
      csvText = await file.text();
    } else if (typeof form.get('csv') === 'string') {
      csvText = String(form.get('csv'));
    }
  } else {
    const body = await request.json().catch(() => null);
    csvText = typeof body?.csv === 'string' ? body.csv : '';
  }

  if (!csvText.trim()) {
    return NextResponse.json({ error: 'Пустой CSV' }, { status: 400 });
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return NextResponse.json(
      { error: 'Нужны заголовок и хотя бы одна строка' },
      { status: 400 },
    );
  }

  const header = rows[0].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  // Обязательные колонки в первой строке
  const required = ['vacancyName', 'employerName', 'appliedAt', 'status'];
  for (const col of required) {
    if (idx(col) === -1) {
      return NextResponse.json(
        { error: `Нет колонки ${col}` },
        { status: 400 },
      );
    }
  }

  let imported = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const cols = rows[i];
    const get = (name: string) => {
      const j = idx(name);
      return j >= 0 ? (cols[j] ?? '').trim() : '';
    };

    const status = get('status') || 'sent';
    if (!isValidStatus(status)) {
      errors.push(`Строка ${i + 1}: неизвестный статус ${status}`);
      continue;
    }

    const appliedAt = new Date(get('appliedAt'));
    if (Number.isNaN(appliedAt.getTime())) {
      errors.push(`Строка ${i + 1}: плохая дата appliedAt`);
      continue;
    }

    const vacancyName = get('vacancyName') || null;
    const employerName = get('employerName') || null;
    if (!vacancyName && !employerName) {
      errors.push(`Строка ${i + 1}: пустые vacancyName и employerName`);
      continue;
    }

    const salaryFromRaw = get('salaryFrom');
    const salaryToRaw = get('salaryTo');
    // isRemote: true/1/да/yes
    const isRemoteRaw = get('isRemote').toLowerCase();
    const isRemote =
      isRemoteRaw === 'true' ||
      isRemoteRaw === '1' ||
      isRemoteRaw === 'да' ||
      isRemoteRaw === 'yes';

    try {
      await prisma.application.create({
        data: {
          userId: session.userId,
          vacancyName,
          employerName,
          appliedAt,
          status,
          vacancyUrl: get('vacancyUrl') || null,
          areaName: get('areaName') || null,
          isRemote,
          salaryFrom: salaryFromRaw ? Number(salaryFromRaw) : null,
          salaryTo: salaryToRaw ? Number(salaryToRaw) : null,
          salaryCurrency: salaryFromRaw || salaryToRaw ? 'RUR' : null,
          notes: get('notes') || null,
          // Без колонки — уникальный ключ на строку импорта
          externalId: get('externalId') || `csv-${Date.now()}-${i}`,
        },
      });
      imported += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ошибка';
      errors.push(`Строка ${i + 1}: ${message}`);
    }
  }

  return NextResponse.json({ imported, errors });
}
