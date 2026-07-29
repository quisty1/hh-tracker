// SSR-дашборд: KPI и графики по откликам текущего пользователя
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { DashboardCharts } from '@/components/charts/dashboard-charts';
import { EmptyDashboard } from '@/components/empty-dashboard';
import { LoadDemoButton } from '@/components/load-demo-button';
import { MetricsRow } from '@/components/metrics-row';
import { Reveal } from '@/components/motion/reveal';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { getDashboardStats } from '@/lib/stats';

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session?.userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    redirect('/login');
  }

  const stats = await getDashboardStats(session.userId);

  return (
    <>
      <AppHeader userName={user.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-10">
        <Reveal className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-source-serif), serif' }}
            >
              Дашборд
            </h1>
            <p className="mt-2 text-base text-muted">
              Статистика по сохранённым откликам
            </p>
          </div>
          <LoadDemoButton />
        </Reveal>

        {stats.total === 0 ? (
          <EmptyDashboard />
        ) : (
          <>
            <MetricsRow
              items={[
                { label: 'Всего', value: stats.total },
                { label: 'За 7 дней', value: stats.last7 },
                { label: 'За 30 дней', value: stats.last30 },
                { label: 'Компаний', value: stats.uniqueCompanies },
                {
                  label: 'В процессе',
                  value: stats.invitationLike,
                  hint: 'приглашение / интервью / оффер',
                },
                {
                  label: 'Отказы',
                  value: stats.discardLike,
                },
              ]}
            />

            <DashboardCharts
              data={{
                byDay: stats.byDay,
                byStatus: stats.byStatus,
                topCompanies: stats.topCompanies,
                byWeekday: stats.byWeekday,
              }}
            />
          </>
        )}
      </main>
    </>
  );
}
