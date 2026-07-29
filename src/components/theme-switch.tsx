'use client';

// Переключатель light / dark / system
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const themes = ['light', 'dark', 'system'] as const;

const labels: Record<(typeof themes)[number], string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Система',
};

// false на SSR, true после гидрации — без mismatch next-themes
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const reduce = useReducedMotion();

  if (!mounted) {
    return <div className="seg-control min-w-[11rem]" aria-hidden />;
  }

  return (
    <div role="group" aria-label="Тема" className="seg-control relative">
      {themes.map((value) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            className="relative z-10"
          >
            {active && (
              <motion.span
                layoutId={reduce ? undefined : 'theme-pill'}
                className="absolute inset-0 -z-10 rounded-[6px] bg-hover"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            {labels[value]}
          </button>
        );
      })}
    </div>
  );
}
