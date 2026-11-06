import { type CentralActivity } from '@/central/types/CentralActivity';
import {
  getCentralDueAtInDays,
  getCentralDueLabel,
  getCentralTaskBucket,
  groupCentralActivitiesByCompany,
  sortCentralTasksByDue,
} from '@/central/utils/centralTasks';

const NOW = new Date(2026, 10, 5, 9);

const task = (overrides: Partial<CentralActivity>): CentralActivity => ({
  id: 'id',
  title: null,
  dueAt: null,
  status: 'TODO',
  bodyMarkdown: null,
  companyId: null,
  companyName: null,
  ...overrides,
});

describe('centralTasks', () => {
  it('buckets tasks by due day', () => {
    expect(getCentralTaskBucket(getCentralDueAtInDays(-2, NOW), NOW)).toBe(
      'overdue',
    );
    expect(getCentralTaskBucket(getCentralDueAtInDays(0, NOW), NOW)).toBe(
      'today',
    );
    expect(getCentralTaskBucket(getCentralDueAtInDays(3, NOW), NOW)).toBe(
      'upcoming',
    );
    expect(getCentralTaskBucket(null, NOW)).toBe('upcoming');
  });

  it('labels due dates relative to today', () => {
    expect(getCentralDueLabel(getCentralDueAtInDays(-2, NOW), NOW)).toBe(
      'há 2 dias',
    );
    expect(getCentralDueLabel(getCentralDueAtInDays(-1, NOW), NOW)).toBe(
      'ontem',
    );
    expect(getCentralDueLabel(getCentralDueAtInDays(1, NOW), NOW)).toBe(
      'amanhã',
    );
    expect(getCentralDueLabel(null, NOW)).toBe('sem prazo');
    expect(getCentralDueLabel(getCentralDueAtInDays(4, NOW), NOW)).toContain(
      '9',
    );
  });

  it('sorts by due date with undated tasks last', () => {
    const sorted = sortCentralTasksByDue([
      task({ id: 'none' }),
      task({ id: 'later', dueAt: getCentralDueAtInDays(3, NOW) }),
      task({ id: 'soon', dueAt: getCentralDueAtInDays(1, NOW) }),
    ]);

    expect(sorted.map(({ id }) => id)).toEqual(['soon', 'later', 'none']);
  });

  it('groups by company with tasks without company last', () => {
    const groups = groupCentralActivitiesByCompany([
      task({ id: '1' }),
      task({ id: '2', companyId: 'v8', companyName: 'V8' }),
      task({ id: '3', companyId: 'cs', companyName: 'ConSeg' }),
      task({ id: '4', companyId: 'v8', companyName: 'V8' }),
    ]);

    expect(groups.map(({ companyName }) => companyName)).toEqual([
      'ConSeg',
      'V8',
      'Sem cliente',
    ]);
    expect(groups[1].activities).toHaveLength(2);
  });
});
