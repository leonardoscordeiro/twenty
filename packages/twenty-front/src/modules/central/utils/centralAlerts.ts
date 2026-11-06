// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { type CentralCompany } from '@/central/types/CentralCompany';
import {
  fromAmountMicros,
  getCentralCostSummary,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import { getCentralClientPath, pluralize } from '@/central/utils/centralText';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export type CentralAlertId =
  | 'mensalidade'
  | 'custos'
  | 'acessos'
  | 'saude'
  | 'vencimentos';

export type CentralAlertLink = { label: string; path: string };

export type CentralAlert = {
  id: CentralAlertId;
  title: string;
  detail: string;
  actionLabel: string;
  actionPath: string;
  links: CentralAlertLink[];
};

export const getMissingCostCount = (company: CentralCompany) =>
  company.custosInfra.filter(
    (custo) => !isDefined(fromAmountMicros(custo.custoMensal)),
  ).length;

export const getCentralClientMargin = (company: CentralCompany) => {
  const mensalidade = fromAmountMicros(company.mensalidade);
  const costSummary = getCentralCostSummary(
    company.custosInfra.map((custo) => custo.custoMensal),
  );
  const missingCostCount = costSummary.count - costSummary.filledCount;
  const missing = [
    missingCostCount > 0 && pluralize(missingCostCount, 'custo', 'custos'),
    !isDefined(mensalidade) && 'a mensalidade',
  ].filter((item): item is string => item !== false);

  return {
    margin: isDefined(mensalidade) ? mensalidade - costSummary.total : null,
    missingCostCount,
    hasMensalidade: isDefined(mensalidade),
    isComplete: missing.length === 0,
    reason: missing.length === 0 ? null : `${missing.join(' e ')} sem valor`,
  };
};

export const getCentralAlerts = (
  companies: CentralCompany[],
  now: Date,
): CentralAlert[] => {
  const withoutMensalidade = companies.filter(
    (company) => !isDefined(fromAmountMicros(company.mensalidade)),
  );
  const withMissingCosts = companies
    .map((company) => ({ company, count: getMissingCostCount(company) }))
    .filter(({ count }) => count > 0);
  const withPendingAcessos = companies
    .map((company) => ({
      company,
      acessos: company.acessos.filter((acesso) =>
        isAcessoPendingReview(acesso, now),
      ),
    }))
    .filter(({ acessos }) => acessos.length > 0);

  const missingCostTotal = withMissingCosts.reduce(
    (sum, { count }) => sum + count,
    0,
  );
  const pendingAcessos = withPendingAcessos.flatMap(({ acessos }) => acessos);
  const neverReviewedCount = pendingAcessos.filter(
    (acesso) => !isDefined(acesso.revisadoEm),
  ).length;
  const staleCount = pendingAcessos.length - neverReviewedCount;

  const alerts: (CentralAlert | false)[] = [
    withoutMensalidade.length > 0 && {
      id: 'mensalidade',
      title: `Mensalidade vazia em ${pluralize(withoutMensalidade.length, 'cliente', 'clientes')}`,
      detail: 'Sem isso não dá pra calcular receita nem margem.',
      actionLabel: 'Preencher',
      actionPath: getCentralClientPath(withoutMensalidade[0].id),
      links: withoutMensalidade.map((company) => ({
        label: company.name ?? 'Sem nome',
        path: getCentralClientPath(company.id),
      })),
    },
    missingCostTotal > 0 && {
      id: 'custos',
      title: `${pluralize(missingCostTotal, 'custo de infra', 'custos de infra')} sem valor`,
      detail: 'Por cliente:',
      actionLabel: 'Preencher',
      actionPath: getCentralClientPath(withMissingCosts[0].company.id, 'infra'),
      links: withMissingCosts.map(({ company, count }) => ({
        label: `${company.name ?? 'Sem nome'} ${count}`,
        path: getCentralClientPath(company.id, 'infra'),
      })),
    },
    pendingAcessos.length > 0 && {
      id: 'acessos',
      title: `${pluralize(pendingAcessos.length, 'acesso', 'acessos')} a revisar`,
      detail: [
        neverReviewedCount > 0 &&
          `${neverReviewedCount} nunca ${neverReviewedCount === 1 ? 'revisado' : 'revisados'}`,
        staleCount > 0 && `${staleCount} há mais de 90 dias`,
      ]
        .filter((item): item is string => item !== false)
        .join(', '),
      actionLabel: 'Revisar',
      actionPath: getCentralClientPath(
        withPendingAcessos[0].company.id,
        'acessos',
      ),
      links: withPendingAcessos.map(({ company, acessos }) => ({
        label: `${company.name ?? 'Sem nome'} ${acessos.length}`,
        path: getCentralClientPath(company.id, 'acessos'),
      })),
    },
  ];

  return alerts.filter((alert): alert is CentralAlert => alert !== false);
};

const normalizeSearch = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export const matchesCentralSearch = (
  company: CentralCompany,
  query: string,
  getProvedorLabel: (value: string | null) => string | null,
) => {
  const normalizedQuery = normalizeSearch(query.trim());

  if (normalizedQuery === '') {
    return true;
  }

  return [
    company.name,
    ...company.custosInfra.flatMap((custo) => [
      getProvedorLabel(custo.provedor),
      custo.servico,
    ]),
    ...company.acessos.flatMap((acesso) => [acesso.name, acesso.login]),
  ].some(
    (text) =>
      isDefined(text) && normalizeSearch(text).includes(normalizedQuery),
  );
};

const SNOOZE_STORAGE_KEY = 'central.alertasAdiados';
const SNOOZE_DURATION_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

type CentralSnoozedAlerts = Partial<Record<CentralAlertId, number>>;

// Storage can throw (private mode, blocked site data); alerts then just never stay snoozed.
export const readSnoozedAlerts = (): CentralSnoozedAlerts => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(SNOOZE_STORAGE_KEY) ?? '{}',
    ) as unknown;

    return isPlainObject(parsed) ? (parsed as CentralSnoozedAlerts) : {};
  } catch {
    return {};
  }
};

export const snoozeAlert = (
  snoozedAlerts: CentralSnoozedAlerts,
  alertId: CentralAlertId,
  now: Date,
) => {
  const nextSnoozedAlerts = {
    ...snoozedAlerts,
    [alertId]: now.getTime() + SNOOZE_DURATION_IN_MILLISECONDS,
  };

  try {
    localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(nextSnoozedAlerts));
  } catch {
    // Snooze still applies for this visit.
  }

  return nextSnoozedAlerts;
};

export const isAlertSnoozed = (
  snoozedAlerts: CentralSnoozedAlerts,
  alertId: CentralAlertId,
  now: Date,
) => (snoozedAlerts[alertId] ?? 0) > now.getTime();
