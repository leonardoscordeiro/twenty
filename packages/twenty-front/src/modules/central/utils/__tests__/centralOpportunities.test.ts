import {
  type CentralOpportunity,
  getFunnelReachCounts,
  getNextStep,
  getStageSummary,
  isClosedStage,
} from '@/central/utils/centralOpportunities';

const NOW = new Date(2026, 10, 5, 10);

const buildOpportunity = (
  overrides: Partial<CentralOpportunity>,
): CentralOpportunity => ({
  __typename: 'Opportunity',
  id: 'opportunity-id',
  name: 'Revenda A',
  stage: 'NEW',
  amount: null,
  closeDate: null,
  updatedAt: NOW.toISOString(),
  company: null,
  taskTargets: [],
  ...overrides,
});

const task = (id: string, dueAt: string | null, status = 'TODO') => ({
  task: { id, title: id, dueAt, status },
});

describe('getNextStep', () => {
  it('flags opportunities without an open task', () => {
    const opportunity = buildOpportunity({
      taskTargets: [task('done', null, 'DONE')],
    });

    expect(getNextStep(opportunity, NOW)).toEqual({
      task: null,
      status: 'missing',
    });
  });

  it('picks the earliest dated open task and classifies it', () => {
    const opportunity = buildOpportunity({
      taskTargets: [
        task('undated', null),
        task('later', new Date(2026, 10, 9).toISOString()),
        task('late', new Date(2026, 10, 3).toISOString()),
      ],
    });

    const nextStep = getNextStep(opportunity, NOW);

    expect(nextStep.task?.id).toBe('late');
    expect(nextStep.status).toBe('overdue');
  });

  it('marks a task due today', () => {
    const opportunity = buildOpportunity({
      taskTargets: [task('now', new Date(2026, 10, 5, 18).toISOString())],
    });

    expect(getNextStep(opportunity, NOW).status).toBe('today');
  });
});

describe('getStageSummary', () => {
  it('sums filled amounts and counts empty ones apart', () => {
    expect(
      getStageSummary([
        buildOpportunity({ amount: { amountMicros: 900_000_000 } }),
        buildOpportunity({ amount: { amountMicros: null } }),
      ]),
    ).toEqual({ total: 900, count: 2, missingAmountCount: 1 });
  });
});

describe('getFunnelReachCounts', () => {
  it('counts later stages as having reached earlier ones', () => {
    const stages = ['NEW', 'PROPOSAL', 'CUSTOMER'];

    expect(
      getFunnelReachCounts(
        [
          buildOpportunity({ stage: 'NEW' }),
          buildOpportunity({ stage: 'PROPOSAL' }),
          buildOpportunity({ stage: 'CUSTOMER' }),
        ],
        stages,
      ),
    ).toEqual([3, 2, 1]);
  });
});

describe('isClosedStage', () => {
  it('treats won and lost stages as closed', () => {
    expect(isClosedStage('CUSTOMER')).toBe(true);
    expect(isClosedStage('PERDIDO')).toBe(true);
    expect(isClosedStage('PROPOSAL')).toBe(false);
  });
});
