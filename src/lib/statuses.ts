// Справочник статусов отклика (id в БД / name в UI)
export const APPLICATION_STATUSES = [
  { id: 'sent', name: 'Отклик отправлен' },
  { id: 'viewed', name: 'Просмотрено' },
  { id: 'invite', name: 'Приглашение' },
  { id: 'interview', name: 'Собеседование' },
  { id: 'offer', name: 'Оффер' },
  { id: 'reject', name: 'Отказ' },
  { id: 'archived', name: 'В архиве' },
] as const;

export type ApplicationStatusId = (typeof APPLICATION_STATUSES)[number]['id'];

const STATUS_IDS = new Set(APPLICATION_STATUSES.map((s) => s.id));

export function isValidStatus(value: string): value is ApplicationStatusId {
  return STATUS_IDS.has(value as ApplicationStatusId);
}

export function statusLabel(id: string): string {
  return APPLICATION_STATUSES.find((s) => s.id === id)?.name ?? id;
}

// Цвет точки бейджа статуса
export const STATUS_DOT_CLASS: Record<ApplicationStatusId, string> = {
  sent: 'bg-muted',
  viewed: 'bg-sky-500/80',
  invite: 'bg-accent',
  interview: 'bg-accent',
  offer: 'bg-emerald-500',
  reject: 'bg-red-400',
  archived: 'bg-muted/60',
};

export function statusDotClass(id: string): string {
  if (isValidStatus(id)) return STATUS_DOT_CLASS[id];
  return 'bg-muted';
}
