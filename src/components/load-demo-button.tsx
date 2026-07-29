'use client';

// Кнопка «Загрузить демо» → POST /api/demo/seed (с подтверждением)
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { FadeIn } from '@/components/motion/fade-in';
import { ConfirmModal } from '@/components/motion/modal';
import { Pressable } from '@/components/motion/pressable';
import { Spinner } from '@/components/motion/spinner';

export function LoadDemoButton() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    setError(null);
    setOk(null);
    startTransition(async () => {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка');
        setConfirmOpen(false);
        return;
      }
      setOk(`Загружено ${data.count} откликов`);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Pressable
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground disabled:opacity-60"
      >
        {isPending && <Spinner />}
        {isPending ? 'Загрузка…' : 'Загрузить демо'}
      </Pressable>
      <FadeIn show={Boolean(ok)}>
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{ok}</p>
      </FadeIn>
      <FadeIn show={Boolean(error)}>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </FadeIn>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirm}
        title="Загрузить демо?"
        description="Текущие отклики будут заменены 74 демо-записями"
        confirmLabel={isPending ? 'Загрузка…' : 'Загрузить'}
        pending={isPending}
      />
    </div>
  );
}
