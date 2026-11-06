import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const getCentralInitials = (name: string | null) => {
  const words = (name ?? '').split(/\s+/).filter(isNonEmptyString);
  const letters =
    words.length === 1
      ? (words[0].match(/[A-Z0-9]/g) ?? [words[0][0]])
      : words.map((word) => word[0]);

  return letters.slice(0, 2).join('').toUpperCase() || '?';
};

export const getCentralTodayLabel = (now: Date) => {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
    .format(now)
    .split('-')[0];
  const dayAndMonth = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
  }).format(now);

  return `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${dayAndMonth}`;
};

export const getCentralHostname = (url: string | null | undefined) =>
  isNonEmptyString(url)
    ? url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null;

export const getNativeRecordPath = (
  objectNameSingular: string,
  objectRecordId: string,
) => getAppPath(AppPath.RecordShowPage, { objectNameSingular, objectRecordId });

export const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;
