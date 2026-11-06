import {
  formatCentralCostTotal,
  getCentralCostSummary,
  getCentralMargin,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import { type CentralAcesso } from '@/central/types/CentralCompany';

const acessoReviewedAt = (revisadoEm: string | null) =>
  ({ id: 'a', revisadoEm }) as CentralAcesso;

describe('centralMoney', () => {
  it('never invents a value when nothing is filled', () => {
    const summary = getCentralCostSummary([null, { amountMicros: null }]);

    expect(formatCentralCostTotal(summary)).toBe('R$ —');
    expect(getCentralMargin(null, summary).margin).toBeNull();
  });

  it('flags partial totals and incomplete margins', () => {
    const summary = getCentralCostSummary([
      { amountMicros: 89_900_000 },
      { amountMicros: null },
    ]);

    expect(summary).toEqual({ total: 89.9, filledCount: 1, count: 2 });
    expect(formatCentralCostTotal(summary)).toMatch(/89,90 \+$/);
    expect(getCentralMargin(149, summary)).toEqual({
      margin: 149 - 89.9,
      isIncomplete: true,
    });
  });

  it('counts accesses never reviewed or older than 90 days', () => {
    const now = new Date('2026-11-05T12:00:00Z');

    expect(isAcessoPendingReview(acessoReviewedAt(null), now)).toBe(true);
    expect(isAcessoPendingReview(acessoReviewedAt('2026-07-01'), now)).toBe(
      true,
    );
    expect(isAcessoPendingReview(acessoReviewedAt('2026-10-01'), now)).toBe(
      false,
    );
  });
});
