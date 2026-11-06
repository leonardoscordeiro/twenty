import { type CentralCustoInfra } from '@/central/types/CentralCompany';
import {
  type CentralCostSummary,
  fromAmountMicros,
  getCentralCostSummary,
} from '@/central/utils/centralMoney';
import { isDefined } from 'twenty-shared/utils';

export type CentralCostRow = {
  custo: CentralCustoInfra;
  provider: string;
  clientName: string;
};

export type CentralCostGroupMode = 'provedor' | 'cliente';

export type CentralCostFilter = 'todos' | 'preencher';

export type CentralCostGroup = {
  title: string;
  rows: CentralCostRow[];
  summary: CentralCostSummary;
  missingCount: number;
};

export const isCentralCostMissing = (row: CentralCostRow) =>
  !isDefined(fromAmountMicros(row.custo.custoMensal));

const matchesQuery = (row: CentralCostRow, query: string) =>
  [row.provider, row.clientName, row.custo.servico, row.custo.name]
    .filter(isDefined)
    .some((text) => text.toLowerCase().includes(query));

export const groupCentralCostRows = (
  rows: CentralCostRow[],
  {
    mode,
    filter,
    query,
  }: { mode: CentralCostGroupMode; filter: CentralCostFilter; query: string },
): CentralCostGroup[] => {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(
    (row) =>
      (filter === 'todos' || isCentralCostMissing(row)) &&
      (normalizedQuery === '' || matchesQuery(row, normalizedQuery)),
  );

  const rowsByTitle = new Map<string, CentralCostRow[]>();

  for (const row of visibleRows) {
    const title = mode === 'provedor' ? row.provider : row.clientName;

    rowsByTitle.set(title, [...(rowsByTitle.get(title) ?? []), row]);
  }

  return [...rowsByTitle.entries()]
    .map(([title, groupRows]) => ({
      title,
      rows: groupRows,
      summary: getCentralCostSummary(
        groupRows.map((row) => row.custo.custoMensal),
      ),
      missingCount: groupRows.filter(isCentralCostMissing).length,
    }))
    .sort(
      (first, second) =>
        second.rows.length - first.rows.length ||
        first.title.localeCompare(second.title, 'pt-BR'),
    );
};
