'use client';

// Application card: view / edit (PATCH) / delete (DELETE)
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  ClearableInput,
  ClearableTextarea,
} from '@/components/clearable-field';
import { StatusBadge } from '@/components/status-badge';
import { FadeIn } from '@/components/motion/fade-in';
import { ConfirmModal } from '@/components/motion/modal';
import { Pressable, PressableLink } from '@/components/motion/pressable';
import { Reveal } from '@/components/motion/reveal';
import { Spinner } from '@/components/motion/spinner';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { APPLICATION_STATUSES } from '@/lib/statuses';

type DetailViewProps = {
  id: number;
  vacancyName: string | null;
  employerName: string | null;
  areaName: string | null;
  isRemote: boolean;
  employerLogoUrl: string | null;
  vacancyUrl: string | null;
  status: string;
  appliedAt: string;
  notes: string | null;
  salaryText: string | null;
  fields: { label: string; value: string }[];
};

const fieldClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

export function ApplicationDetailView({
  id,
  vacancyName,
  employerName,
  areaName,
  isRemote,
  employerLogoUrl,
  vacancyUrl,
  status,
  appliedAt,
  notes,
  salaryText,
  fields,
}: DetailViewProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentNotes, setCurrentNotes] = useState(notes ?? '');
  const [currentIsRemote, setCurrentIsRemote] = useState(isRemote);
  const [applied, setApplied] = useState(
    new Date(appliedAt).toISOString().slice(0, 16),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus,
          notes: currentNotes,
          isRemote: currentIsRemote,
          appliedAt: new Date(applied).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка сохранения');
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Ошибка удаления');
        setConfirmDelete(false);
        return;
      }
      router.push('/applications');
      router.refresh();
    });
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
      <Reveal>
        <Link
          href="/applications"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← К списку откликов
        </Link>
      </Reveal>

      <Reveal delay={0.05} className="flex items-start gap-4">
        {employerLogoUrl && (
          <Image
            src={employerLogoUrl}
            alt=""
            width={56}
            height={56}
            className="rounded border border-border bg-surface object-contain"
            unoptimized
          />
        )}
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-source-serif), serif' }}
          >
            {vacancyName ?? 'Без названия'}
          </h1>
          <p className="mt-1 text-base text-muted">
            {employerName ?? 'Компания не указана'}
            {areaName ? ` · ${areaName}` : ''}
            {` · ${currentIsRemote ? 'Удалённо' : 'Офис'}`}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <StatusBadge status={currentStatus} />
            {salaryText ? <span>· {salaryText}</span> : null}
          </div>
        </div>
      </Reveal>

      <Stagger className="space-y-0" delay={0.1} stagger={0.04}>
        {fields.map((field) => (
          <StaggerItem key={field.label}>
            <div className="border-b border-border py-3">
              <p className="text-xs uppercase tracking-wide text-muted">
                {field.label}
              </p>
              <p className="mt-1 text-sm text-foreground">{field.value}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal
        delay={0.15}
        className="space-y-3 rounded-md border border-border p-4"
      >
        <h2 className="text-base font-medium text-foreground">
          Редактирование
        </h2>
        <FadeIn show={Boolean(error)}>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </FadeIn>
        <FadeIn show={saved && !error}>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Сохранено
          </p>
        </FadeIn>
        <label className="block text-sm text-muted">
          Статус
          <select
            className={`mt-1 ${fieldClass}`}
            value={currentStatus}
            onChange={(e) => {
              setCurrentStatus(e.target.value);
              setSaved(false);
            }}
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
            value={applied}
            onChange={(v) => {
              setApplied(v);
              setSaved(false);
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={currentIsRemote}
            onChange={(e) => {
              setCurrentIsRemote(e.target.checked);
              setSaved(false);
            }}
            className="size-4 accent-accent"
          />
          Удалёнка
        </label>
        <label className="block text-sm text-muted">
          Заметки
          <ClearableTextarea
            className="mt-1"
            inputClassName={`min-h-24 ${fieldClass}`}
            value={currentNotes}
            onChange={(v) => {
              setCurrentNotes(v);
              setSaved(false);
            }}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Pressable
            disabled={isPending}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
          >
            {isPending && !confirmDelete && <Spinner />}
            {isPending && !confirmDelete ? 'Сохранение…' : 'Сохранить'}
          </Pressable>
          <Pressable
            disabled={isPending}
            onClick={() => setConfirmDelete(true)}
            className="rounded-md border border-red-300/60 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400"
          >
            Удалить
          </Pressable>
          {vacancyUrl && (
            <PressableLink
              href={vacancyUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Открыть на hh.ru
            </PressableLink>
          )}
        </div>
      </Reveal>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Удалить отклик?"
        description="Действие нельзя отменить"
        confirmLabel={isPending ? 'Удаление…' : 'Удалить'}
        danger
        pending={isPending}
      />
    </main>
  );
}
