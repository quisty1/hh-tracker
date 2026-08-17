'use client';

// Applications table: client-side filters, sort, and pagination
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ClearableInput } from '@/components/clearable-field';
import { Reveal } from '@/components/motion/reveal';
import { StatusBadge } from '@/components/status-badge';
import { APPLICATION_STATUSES } from '@/lib/statuses';

// Serializable row for SSR → client
export type ApplicationRow = {
  id: number;
  vacancyName: string | null;
  employerName: string | null;
  areaName: string | null;
  isRemote: boolean;
  status: string;
  appliedAt: string;
  vacancyUrl: string | null;
};

type Props = {
  applications: ApplicationRow[];
  companies: string[];
};

type SortKey =
  | 'appliedAt'
  | 'vacancyName'
  | 'employerName'
  | 'areaName'
  | 'format'
  | 'status';

type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [5, 10, 30, 50, 100] as const;

// By date — newest first; otherwise A→Z
function initialSortDir(key: SortKey): SortDir {
  return key === 'appliedAt' ? 'desc' : 'asc';
}

const fieldClass =
  'rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20';

// Legacy data: remote work may have been stored in areaName
function isRemoteLabel(areaName: string | null) {
  return areaName != null && /^удал/i.test(areaName.trim());
}

function displayCity(app: ApplicationRow) {
  if (!app.areaName || isRemoteLabel(app.areaName)) return '—';
  return app.areaName;
}

function displayRemote(app: ApplicationRow) {
  return app.isRemote || isRemoteLabel(app.areaName);
}

function formatLabel(app: ApplicationRow) {
  return displayRemote(app) ? 'Удалённо' : 'Офис';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function compareRows(a: ApplicationRow, b: ApplicationRow, key: SortKey) {
  switch (key) {
    case 'appliedAt':
      return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
    case 'vacancyName':
      return (a.vacancyName ?? '').localeCompare(b.vacancyName ?? '', 'ru');
    case 'employerName':
      return (a.employerName ?? '').localeCompare(b.employerName ?? '', 'ru');
    case 'areaName':
      return displayCity(a).localeCompare(displayCity(b), 'ru');
    case 'format':
      return Number(displayRemote(a)) - Number(displayRemote(b));
    case 'status':
      return a.status.localeCompare(b.status, 'ru');
    default:
      return 0;
  }
}

const SORT_HEADERS: { key: SortKey; label: string }[] = [
  { key: 'appliedAt', label: 'Дата' },
  { key: 'vacancyName', label: 'Вакансия' },
  { key: 'employerName', label: 'Компания' },
  { key: 'areaName', label: 'Город' },
  { key: 'format', label: 'Формат' },
  { key: 'status', label: 'Статус' },
];

function getPageItems(
  page: number,
  pageCount: number,
): Array<number | 'ellipsis'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const left = Math.max(2, page - 1);
  const right = Math.min(pageCount - 1, page + 1);

  if (left > 2) items.push('ellipsis');
  for (let i = left; i <= right; i += 1) items.push(i);
  if (right < pageCount - 1) items.push('ellipsis');
  items.push(pageCount);

  return items;
}

const pageBtnClass =
  'min-w-8 rounded-md border border-border bg-surface px-2 py-1.5 text-foreground transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40';

