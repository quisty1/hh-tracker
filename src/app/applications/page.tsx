// SSR applications list + company list for the filter
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { ApplicationsActions } from '@/components/applications-actions';
import {
  ApplicationsTable,
  type ApplicationRow,
} from '@/components/applications-table';
import { Reveal } from '@/components/motion/reveal';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export default async function ApplicationsPage() {
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

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    orderBy: { appliedAt: 'desc' },
  });

  // Fields for the client table (dates as ISO strings)
  const rows: ApplicationRow[] = applications.map((app) => ({
    id: app.id,
    vacancyName: app.vacancyName,
    employerName: app.employerName,
    areaName: app.areaName,
    isRemote: app.isRemote,
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    vacancyUrl: app.vacancyUrl,
  }));

  const companies = [
    ...new Set(
      applications
        .map((a) => a.employerName)
        .filter((v): v is string => Boolean(v)),
    ),
  ].sort((a, b) => a.localeCompare(b, 'ru'));

  return (
    <>
      <AppHeader userName={user.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-10">
        <Reveal className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-semibold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-source-serif), serif' }}
            >
              Отклики
            </h1>
            <p className="mt-2 text-base text-muted">
              Ручной ввод, ссылка на вакансию или импорт CSV
            </p>
          </div>
          <ApplicationsActions />
        </Reveal>

        <ApplicationsTable applications={rows} companies={companies} />
      </main>
    </>
  );
}
