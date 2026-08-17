'use client';

// Status badge with a colored dot
import { statusDotClass, statusLabel } from '@/lib/statuses';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm text-foreground/90 ${className}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${statusDotClass(status)}`}
        aria-hidden
      />
      {statusLabel(status)}
    </span>
  );
}