export function ApplicationsTable({ applications, companies }: Props) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [company, setCompany] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>('appliedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [pageDraft, setPageDraft] = useState('1');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((app) => {
      if (status !== 'all' && app.status !== status) return false;
      if (company !== 'all' && app.employerName !== company) return false;

      if (from) {
        const fromDate = new Date(from);
        if (new Date(app.appliedAt) < fromDate) return false;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(app.appliedAt) > toDate) return false;
      }

      if (!q) return true;
      const hay =
        `${app.vacancyName ?? ''} ${app.employerName ?? ''} ${displayCity(app)} ${formatLabel(app)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [applications, query, status, company, from, to]);

  const sorted = useMemo(() => {
    if (sortKey === null) return filtered;
    const rows = [...filtered];
    rows.sort((a, b) => {
      const cmp = compareRows(a, b, sortKey);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, status, company, from, to, sortKey, sortDir, pageSize]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    setPageDraft(String(page));
  }, [page]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const rangeStart = sorted.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, sorted.length);
  const pageItems = useMemo(
    () => getPageItems(page, pageCount),
    [page, pageCount],
  );

  function applyPageDraft() {
    const n = Number.parseInt(pageDraft.trim(), 10);
    if (!Number.isFinite(n) || n < 1 || n > pageCount) {
      setPageDraft(String(page));
      return;
    }
    setPage(n);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      const firstDir = initialSortDir(key);
      if (sortDir !== firstDir) {
        setSortKey(null);
        return;
      }
      setSortDir(firstDir === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortKey(key);
    setSortDir(initialSortDir(key));
  }

  return (
    <Reveal className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="flex flex-col gap-1.5 text-sm text-muted lg:col-span-2">
          Поиск
          <ClearableInput
            value={query}
            onChange={setQuery}
            placeholder="Вакансия, компания, город"
            inputClassName={`w-full ${fieldClass}`}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Статус
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={fieldClass}
          >
            <option value="all">Все</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Компания
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={fieldClass}
          >
            <option value="all">Все</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-2">
          <label className="flex min-w-44 flex-col gap-1.5 text-sm text-muted">
            С
            <ClearableInput
              type="date"
              value={from}
              onChange={setFrom}
              inputClassName={`w-full min-w-44 ${fieldClass}`}
            />
          </label>
          <label className="flex min-w-44 flex-col gap-1.5 text-sm text-muted">
            По
            <ClearableInput
              type="date"
              value={to}
              onChange={setTo}
              inputClassName={`w-full min-w-44 ${fieldClass}`}
            />
          </label>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={`${rangeStart}-${rangeEnd}-${sorted.length}-${applications.length}`}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-base text-muted"
        >
          {sorted.length === 0
            ? `Показано 0 из ${applications.length}`
            : `Показано ${rangeStart}–${rangeEnd} из ${sorted.length} (всего ${applications.length})`}
        </motion.p>
      </AnimatePresence>

      <div className="rounded-md border border-border">
        <table className="min-w-full w-full text-left text-base">
          <thead className="text-sm uppercase tracking-wide text-muted">
            <tr>
              {SORT_HEADERS.map((col) => {
                const active = sortKey === col.key;
                const arrow = active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
                return (
                  <th
                    key={col.key}
                    className="sticky top-16 z-20 border-b border-border bg-hover px-3 py-3 font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={`inline-flex items-center gap-0.5 transition hover:text-foreground ${
                        active ? 'text-foreground' : ''
                      }`}
                    >
                      {col.label}
                      <span aria-hidden className="tabular-nums">
                        {arrow || ' '}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center">
                  <p className="text-muted">Ничего не найдено</p>
                  <p className="mt-1 text-sm text-muted/80">
                    Смени фильтры или сбрось поиск
                  </p>
                </td>
              </tr>
            ) : (
              pageRows.map((app) => (
                <tr
                  key={app.id}
                  className="cursor-pointer border-b border-border/60 transition-colors hover:bg-hover"
                >
                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {formatDate(app.appliedAt)}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-medium text-foreground underline-offset-2 transition hover:underline hover:text-accent"
                    >
                      {app.vacancyName ?? 'Без названия'}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-foreground/90">
                    {app.employerName ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-muted">{displayCity(app)}</td>
                  <td className="px-3 py-3 text-muted">{formatLabel(app)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              На странице
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Стр.
              <input
                type="text"
                inputMode="numeric"
                value={pageDraft}
                onChange={(e) =>
                  setPageDraft(e.target.value.replace(/\D/g, ''))
                }
                onBlur={applyPageDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyPageDraft();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                aria-label="Номер страницы"
                className="w-12 rounded-md border border-border bg-surface px-2 py-1.5 text-center text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              из {pageCount}
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav
              aria-label="Страницы"
              className="flex flex-wrap items-center gap-1"
            >
              {pageItems.map((item, i) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-muted"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    aria-current={item === page ? 'page' : undefined}
                    disabled={item === page}
                    onClick={() => setPage(item)}
                    className={`${pageBtnClass} ${
                      item === page
                        ? 'bg-hover font-medium text-foreground'
                        : ''
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </nav>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={pageBtnClass}
            >
              Назад
            </button>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className={pageBtnClass}
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
    </Reveal>
  );
}
