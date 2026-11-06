import { type CentralCompany } from '@/central/types/CentralCompany';
import { type CentralOpportunity } from '@/central/utils/centralOpportunities';
import {
  getAcessoReviewSummary,
  getBusinessHeadline,
  getBusinessMargin,
  getInfraCostSummary,
  getPipelineStages,
  getRevenueSummary,
  getVencimentos,
} from '@/paineis/utils/paineisSummary';

const NOW = new Date('2026-11-06T12:00:00');

const money = (amount: number | null) => ({
  amountMicros: amount === null ? null : amount * 1e6,
  currencyCode: 'BRL',
});

const company = (
  mensalidade: number | null,
  custos: { valor: number | null; renovacao?: string | null }[],
  revisoes: (string | null)[] = [],
) =>
  ({
    id: `c${mensalidade}`,
    name: 'Cliente',
    mensalidade: money(mensalidade),
    custosInfra: custos.map((custo, index) => ({
      id: `k${index}`,
      name: `Custo ${index}`,
      custoMensal: money(custo.valor),
      renovacao: custo.renovacao ?? null,
    })),
    acessos: revisoes.map((revisadoEm, index) => ({
      id: `a${index}`,
      revisadoEm,
    })),
  }) as unknown as CentralCompany;

describe('paineisSummary', () => {
  it('never shows a margin while something is empty', () => {
    const companies = [company(1000, [{ valor: 100 }, { valor: null }])];
    const revenue = getRevenueSummary(companies);
    const infraCost = getInfraCostSummary(companies);
    const margin = getBusinessMargin(revenue, infraCost);

    expect(margin).toBeNull();
    expect(getBusinessHeadline(revenue, infraCost, margin)).toBe(
      'Receita e margem ainda não fecham: faltam 1 custo',
    );
  });

  it('computes the margin when everything is filled', () => {
    const companies = [company(1000, [{ valor: 250 }])];
    const revenue = getRevenueSummary(companies);
    const infraCost = getInfraCostSummary(companies);
    const margin = getBusinessMargin(revenue, infraCost);

    expect(margin).toBe(750);
    expect(getBusinessHeadline(revenue, infraCost, margin)).toBe(
      'Margem de 75% neste mês',
    );
  });

  it('lists renewals inside 90 days, nearest first', () => {
    const vencimentos = getVencimentos(
      [
        company(null, [
          { valor: null, renovacao: '2027-01-07' },
          { valor: null, renovacao: '2026-11-10' },
          { valor: null, renovacao: '2027-06-01' },
          { valor: null, renovacao: '2026-10-01' },
          { valor: null, renovacao: 'mensal' },
        ]),
      ],
      NOW,
    );

    expect(vencimentos.map((item) => item.daysLeft)).toEqual([4, 62]);
  });

  it('counts accesses never reviewed or stale', () => {
    expect(
      getAcessoReviewSummary(
        [company(null, [], [null, '2026-11-01', '2026-01-01'])],
        NOW,
      ),
    ).toEqual({ total: 3, pendingCount: 2, neverReviewedCount: 1 });
  });

  it('leaves closed stages out of the pipeline', () => {
    const opportunities = [
      { stage: 'NEW', amount: money(500) },
      { stage: 'NEW', amount: money(null) },
      { stage: 'CUSTOMER', amount: money(900) },
    ] as unknown as CentralOpportunity[];

    expect(
      getPipelineStages(opportunities, [
        { value: 'NEW', label: 'Novo' },
        { value: 'CUSTOMER', label: 'Cliente' },
      ]),
    ).toEqual([
      {
        value: 'NEW',
        label: 'Novo',
        total: 500,
        count: 2,
        missingAmountCount: 1,
      },
    ]);
  });
});
