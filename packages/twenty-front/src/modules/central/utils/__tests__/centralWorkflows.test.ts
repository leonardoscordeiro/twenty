import {
  type CentralWorkflowRun,
  formatCentralRunDate,
  getCentralRunStatus,
  getCentralWorkflowState,
  groupCentralRunsByWorkflow,
} from '@/central/utils/centralWorkflows';

const NOW = new Date(2026, 10, 6, 10);

const buildRun = (
  overrides: Partial<CentralWorkflowRun>,
): CentralWorkflowRun => ({
  id: 'run-id',
  name: null,
  status: 'COMPLETED',
  createdAt: NOW.toISOString(),
  startedAt: null,
  endedAt: null,
  coreWorkflowId: 'workflow-a',
  ...overrides,
});

describe('getCentralWorkflowState', () => {
  it('treats any active version as on', () => {
    expect(getCentralWorkflowState(['DRAFT', 'ACTIVE'])).toBe('on');
  });

  it('is off when only deactivated', () => {
    expect(getCentralWorkflowState(['DEACTIVATED'])).toBe('off');
  });

  it('is a draft when never published', () => {
    expect(getCentralWorkflowState(['DRAFT'])).toBe('draft');
    expect(getCentralWorkflowState([])).toBe('draft');
  });
});

describe('groupCentralRunsByWorkflow', () => {
  it('groups by workflow, newest first, and skips runs without workflow', () => {
    const grouped = groupCentralRunsByWorkflow([
      buildRun({ id: 'old', createdAt: new Date(2026, 10, 1).toISOString() }),
      buildRun({ id: 'new', startedAt: new Date(2026, 10, 5).toISOString() }),
      buildRun({ id: 'other', coreWorkflowId: 'workflow-b' }),
      buildRun({ id: 'orphan', coreWorkflowId: null }),
    ]);

    expect(grouped.get('workflow-a')?.map((run) => run.id)).toEqual([
      'new',
      'old',
    ]);
    expect(grouped.get('workflow-b')?.map((run) => run.id)).toEqual(['other']);
    expect(grouped.size).toBe(2);
  });
});

describe('getCentralRunStatus', () => {
  it('translates known statuses and keeps unknown ones', () => {
    expect(getCentralRunStatus('FAILED')).toEqual({
      label: 'Falhou',
      tone: 'danger',
    });
    expect(getCentralRunStatus('WHATEVER').label).toBe('WHATEVER');
  });
});

describe('formatCentralRunDate', () => {
  it('says Hoje for runs today', () => {
    expect(
      formatCentralRunDate(new Date(2026, 10, 6, 8, 0).toISOString(), NOW),
    ).toBe('Hoje 08:00');
  });

  it('shows day and month otherwise', () => {
    expect(
      formatCentralRunDate(new Date(2026, 10, 2, 9, 5).toISOString(), NOW),
    ).toMatch(/^2 de nov 09:05$|^2 nov 09:05$/);
  });
});
