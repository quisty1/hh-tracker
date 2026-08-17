'use client';

// Empty dashboard state when there are no applications
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/motion/reveal';

export function EmptyDashboard() {
  const reduce = useReducedMotion();

  return (
    <Reveal>
      <div className="rounded-md border border-dashed border-border px-6 py-14 text-center">
        <motion.svg
          viewBox="0 0 120 48"
          className="mx-auto h-12 w-28 text-accent/70"
          fill="none"
          aria-hidden
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -3, 0],
                }
          }
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path
            d="M8 36 C28 12, 44 40, 60 22 C76 4, 92 30, 112 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="112" cy="16" r="3" fill="currentColor" />
        </motion.svg>
        <p className="mt-5 text-base text-muted">
          Пока нет откликов. Добавь их на странице «Отклики» или загрузи
          демо-данные.
        </p>
        <Link
          href="/applications"
          className="mt-4 inline-block text-sm font-medium text-accent underline-offset-2 transition hover:underline"
        >
          Перейти к откликам →
        </Link>
      </div>
    </Reveal>
  );
}
