import { type CentralCustoInfra } from '@/central/types/CentralCompany';
import {
  type CentralCostRow,
  groupCentralCostRows,
} from '@/central/utils/centralCosts';

const costRow = (
  id: string,
  provider: string,
  clientName: string,
  amountMicros: number | null = null,
): CentralCostRow => ({
  custo: {
    id,
    servico: `${provider} ${id}`,
    custoMensal: { amountMicros, currencyCode: 'BRL' },
  } as CentralCustoInfra,
  provider,
  clientName,
});

const ROWS = [
  costRow('1', 'Railway', 'V8', 20_000_000),
  costRow('2', 'Railway', 'ConSeg'),
  costRow('3', 'Focus NFe', 'V8'),
  costRow('4', 'Supabase', 'ConSeg', 25_000_000),
];

describe('groupCentralCostRows', () => {
  it('groups by provider with a lower-bound subtotal and the missing count', () => {
    const [railway] = groupCentralCostRows(ROWS, {
      mode: 'provedor',
      filter: 'todos',
      query: '',
    });

    expect(railway.title).toBe('Railway');
    expect(railway.summary).toEqual({ total: 20, filledCount: 1, count: 2 });
    expect(railway.missingCount).toBe(1);
  });

  it('groups by client and keeps only empty costs on the fill filter', () => {
    const groups = groupCentralCostRows(ROWS, {
      mode: 'cliente',
      filter: 'preencher',
      query: '',
    });

    expect(
      groups.map((group) => [
        group.title,
        group.rows.map((row) => row.custo.id),
      ]),
    ).toEqual([
      ['ConSeg', ['2']],
      ['V8', ['3']],
    ]);
  });

  it('searches provider, client and service text', () => {
    const groups = groupCentralCostRows(ROWS, {
      mode: 'provedor',
      filter: 'todos',
      query: ' focus ',
    });

    expect(groups.map((group) => group.title)).toEqual(['Focus NFe']);
  });
});
