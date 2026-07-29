'use client';

// Графики дашборда (Recharts): дни, статусы, компании, будни
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Stagger, StaggerItem } from '@/components/motion/stagger';

// Палитры под светлую / тёмную тему
const LIGHT_PALETTE = [
  '#0f766e',
  '#0369a1',
  '#c2410c',
  '#a16207',
  '#be123c',
  '#4338ca',
  '#15803d',
  '#7c2d12',
];

const DARK_PALETTE = [
  '#2dd4bf',
  '#38bdf8',
  '#fb923c',
  '#fbbf24',
  '#f472b6',
  '#a78bfa',
  '#4ade80',
  '#f87171',
];

type ChartData = {
  byDay: { date: string; label: string; count: number }[];
  byStatus: { name: string; count: number }[];
  topCompanies: { name: string; count: number }[];
  byWeekday: { name: string; count: number }[];
};

// false на SSR — Recharts рисуем только после mount
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useChartTheme() {
  // Цвета осей/палитры под resolvedTheme
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const dark = mounted && resolvedTheme === 'dark';
  const colors = dark ? DARK_PALETTE : LIGHT_PALETTE;

  return {
    dark,
    colors,
    primary: colors[0],
    secondary: colors[1],
    grid: dark ? '#2f3b4c' : '#d6d0c6',
    axis: dark ? '#94a3b8' : '#78716c',
    tooltip: {
      backgroundColor: dark ? '#1c2430' : '#f7f4ef',
      border: dark ? '#2f3b4c' : '#d6d0c6',
      color: dark ? '#e8eef4' : '#1c1917',
    },
  };
}

const tickStyle = { fontSize: 13 };

export function DashboardCharts({ data }: { data: ChartData }) {
  const theme = useChartTheme();

  function ChartTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name?: string; value?: number | string; color?: string }>;
    label?: string | number;
  }) {
    if (!active || !payload?.length) return null;

    return (
      <div
        style={{
          backgroundColor: theme.tooltip.backgroundColor,
          border: `1px solid ${theme.tooltip.border}`,
          borderRadius: 8,
          color: theme.tooltip.color,
          fontSize: 13,
          padding: '8px 12px',
        }}
      >
        {label != null && label !== '' && (
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        )}
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              color: theme.tooltip.color,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: entry.color ?? theme.primary,
                flexShrink: 0,
              }}
            />
            <span>
              {entry.name}: {entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }

  return (
    <Stagger className="grid gap-10 lg:grid-cols-2" delay={0.1} stagger={0.08}>
      <StaggerItem>
        <section>
          <h2 className="mb-4 text-base font-medium text-foreground">
            Отклики за 30 дней
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ ...tickStyle, fill: theme.axis }}
                  stroke={theme.axis}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ ...tickStyle, fill: theme.axis }}
                  stroke={theme.axis}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Отклики"
                  stroke={theme.primary}
                  strokeWidth={3}
                  dot={{ r: 3, fill: theme.secondary, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: theme.secondary }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section>
          <h2 className="mb-4 text-base font-medium text-foreground">
            По дням недели
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byWeekday}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis
                  dataKey="name"
                  tick={{ ...tickStyle, fill: theme.axis }}
                  stroke={theme.axis}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ ...tickStyle, fill: theme.axis }}
                  stroke={theme.axis}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="count"
                  name="Отклики"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                >
                  {data.byWeekday.map((_, index) => (
                    <Cell
                      key={index}
                      fill={theme.colors[index % theme.colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section>
          <h2 className="mb-4 text-base font-medium text-foreground">
            По статусам
          </h2>
          <div className="h-72 w-full">
            {data.byStatus.length === 0 ? (
              <p className="text-base text-muted">Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byStatus}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={52}
                    isAnimationActive
                  >
                    {data.byStatus.map((_, index) => (
                      <Cell
                        key={index}
                        fill={theme.colors[index % theme.colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {data.byStatus.slice(0, 8).map((item, index) => (
              <li key={item.name} className="flex items-center gap-2">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{
                    background: theme.colors[index % theme.colors.length],
                  }}
                />
                {item.name}: {item.count}
              </li>
            ))}
          </ul>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section>
          <h2 className="mb-4 text-base font-medium text-foreground">
            Топ компаний
          </h2>
          <div className="h-72 w-full">
            {data.topCompanies.length === 0 ? (
              <p className="text-base text-muted">Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topCompanies}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ ...tickStyle, fill: theme.axis }}
                    stroke={theme.axis}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ ...tickStyle, fill: theme.axis }}
                    stroke={theme.axis}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Отклики"
                    radius={[0, 6, 6, 0]}
                    isAnimationActive
                  >
                    {data.topCompanies.map((_, index) => (
                      <Cell
                        key={index}
                        fill={theme.colors[index % theme.colors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </StaggerItem>
    </Stagger>
  );
}
