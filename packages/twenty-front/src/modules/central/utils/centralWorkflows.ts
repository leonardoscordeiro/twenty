// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export type CentralWorkflowState = 'on' | 'off' | 'draft';

export type CentralWorkflowRun = {
  id: string;
  name: string | null;
  status: string;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  coreWorkflowId: string | null;
};

export type CentralRunTone = 'success' | 'danger' | 'progress' | 'neutral';

export type CentralWorkflowRecipe = {
  id: string;
  area: string;
  sentence: string;
  requirement?: string;
};

export const CENTRAL_WORKFLOW_RECIPES: CentralWorkflowRecipe[] = [
  {
    id: 'access-review',
    area: 'Acessos',
    sentence:
      'Quando um acesso fizer 90 dias sem revisão, criar tarefa (uma por cliente).',
  },
  {
    id: 'domain-expiry',
    area: 'Vencimentos',
    sentence: '30 dias antes do domínio vencer, me avisar.',
    requirement: 'Depende da data de vencimento de domínio (job diário).',
  },
  {
    id: 'empty-costs',
    area: 'Custos',
    sentence: 'Toda segunda, se tiver custo de infra sem valor, me lembrar.',
  },
  {
    id: 'stale-opportunity',
    area: 'Vendas',
    sentence:
      'Quando uma oportunidade ficar 14 dias parada, criar tarefa de follow-up.',
  },
  {
    id: 'contract-renewal',
    area: 'Contratos',
    sentence: '60 dias antes do contrato vencer, criar tarefa de renovação.',
    requirement: 'Precisa da data do contrato preenchida em cada cliente.',
  },
  {
    id: 'new-client',
    area: 'Clientes',
    sentence:
      'Quando um cliente novo entrar, criar a checklist de implantação.',
  },
  {
    id: 'weekly-summary',
    area: 'Resumo',
    sentence: 'Toda segunda às 8h, me mandar por e-mail o resumo da semana.',
  },
  {
    id: 'system-down',
    area: 'Sistemas',
    sentence: 'Se um sistema ficar fora do ar por 10 minutos, me avisar.',
    requirement: 'Depende da checagem de saúde dos sistemas.',
  },
];

export const CENTRAL_STARTER_RECIPE_IDS = [
  'access-review',
  'domain-expiry',
  'empty-costs',
];

export const getCentralWorkflowState = (
  statuses: readonly string[],
): CentralWorkflowState => {
  if (statuses.includes('ACTIVE')) {
    return 'on';
  }

  return statuses.includes('DEACTIVATED') ? 'off' : 'draft';
};

const RUN_STATUS: Record<string, { label: string; tone: CentralRunTone }> = {
  COMPLETED: { label: 'Concluída', tone: 'success' },
  FAILED: { label: 'Falhou', tone: 'danger' },
  RUNNING: { label: 'Rodando', tone: 'progress' },
  ENQUEUED: { label: 'Na fila', tone: 'progress' },
  NOT_STARTED: { label: 'Não começou', tone: 'neutral' },
  STOPPING: { label: 'Parando', tone: 'neutral' },
  STOPPED: { label: 'Parada', tone: 'neutral' },
};

export const getCentralRunStatus = (status: string) =>
  RUN_STATUS[status] ?? { label: status, tone: 'neutral' as const };

export const getCentralRunDate = (run: CentralWorkflowRun) =>
  run.startedAt ?? run.createdAt;

export const groupCentralRunsByWorkflow = (runs: CentralWorkflowRun[]) => {
  const runsByWorkflow = new Map<string, CentralWorkflowRun[]>();

  [...runs]
    .sort(
      (first, second) =>
        Date.parse(getCentralRunDate(second)) -
        Date.parse(getCentralRunDate(first)),
    )
    .forEach((run) => {
      if (!isDefined(run.coreWorkflowId)) {
        return;
      }

      runsByWorkflow.set(run.coreWorkflowId, [
        ...(runsByWorkflow.get(run.coreWorkflowId) ?? []),
        run,
      ]);
    });

  return runsByWorkflow;
};

export const formatCentralRunDate = (isoDate: string, now: Date) => {
  const date = new Date(isoDate);
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  if (date.toDateString() === now.toDateString()) {
    return `Hoje ${time}`;
  }

  const day = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
    .format(date)
    .replace('.', '');

  return `${day} ${time}`;
};

export const getCentralWorkflowName = (name: string | null) =>
  isNonEmptyString(name) ? name : 'Fluxo sem nome';
