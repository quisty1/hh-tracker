import { prisma } from '@/lib/db';
import { statusLabel } from '@/lib/statuses';

// Индексы совпадают с Date.getDay(): 0 = Вс … 6 = Сб
const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

// Агрегаты дашборда для пользователя
export async function getDashboardStats(userId: number) {
  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { appliedAt: 'asc' },
  });

  const now = new Date();
  const d7 = daysAgo(7);
  const d30 = daysAgo(30);

  const total = applications.length;
  const last7 = applications.filter((a) => a.appliedAt >= d7).length;
  const last30 = applications.filter((a) => a.appliedAt >= d30).length;

  const companies = new Set(
    applications.map((a) => a.employerName).filter(Boolean),
  );

  // «Позитивные» статусы для KPI приглашений
  const invitationLike = applications.filter((a) =>
    ['invite', 'interview', 'offer'].includes(a.status),
  ).length;

  const discardLike = applications.filter((a) => a.status === 'reject').length;

  // Заполняем все дни окна заранее, чтобы на графике не было дыр
  const byDayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i -= 1) {
    const d = daysAgo(i);
    byDayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const app of applications) {
    const key = startOfDay(app.appliedAt).toISOString().slice(0, 10);
    if (byDayMap.has(key)) {
      byDayMap.set(key, (byDayMap.get(key) ?? 0) + 1);
    }
  }
  const byDay = [...byDayMap.entries()].map(([date, count]) => ({
    date,
    // MM-DD для подписей оси
    label: date.slice(5),
    count,
  }));

  const statusMap = new Map<string, number>();
  for (const app of applications) {
    const key = statusLabel(app.status);
    statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
  }
  const byStatus = [...statusMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const companyMap = new Map<string, number>();
  for (const app of applications) {
    const key = app.employerName ?? 'Неизвестно';
    companyMap.set(key, (companyMap.get(key) ?? 0) + 1);
  }
  const topCompanies = [...companyMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const weekdayCounts = Array.from({ length: 7 }, () => 0);
  for (const app of applications) {
    weekdayCounts[app.appliedAt.getDay()] += 1;
  }
  // Пн→Вс: [1,2,3,4,5,6,0] вместо порядка JS (Вс первым)
  const byWeekday = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    name: DAY_NAMES[day],
    count: weekdayCounts[day],
  }));

  return {
    total,
    last7,
    last30,
    uniqueCompanies: companies.size,
    invitationLike,
    discardLike,
    byDay,
    byStatus,
    topCompanies,
    byWeekday,
    generatedAt: now.toISOString(),
  };
}
