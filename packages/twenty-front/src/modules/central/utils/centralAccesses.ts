import { type CentralAcesso } from '@/central/types/CentralCompany';
import { isAcessoPendingReview } from '@/central/utils/centralMoney';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export type CentralAccessRow = {
  acesso: CentralAcesso;
  clientName: string;
  typeLabel: string | null;
};

export type CentralAccessFilter = 'todos' | 'revisar' | 'confirmar' | 'login';

export type CentralAccessGroup = {
  clientName: string;
  rows: CentralAccessRow[];
};

// The vault path is free text; "confirmar" is how an unknown location gets written down.
export const isAcessoVaultToConfirm = (acesso: CentralAcesso) =>
  !isNonEmptyString(acesso.ondeEstaASenha) ||
  /confirmar/i.test(acesso.ondeEstaASenha);

const matchesFilter = (
  row: CentralAccessRow,
  filter: CentralAccessFilter,
  now: Date,
) => {
  switch (filter) {
    case 'revisar':
      return isAcessoPendingReview(row.acesso, now);
    case 'confirmar':
      return isAcessoVaultToConfirm(row.acesso);
    case 'login':
      return !isNonEmptyString(row.acesso.login);
    default:
      return true;
  }
};

const matchesQuery = (row: CentralAccessRow, query: string) =>
  [
    row.acesso.name,
    row.clientName,
    row.acesso.url?.primaryLinkUrl,
    row.acesso.ondeEstaASenha,
  ]
    .filter(isDefined)
    .some((text) => text.toLowerCase().includes(query));

export const getCentralAccessCounts = (
  rows: CentralAccessRow[],
  now: Date,
) => ({
  revisar: rows.filter((row) => matchesFilter(row, 'revisar', now)).length,
  confirmar: rows.filter((row) => matchesFilter(row, 'confirmar', now)).length,
  login: rows.filter((row) => matchesFilter(row, 'login', now)).length,
});

export const groupCentralAccessRows = (
  rows: CentralAccessRow[],
  {
    filter,
    typeLabel,
    query,
    now,
  }: {
    filter: CentralAccessFilter;
    typeLabel: string | null;
    query: string;
    now: Date;
  },
): CentralAccessGroup[] => {
  const normalizedQuery = query.trim().toLowerCase();
  const rowsByClient = new Map<string, CentralAccessRow[]>();

  for (const row of rows) {
    if (
      matchesFilter(row, filter, now) &&
      (!isDefined(typeLabel) || row.typeLabel === typeLabel) &&
      (normalizedQuery === '' || matchesQuery(row, normalizedQuery))
    ) {
      rowsByClient.set(row.clientName, [
        ...(rowsByClient.get(row.clientName) ?? []),
        row,
      ]);
    }
  }

  return [...rowsByClient.entries()]
    .map(([clientName, groupRows]) => ({ clientName, rows: groupRows }))
    .sort((first, second) =>
      first.clientName.localeCompare(second.clientName, 'pt-BR'),
    );
};
