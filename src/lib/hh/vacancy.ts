// Клиент HH API: разбор URL вакансии и загрузка превью для создания отклика

export class VacancyFetchError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'VacancyFetchError';
  }
}

// Чистый id или фрагмент /vacancy/{id} из URL hh.ru
export function extractVacancyId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/vacancy\/(\d+)/);
    return match?.[1] ?? null;
  } catch {
    // Невалидный URL — ищем id в сырой строке
    const match = trimmed.match(/vacancy\/(\d+)/);
    return match?.[1] ?? null;
  }
}

export type VacancyPreview = {
  vacancyId: string;
  vacancyName: string | null;
  vacancyUrl: string | null;
  employerId: string | null;
  employerName: string | null;
  employerLogoUrl: string | null;
  areaName: string | null;
  isRemote: boolean;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryCurrency: string | null;
  salaryGross: boolean | null;
};

// Урезанный ответ GET /vacancies/{id}
type HhVacancyResponse = {
  id: string;
  name?: string;
  alternate_url?: string;
  area?: { name?: string } | null;
  schedule?: { id?: string; name?: string } | null;
  work_format?: Array<{ id?: string; name?: string }> | null;
  salary?: {
    from?: number | null;
    to?: number | null;
    currency?: string | null;
    gross?: boolean | null;
  } | null;
  employer?: {
    id?: string;
    name?: string;
    logo_urls?: {
      original?: string;
      '90'?: string;
      '240'?: string;
    } | null;
  } | null;
};

// Удалёнка: schedule.remote или work_format REMOTE / «удал…»
function detectIsRemote(data: HhVacancyResponse): boolean {
  if (data.schedule?.id === 'remote') return true;
  if (
    data.work_format?.some(
      (f) =>
        f.id === 'REMOTE' || f.id === 'remote' || /удал/i.test(f.name ?? ''),
    )
  ) {
    return true;
  }
  return false;
}

export async function fetchVacancyById(
  vacancyId: string,
): Promise<VacancyPreview> {
  // HH требует идентифицирующий User-Agent (и заголовок HHUserAgent)
  const userAgent =
    process.env.HH_USER_AGENT ?? 'HhTracker/1.0 (local@example.com)';

  const res = await fetch(`https://api.hh.ru/vacancies/${vacancyId}`, {
    headers: {
      'User-Agent': userAgent,
      HHUserAgent: userAgent,
      Accept: 'application/json',
    },
    // Без кеша Next — всегда свежие данные вакансии
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new VacancyFetchError(
      `Не удалось загрузить вакансию: ${res.status} ${text.slice(0, 160)}`,
      res.status,
    );
  }

  const data = (await res.json()) as HhVacancyResponse;
  const employer = data.employer;

  return {
    vacancyId: String(data.id),
    vacancyName: data.name ?? null,
    vacancyUrl: data.alternate_url ?? `https://hh.ru/vacancy/${data.id}`,
    employerId: employer?.id ? String(employer.id) : null,
    employerName: employer?.name ?? null,
    // Предпочитаем маленький логотип для таблицы
    employerLogoUrl:
      employer?.logo_urls?.['90'] ??
      employer?.logo_urls?.['240'] ??
      employer?.logo_urls?.original ??
      null,
    areaName: data.area?.name ?? null,
    isRemote: detectIsRemote(data),
    salaryFrom: data.salary?.from ?? null,
    salaryTo: data.salary?.to ?? null,
    salaryCurrency: data.salary?.currency ?? null,
    salaryGross: data.salary?.gross ?? null,
  };
}
