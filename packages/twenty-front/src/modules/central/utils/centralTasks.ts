import { type CentralActivity } from '@/central/types/CentralActivity';
import { isNonEmptyString } from '@sniptt/guards';

export type CentralTaskBucket = 'overdue' | 'today' | 'upcoming';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getDayOffset = (dueAt: string, now: Date) =>
  Math.round(
    (startOfDay(new Date(dueAt)).getTime() - startOfDay(now).getTime()) /
      DAY_IN_MS,
  );

export const getCentralTaskBucket = (
  dueAt: string | null,
  now: Date,
): CentralTaskBucket => {
  if (!isNonEmptyString(dueAt)) {
    return 'upcoming';
  }

  const offset = getDayOffset(dueAt, now);

  return offset < 0 ? 'overdue' : offset === 0 ? 'today' : 'upcoming';
};

export const getCentralDueLabel = (dueAt: string | null, now: Date) => {
  if (!isNonEmptyString(dueAt)) {
    return 'sem prazo';
  }

  const offset = getDayOffset(dueAt, now);

  if (offset < -1) return `há ${-offset} dias`;
  if (offset === -1) return 'ontem';
  if (offset === 0) return 'hoje';
  if (offset === 1) return 'amanhã';

  const date = new Date(dueAt);
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(date)
    .replace('.', '');
  const dayAndMonth = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
    .format(date)
    .replace('.', '')
    .replace(' de ', ' ');

  return `${weekday}, ${dayAndMonth}`;
};

// Noon keeps the date stable when the server stores it in UTC.
export const getCentralDueAtInDays = (days: number, now: Date) =>
  new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + days,
    12,
  ).toISOString();

export const isCentralTaskDone = (task: CentralActivity) =>
  task.status === 'DONE';

export const sortCentralTasksByDue = (tasks: CentralActivity[]) =>
  [...tasks].sort((first, second) => {
    if (first.dueAt === second.dueAt) return 0;
    if (!isNonEmptyString(first.dueAt)) return 1;
    if (!isNonEmptyString(second.dueAt)) return -1;

    return first.dueAt < second.dueAt ? -1 : 1;
  });

export type CentralCompanyGroup = {
  companyId: string | null;
  companyName: string;
  activities: CentralActivity[];
};

export const groupCentralActivitiesByCompany = (
  activities: CentralActivity[],
): CentralCompanyGroup[] => {
  const groups = new Map<string | null, CentralCompanyGroup>();

  for (const activity of activities) {
    const group = groups.get(activity.companyId) ?? {
      companyId: activity.companyId,
      companyName: activity.companyName ?? 'Sem cliente',
      activities: [],
    };

    group.activities.push(activity);
    groups.set(activity.companyId, group);
  }

  return [...groups.values()].sort((first, second) =>
    first.companyId === null
      ? 1
      : second.companyId === null
        ? -1
        : first.companyName.localeCompare(second.companyName, 'pt-BR'),
  );
};
