'use client';

// Ряд KPI-метрик дашборда
import { AnimatedNumber } from '@/components/motion/animated-number';
import { Stagger, StaggerItem } from '@/components/motion/stagger';

export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  const isNumber = typeof value === 'number';

  return (
    <div className="border-b border-border py-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
      <p className="text-sm uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold tabular-nums text-foreground">
        {isNumber ? <AnimatedNumber value={value} /> : value}
      </p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

type MetricsRowProps = {
  items: { label: string; value: string | number; hint?: string }[];
};

export function MetricsRow({ items }: MetricsRowProps) {
  return (
    <Stagger
      className="grid grid-cols-2 border-y border-border sm:grid-cols-3 lg:grid-cols-6"
      stagger={0.05}
    >
      {items.map((item) => (
        <StaggerItem key={item.label}>
          <Metric {...item} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
