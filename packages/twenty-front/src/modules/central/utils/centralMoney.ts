// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { type CentralAcesso } from '@/central/types/CentralCompany';
import { isDefined } from 'twenty-shared/utils';

const REVIEW_MAX_AGE_IN_DAYS = 90;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const fromAmountMicros = (
  currency: { amountMicros: number | null } | null | undefined,
) =>
  isDefined(currency?.amountMicros)
    ? Number(currency.amountMicros) / 1e6
    : null;

export const formatCentralCurrency = (amount: number | null) =>
  isDefined(amount) ? currencyFormatter.format(amount) : 'R$ —';

export type CentralCostSummary = {
  total: number;
  filledCount: number;
  count: number;
};

export const getCentralCostSummary = (
  currencies: ({ amountMicros: number | null } | null)[],
): CentralCostSummary => {
  const amounts = currencies.map(fromAmountMicros).filter(isDefined);

  return {
    total: amounts.reduce((sum, amount) => sum + amount, 0),
    filledCount: amounts.length,
    count: currencies.length,
  };
};

// "+" marks a lower bound: some costs are still empty.
export const formatCentralCostTotal = ({
  total,
  filledCount,
  count,
}: CentralCostSummary) =>
  filledCount === 0
    ? 'R$ —'
    : `${formatCentralCurrency(total)}${filledCount < count ? ' +' : ''}`;

export const getCentralMargin = (
  revenue: number | null,
  costSummary: CentralCostSummary,
) => ({
  margin: isDefined(revenue) ? revenue - costSummary.total : null,
  isIncomplete: costSummary.filledCount < costSummary.count,
});

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// A DATE field comes as YYYY-MM-DD, which Date parses as UTC midnight: read it as local.
export const getDaysSinceReview = (revisadoEm: string | null, now: Date) =>
  isDefined(revisadoEm)
    ? Math.floor(
        (now.getTime() -
          new Date(
            DATE_ONLY_REGEX.test(revisadoEm)
              ? `${revisadoEm}T00:00:00`
              : revisadoEm,
          ).getTime()) /
          DAY_IN_MILLISECONDS,
      )
    : null;

// Accepts "1.234,56", "89,9" and "89.90"; dots are thousands only when a comma is present
// or they group exactly three digits.
export const parseCentralAmount = (input: string) => {
  const compact = input.replace(/[R$\s]/g, '');

  if (compact === '') {
    return null;
  }

  const normalized =
    compact.includes(',') || /^\d{1,3}(\.\d{3})+$/.test(compact)
      ? compact.replace(/\./g, '').replace(',', '.')
      : compact;

  return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : undefined;
};

export const formatCentralAmountInput = (amount: number | null) =>
  isDefined(amount) ? amount.toFixed(2).replace('.', ',') : '';

export const isAcessoPendingReview = (acesso: CentralAcesso, now: Date) => {
  const days = getDaysSinceReview(acesso.revisadoEm, now);

  return !isDefined(days) || days > REVIEW_MAX_AGE_IN_DAYS;
};
