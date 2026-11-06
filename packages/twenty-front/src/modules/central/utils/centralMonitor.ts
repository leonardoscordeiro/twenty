// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import {
  type CentralExpiration,
  type CentralHealthTarget,
} from '@/central/hooks/useCentralMonitor';
import { type CentralCompany } from '@/central/types/CentralCompany';
import { type CentralAlert } from '@/central/utils/centralAlerts';
import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import { pluralize } from '@/central/utils/centralText';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const CENTRAL_EXPIRATION_WINDOW_IN_DAYS = 90;

// Certificates renew themselves around 30 days out, so they only alert at 14.
const ALERT_DAYS_BY_KIND: Record<CentralExpirationRow['kind'], number> = {
  certificate: 14,
  domain: 30,
  contract: 30,
  renewal: 30,
};

export type CentralExpirationRow = {
  kind: CentralExpiration['kind'] | 'contract' | 'renewal';
  name: string;
  companyName: string;
  expiresAt: string | null;
  origin: string;
};

export const CENTRAL_EXPIRATION_KIND_LABELS: Record<
  CentralExpirationRow['kind'],
  string
> = {
  certificate: 'Certificado',
  domain: 'Domínio',
  contract: 'Contrato',
  renewal: 'Renovação',
};

export const getDaysUntil = (date: string, now: Date) => {
  const target = new Date(
    DATE_ONLY_REGEX.test(date) ? `${date}T00:00:00` : date,
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.floor((target.getTime() - today.getTime()) / DAY_IN_MILLISECONDS);
};

export const getCentralExpirationRows = (
  expirations: CentralExpiration[],
  companies: CentralCompany[],
): CentralExpirationRow[] => [
  ...expirations.map((expiration) => ({
    ...expiration,
    origin:
      expiration.kind === 'certificate'
        ? 'TLS · automático'
        : 'RDAP · automático',
  })),
  ...companies.map((company) => ({
    kind: 'contract' as const,
    name: company.name ?? 'Sem nome',
    companyName: company.name ?? 'Sem nome',
    expiresAt: company.fimContrato ?? null,
    origin: 'você digita',
  })),
  ...companies.flatMap((company) =>
    company.custosInfra
      .filter((custo) => isNonEmptyString(custo.renovacao))
      .map((custo) => ({
        kind: 'renewal' as const,
        name: custo.servico ?? custo.name ?? 'Plano',
        companyName: company.name ?? 'Sem nome',
        expiresAt: custo.renovacao,
        origin: 'Custo de infra',
      })),
  ),
];

export const isExpirationAlerting = (row: CentralExpirationRow, now: Date) =>
  isDefined(row.expiresAt) &&
  getDaysUntil(row.expiresAt, now) <= ALERT_DAYS_BY_KIND[row.kind];

// 48 bars over 24 h: each bar keeps the worst of its 6 checks.
export const getHealthBars = (
  history: CentralHealthTarget['history'],
  now: Date,
  barCount = 48,
) => {
  const windowStart = now.getTime() - DAY_IN_MILLISECONDS;
  const barDuration = DAY_IN_MILLISECONDS / barCount;
  const bars: ('empty' | 'ok' | 'slow' | 'down')[] =
    Array(barCount).fill('empty');
  const rank = { empty: 0, ok: 1, slow: 2, down: 3 };

  history.forEach((check) => {
    const index = Math.floor(
      (new Date(check.at).getTime() - windowStart) / barDuration,
    );

    if (index < 0 || index >= barCount) {
      return;
    }

    const state = !check.ok ? 'down' : (check.ms ?? 0) > 2000 ? 'slow' : 'ok';

    if (rank[state] > rank[bars[index]]) {
      bars[index] = state;
    }
  });

  return bars;
};

export const getCentralMonitorAlerts = (
  healthTargets: CentralHealthTarget[],
  expirationRows: CentralExpirationRow[],
  now: Date,
): CentralAlert[] => {
  const downTargets = healthTargets.filter(
    (target) => target.status === 'down',
  );
  const alertingRows = expirationRows.filter((row) =>
    isExpirationAlerting(row, now),
  );
  const alerts: (CentralAlert | false)[] = [
    downTargets.length > 0 && {
      id: 'saude',
      title: `${downTargets.map((target) => target.companyName).join(', ')} fora do ar`,
      detail: 'Sem resposta em 2 checagens seguidas.',
      actionLabel: 'Ver saúde',
      actionPath: CENTRAL_PATHS.health,
      links: [],
    },
    alertingRows.length > 0 && {
      id: 'vencimentos',
      title: `${pluralize(alertingRows.length, 'vencimento', 'vencimentos')} chegando`,
      detail: alertingRows
        .map(
          (row) =>
            `${CENTRAL_EXPIRATION_KIND_LABELS[row.kind]} ${row.name} em ${getDaysUntil(row.expiresAt ?? '', now)} dias`,
        )
        .join(' · '),
      actionLabel: 'Ver vencimentos',
      actionPath: CENTRAL_PATHS.expirations,
      links: [],
    },
  ];

  return alerts.filter((alert): alert is CentralAlert => alert !== false);
};
