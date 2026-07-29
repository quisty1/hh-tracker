// SSR-карточка отклика: форматирование полей + клиентский ApplicationDetailView
import { notFound, redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { ApplicationDetailView } from '@/components/application-detail-view';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { statusLabel } from '@/lib/statuses';

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | null) {
  if (!value) return '—';
  return value.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSalary(app: {
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryCurrency: string | null;
  salaryGross: boolean | null;
}) {
  if (app.salaryFrom == null && app.salaryTo == null) return null;
  const currency = app.salaryCurrency ?? 'RUR';
  const from =
    app.salaryFrom != null ? app.salaryFrom.toLocaleString('ru-RU') : null;
  const to = app.salaryTo != null ? app.salaryTo.toLocaleString('ru-RU') : null;
  let text = '';
  if (from && to) text = `${from} – ${to}`;
  else if (from) text = `от ${from}`;
  else if (to) text = `до ${to}`;
  text += ` ${currency}`;
  if (app.salaryGross === true) text += ' до вычета НДФЛ';
  if (app.salaryGross === false) text += ' на руки';
  return text;
}

export default async function ApplicationDetailPage({ params }: Props) {
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

  const { id } = await params;
  const appId = Number(id);
  if (Number.isNaN(appId)) {
    notFound();
  }

  const application = await prisma.application.findFirst({
    where: { id: appId, userId: session.userId },
  });

  if (!application) {
    notFound();
  }

  const salary = formatSalary(application);

  // areaName вида «Удалённо» не показываем как город — это флаг формата
  const fields = [
    { label: 'Дата отклика', value: formatDate(application.appliedAt) },
    { label: 'Статус', value: statusLabel(application.status) },
    ...(salary ? [{ label: 'Зарплата', value: salary }] : []),
    {
      label: 'Город',
      value:
        application.areaName && !/^удал/i.test(application.areaName)
          ? application.areaName
          : '—',
    },
    {
      label: 'Формат',
      value:
        application.isRemote ||
        (application.areaName != null && /^удал/i.test(application.areaName))
          ? 'Удалённо'
          : 'Офис',
    },
    { label: 'Заметки', value: application.notes?.trim() || '—' },
  ];

  return (
    <>
      <AppHeader userName={user.name} />
      <ApplicationDetailView
        id={application.id}
        vacancyName={application.vacancyName}
        employerName={application.employerName}
        areaName={
          application.areaName && !/^удал/i.test(application.areaName)
            ? application.areaName
            : null
        }
        isRemote={
          application.isRemote ||
          (application.areaName != null && /^удал/i.test(application.areaName))
        }
        employerLogoUrl={application.employerLogoUrl}
        vacancyUrl={application.vacancyUrl}
        status={application.status}
        appliedAt={application.appliedAt.toISOString()}
        notes={application.notes}
        salaryText={salary}
        fields={fields}
      />
    </>
  );
}
