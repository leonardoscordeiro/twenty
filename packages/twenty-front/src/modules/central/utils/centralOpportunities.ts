import { fromAmountMicros } from '@/central/utils/centralMoney';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
export const STALE_AFTER_DAYS = 14;

export type CentralOpportunityTask = {
  id: string;
  title: string | null;
  dueAt: string | null;
  status: string | null;
};

export type CentralOpportunity = ObjectRecord & {
  name: string | null;
  stage: string | null;
  amount: { amountMicros: number | null } | null;
  closeDate: string | null;
  updatedAt: string;
  company: { id: string; name: string | null } | null;
  taskTargets: { task: CentralOpportunityTask | null }[];
};

export type NextStepStatus = 'overdue' | 'today' | 'upcoming' | 'missing';

export type NextStep = {
  task: CentralOpportunityTask | null;
  status: NextStepStatus;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// Undated open tasks sort after dated ones: a date is what makes a step actionable.
export const getNextStep = (
  opportunity: CentralOpportunity,
  now: Date,
): NextStep => {
  const openTasks = opportunity.taskTargets
    .map((taskTarget) => taskTarget.task)
    .filter(isDefined)
    .filter((task) => task.status !== 'DONE')
    .sort(
      (first, second) =>
        (isDefined(first.dueAt) ? new Date(first.dueAt).getTime() : Infinity) -
        (isDefined(second.dueAt) ? new Date(second.dueAt).getTime() : Infinity),
    );
  const task = openTasks[0] ?? null;

  if (!isDefined(task)) {
    return { task: null, status: 'missing' };
  }

  if (!isDefined(task.dueAt)) {
    return { task, status: 'upcoming' };
  }

  const dueDay = startOfDay(new Date(task.dueAt));
  const today = startOfDay(now);

  return {
    task,
    status:
      dueDay < today ? 'overdue' : dueDay === today ? 'today' : 'upcoming',
  };
};

export const getDaysSinceUpdate = (
  opportunity: CentralOpportunity,
  now: Date,
) =>
  Math.floor(
    (now.getTime() - new Date(opportunity.updatedAt).getTime()) /
      DAY_IN_MILLISECONDS,
  );

export type StageSummary = {
  total: number;
  count: number;
  missingAmountCount: number;
};

export const getStageSummary = (
  opportunities: CentralOpportunity[],
): StageSummary => {
  const amounts = opportunities.map((opportunity) =>
    fromAmountMicros(opportunity.amount),
  );

  return {
    total: amounts.filter(isDefined).reduce((sum, amount) => sum + amount, 0),
    count: opportunities.length,
    missingAmountCount: amounts.filter((amount) => !isDefined(amount)).length,
  };
};

// Snapshot approximation: an opportunity in a later stage counts as having passed earlier ones.
export const getFunnelReachCounts = (
  opportunities: CentralOpportunity[],
  stageValues: string[],
) =>
  stageValues.map(
    (_, index) =>
      opportunities.filter((opportunity) => {
        const stageIndex = stageValues.indexOf(opportunity.stage ?? '');

        return stageIndex >= index;
      }).length,
  );

// Stage options are editable metadata, so outcome stages are matched by name:
// covers Twenty's default CUSTOMER and the planned Fechado/Perdido options.
const WON_STAGE_PATTERN = /^(CUSTOMER|FECHADO|GANHO|WON)/i;
const LOST_STAGE_PATTERN = /^(PERDIDO|LOST)/i;

export const isLostStage = (stage: string | null) =>
  LOST_STAGE_PATTERN.test(stage ?? '');

export const isClosedStage = (stage: string | null) =>
  WON_STAGE_PATTERN.test(stage ?? '') || isLostStage(stage);
