'use client';

// Login form: password or demo mode
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ClearableInput } from '@/components/clearable-field';
import { FadeIn } from '@/components/motion/fade-in';
import { Pressable } from '@/components/motion/pressable';
import { Spinner } from '@/components/motion/spinner';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { ThemeSwitch } from '@/components/theme-switch';

export function LoginView() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function goHome() {
    router.replace('/');
    router.refresh();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Ошибка входа');
          return;
        }
        goHome();
      } catch {
        setError('Не удалось войти');
      }
    });
  }

  function onDemo() {
    // Passwordless login + demo data
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/demo', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Не удалось открыть демо');
          return;
        }
        goHome();
      } catch {
        setError('Не удалось открыть демо');
      }
    });
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="absolute right-4 top-4">
        <ThemeSwitch />
      </div>

      <Stagger className="w-full max-w-md space-y-8 text-center" delay={0.05}>
        <StaggerItem className="space-y-3">
          <p
            className="text-5xl font-semibold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-source-serif), serif' }}
          >
            HH Tracker
          </p>
          <p className="text-lg text-muted">Личный трекер откликов</p>
        </StaggerItem>

        <FadeIn show={Boolean(error)}>
          <p className="rounded-md border border-red-300/60 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </FadeIn>

        <StaggerItem>
          <form
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-3 text-left"
          >
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Пароль
              <ClearableInput
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
                inputClassName="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <Pressable
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3.5 text-base font-medium text-background disabled:opacity-60"
            >
              {isPending && <Spinner />}
              {isPending ? 'Вход…' : 'Войти'}
            </Pressable>
          </form>
        </StaggerItem>

        <StaggerItem className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-border" />
            или
            <span className="h-px flex-1 bg-border" />
          </div>
          <Pressable
            type="button"
            disabled={isPending}
            onClick={onDemo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-3.5 text-base font-medium text-foreground disabled:opacity-60"
          >
            {isPending && <Spinner />}
            {isPending ? 'Загрузка…' : 'Войти в демо'}
          </Pressable>
          <p className="text-sm text-muted">
            Сразу откроет дашборд с 75 тестовыми откликами
          </p>
        </StaggerItem>
      </Stagger>
    </main>
  );
}
