'use client';

// Add buttons: manual / HH URL / CSV → matching APIs
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  ClearableInput,
  ClearableTextarea,
} from '@/components/clearable-field';
import { FadeIn } from '@/components/motion/fade-in';
import { Modal } from '@/components/motion/modal';
import { Pressable } from '@/components/motion/pressable';
import { Spinner } from '@/components/motion/spinner';
import { APPLICATION_STATUSES } from '@/lib/statuses';

type Mode = 'manual' | 'url' | 'csv' | null;

const fieldClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

// datetime-local in the local timezone (not UTC)
function todayLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}

export function ApplicationsActions() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [vacancyName, setVacancyName] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [vacancyUrl, setVacancyUrl] = useState('');
  const [areaName, setAreaName] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [status, setStatus] = useState('sent');
  const [appliedAt, setAppliedAt] = useState(todayLocal());
  const [notes, setNotes] = useState('');
  const [salaryFrom, setSalaryFrom] = useState('');
  const [salaryTo, setSalaryTo] = useState('');

  const [url, setUrl] = useState('');
  // CSV template with required columns + optional ones
  const [csv, setCsv] = useState(
    'vacancyName,employerName,appliedAt,status,vacancyUrl,areaName,isRemote,salaryFrom,salaryTo,notes\n',
  );

  function close() {
    setMode(null);
    setError(null);
    setMessage(null);
  }

  function refresh() {
    router.refresh();
  }

  function createManual() {
    // POST /api/applications
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyName: vacancyName || null,
          employerName: employerName || null,
          vacancyUrl: vacancyUrl || null,
          areaName: areaName || null,
          isRemote,
          status,
          appliedAt: new Date(appliedAt).toISOString(),
          notes: notes || null,
          salaryFrom: salaryFrom ? Number(salaryFrom) : null,
          salaryTo: salaryTo ? Number(salaryTo) : null,
          salaryCurrency: salaryFrom || salaryTo ? 'RUR' : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка');
        return;
      }
      close();
      refresh();
    });
  }

  function createFromUrl() {
    // POST /api/applications/from-url
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/applications/from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          status,
          appliedAt: new Date(appliedAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка');
        return;
      }
      close();
      refresh();
    });
  }

  function importCsv() {
    // POST /api/applications/import
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await fetch('/api/applications/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка импорта');
        return;
      }
      setMessage(
        `Импортировано: ${data.imported}${
          data.errors?.length ? ` · ошибок: ${data.errors.length}` : ''
        }`,
      );
      if (data.errors?.length) {
        setError(data.errors.slice(0, 5).join('; '));
      }
      refresh();
    });
  }

  const titleId = 'applications-modal-title';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pressable
        onClick={() => setMode('manual')}
        className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
      >
        Добавить
      </Pressable>
      <Pressable
        onClick={() => setMode('url')}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground"
      >
        По ссылке
      </Pressable>
      <Pressable
        onClick={() => setMode('csv')}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground"
      >
        Импорт CSV
      </Pressable>

      <Modal open={mode !== null} onClose={close} labelledBy={titleId}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            {mode === 'manual' && 'Новый отклик'}
            {mode === 'url' && 'Добавить по ссылке hh.ru'}
            {mode === 'csv' && 'Импорт CSV'}
          </h2>
          <button
            type="button"
            onClick={close}
            className="text-sm text-muted transition hover:text-foreground"
          >
            Закрыть
          </button>
        </div>

        <FadeIn show={Boolean(error)} className="mb-3">
          <p className="rounded-md border border-red-300/50 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </FadeIn>
        <FadeIn show={Boolean(message)} className="mb-3">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {message}
          </p>
        </FadeIn>

        {mode === 'manual' && (
          <div className="space-y-3">
            <label className="block text-sm text-muted">
              Вакансия
              <ClearableInput
                className="mt-1"
                inputClassName={fieldClass}
                value={vacancyName}
                onChange={setVacancyName}
              />
            </label>
            <label className="block text-sm text-muted">
              Компания
              <ClearableInput
                className="mt-1"
                inputClassName={fieldClass}
                value={employerName}
                onChange={setEmployerName}
              />
            </label>
            <label className="block text-sm text-muted">
              URL
              <ClearableInput
                className="mt-1"
                inputClassName={fieldClass}
                value={vacancyUrl}
                onChange={setVacancyUrl}
              />
            </label>
            <label className="block text-sm text-muted">
              Город
              <ClearableInput
                className="mt-1"
                inputClassName={fieldClass}
                value={areaName}
                onChange={setAreaName}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="size-4 accent-accent"
              />
              Удалёнка
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-muted">
                Зарплата от
                <ClearableInput
                  type="number"
                  className="mt-1"
                  inputClassName={fieldClass}
                  value={salaryFrom}
                  onChange={setSalaryFrom}
                />
              </label>
              <label className="block text-sm text-muted">
                до
                <ClearableInput
                  type="number"
                  className="mt-1"
                  inputClassName={fieldClass}
                  value={salaryTo}
                  onChange={setSalaryTo}
                />
              </label>
            </div>
            <label className="block text-sm text-muted">
              Статус
              <select
                className={`mt-1 ${fieldClass}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-muted">
              Дата отклика
              <ClearableInput
                type="datetime-local"
                className="mt-1"
                inputClassName={fieldClass}
                value={appliedAt}
                onChange={setAppliedAt}
              />
            </label>
            <label className="block text-sm text-muted">
              Заметки
              <ClearableTextarea
                className="mt-1"
                inputClassName={`min-h-24 ${fieldClass}`}
                value={notes}
                onChange={setNotes}
              />
            </label>
            <Pressable
              disabled={isPending}
              onClick={createManual}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2.5 text-sm font-medium text-background disabled:opacity-60"
            >
              {isPending && <Spinner />}
              {isPending ? 'Сохранение…' : 'Сохранить'}
            </Pressable>
          </div>
        )}

        {mode === 'url' && (
          <div className="space-y-3">
            <label className="block text-sm text-muted">
              Ссылка на вакансию
              <ClearableInput
                className="mt-1"
                inputClassName={fieldClass}
                placeholder="https://hh.ru/vacancy/123456"
                value={url}
                onChange={setUrl}
              />
            </label>
            <label className="block text-sm text-muted">
              Статус
              <select
                className={`mt-1 ${fieldClass}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-muted">
              Дата отклика
              <ClearableInput
                type="datetime-local"
                className="mt-1"
                inputClassName={fieldClass}
                value={appliedAt}
                onChange={setAppliedAt}
              />
            </label>
            <p className="text-sm text-muted">
              Пытаемся подтянуть название и компанию через публичный API hh.
              Если не выйдет — добавь вручную.
            </p>
            <Pressable
              disabled={isPending || !url.trim()}
              onClick={createFromUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2.5 text-sm font-medium text-background disabled:opacity-60"
            >
              {isPending && <Spinner />}
              {isPending ? 'Загрузка…' : 'Добавить'}
            </Pressable>
          </div>
        )}

        {mode === 'csv' && (
          <div className="space-y-3">
            <label className="block text-sm text-muted">
              CSV
              <ClearableTextarea
                className="mt-1"
                inputClassName={`min-h-48 font-mono text-sm ${fieldClass}`}
                value={csv}
                onChange={setCsv}
              />
            </label>
            <p className="text-sm text-muted">
              Колонки: vacancyName, employerName, appliedAt, status, vacancyUrl,
              areaName, isRemote, salaryFrom, salaryTo, notes
            </p>
            <Pressable
              disabled={isPending}
              onClick={importCsv}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2.5 text-sm font-medium text-background disabled:opacity-60"
            >
              {isPending && <Spinner />}
              {isPending ? 'Импорт…' : 'Импортировать'}
            </Pressable>
          </div>
        )}
      </Modal>
    </div>
  );
}
