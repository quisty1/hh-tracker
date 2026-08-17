'use client';

// Header: navigation, theme, logout
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { ThemeSwitch } from '@/components/theme-switch';
import { PressableLink } from '@/components/motion/pressable';

type AppHeaderProps = {
  userName?: string | null;
};

const nav = [
  { href: '/', label: 'Дашборд' },
  { href: '/applications', label: 'Отклики' },
];

export function AppHeader({ userName }: AppHeaderProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-foreground transition hover:opacity-80"
          >
            HH Tracker
          </Link>
          {nav.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            // Active item: shared layoutId underline for the whole nav
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-base transition ${
                  active
                    ? 'font-medium text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId={reduce ? undefined : 'nav-underline'}
                    className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-accent"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeSwitch />
          {userName && (
            <span className="hidden text-base text-muted sm:inline">
              {userName}
            </span>
          )}
          <PressableLink
            href="/api/auth/logout"
            className="text-base text-muted transition hover:text-foreground"
          >
            Выйти
          </PressableLink>
        </div>
      </div>
    </header>
  );
}
