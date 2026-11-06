// Painéis is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { type CentralCompany } from '@/central/types/CentralCompany';
import {
  type CentralCostSummary,
  fromAmountMicros,
  getCentralCostSummary,
  getDaysSinceReview,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import {
  type CentralOpportunity,
  getStageSummary,
  isClosedStage,
} from '@/central/utils/centralOpportunities';
import { pluralize } from '@/central/utils/centralText';
import { isDefined } from 'twenty-shared/utils';

export const VENCIMENTO_WINDOW_IN_DAYS = 90;

export type PaineisStageOption = { value: string; label: string };

export type PaineisVencimento = {
  id: string;
  label: string;
  companyName: string | null;
  daysLeft: number;
};

export const getRevenueSummary = (
  companies: CentralCompany[],
): CentralCostSummary =>
  getCentralCostSummary(companies.map((company) => company.mensalidade));

export const getInfraCostSummary = (companies: CentralCompany[]) =>
  getCentralCostSummary(
    companies.flatMap((company) =>
      company.custosInfra.map((custo) => custo.custoMensal),
    ),
  );

// Margin only exists when every revenue and cost is filled: a partial number would mislead.
export const getBusinessMargin = (
  revenue: CentralCostSummary,
  infraCost: CentralCostSummary,
) =>
  revenue.count > 0 &&
  revenue.filledCount === revenue.count &&
  infraCost.filledCount === infraCost.count
    ? revenue.total - infraCost.total
    : null;

export const getBusinessHeadline = (
  revenue: CentralCostSummary,
  infraCost: CentralCostSummary,
  margin: number | null,
) => {
  if (isDefined(margin)) {
    const percent =
      revenue.total > 0 ? Math.round((margin / revenue.total) * 100) : null;

    return isDefined(percent)
      ? `Margem de ${percent}% neste mês`
      : 'Margem do mês calculada';
  }

  const missing = [
    revenue.filledCount < revenue.count &&
      pluralize(
        revenue.count - revenue.filledCount,
        'mensalidade',
        'mensalidades',
      ),
    infraCost.filledCount < infraCost.count &&
      pluralize(infraCost.count - infraCost.filledCount, 'custo', 'custos'),
  ].filter((item): item is string => item !== false);

  return missing.length > 0
    ? `Receita e margem ainda não fecham: faltam ${missing.join(' e ')}`
    : 'Nenhum cliente com mensalidade ainda';
};

export const getPipelineStages = (
  opportunities: CentralOpportunity[],
  stageOptions: PaineisStageOption[],
) =>
  stageOptions
    .filter((option) => !isClosedStage(option.value))
    .map((option) => ({
      ...option,
      ...getStageSummary(
        opportunities.filter(
          (opportunity) => opportunity.stage === option.value,
        ),
      ),
    }));

export const getVencimentos = (
  companies: CentralCompany[],
  now: Date,
): PaineisVencimento[] =>
  companies
    .flatMap((company) =>
      company.custosInfra.map((custo) => {
        const daysSince = getDaysSinceReview(custo.renovacao, now);

        return {
          id: custo.id,
          label: custo.name ?? custo.servico ?? 'Renovação',
          companyName: company.name,
          daysLeft: isDefined(daysSince) ? -daysSince : null,
        };
      }),
    )
    .filter(
      (item): item is PaineisVencimento =>
        isDefined(item.daysLeft) &&
        !Number.isNaN(item.daysLeft) &&
        item.daysLeft >= 0 &&
        item.daysLeft <= VENCIMENTO_WINDOW_IN_DAYS,
    )
    .sort((first, second) => first.daysLeft - second.daysLeft);

export const getAcessoReviewSummary = (
  companies: CentralCompany[],
  now: Date,
) => {
  const acessos = companies.flatMap((company) => company.acessos);
  const pending = acessos.filter((acesso) =>
    isAcessoPendingReview(acesso, now),
  );

  return {
    total: acessos.length,
    pendingCount: pending.length,
    neverReviewedCount: pending.filter(
      (acesso) => !isDefined(acesso.revisadoEm),
    ).length,
  };
};

export const getOpenOpportunitiesWithoutAmount = (
  opportunities: CentralOpportunity[],
) =>
  opportunities.filter(
    (opportunity) =>
      !isClosedStage(opportunity.stage) &&
      !isDefined(fromAmountMicros(opportunity.amount)),
  ).length;
