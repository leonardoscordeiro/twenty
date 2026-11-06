import {
  getCentralAlerts,
  getCentralClientMargin,
  matchesCentralSearch,
} from '@/central/utils/centralAlerts';
import { parseCentralAmount } from '@/central/utils/centralMoney';
import { toCentralCompanies } from '@/central/utils/toCentralCompanies';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';

// Shape returned by the companies query in production: relations are connections and the
// workspace names them freely (custoInfraCliente, acessosCliente), some with no edges.
const COMPANIES_RESPONSE = {
  __typename: 'CompanyConnection',
  edges: [
    {
      __typename: 'CompanyEdge',
      node: {
        __typename: 'Company',
        id: 'conseg',
        name: 'ConSeg Contempladas',
        mensalidade: {
          __typename: 'Currency',
          amountMicros: null,
          currencyCode: 'BRL',
        },
        custoInfraCliente: {
          __typename: 'CustoInfraConnection',
          edges: [
            {
              __typename: 'CustoInfraEdge',
              node: {
                __typename: 'CustoInfra',
                id: 'railway',
                name: 'Railway backend',
                provedor: 'RAILWAY',
                servico: 'api.consegcontempladas.com',
                custoMensal: {
                  __typename: 'Currency',
                  amountMicros: 25_000_000,
                  currencyCode: 'BRL',
                },
              },
            },
            {
              __typename: 'CustoInfraEdge',
              node: {
                __typename: 'CustoInfra',
                id: 'supabase',
                name: 'Supabase',
                provedor: 'SUPABASE',
                servico: null,
                custoMensal: {
                  __typename: 'Currency',
                  amountMicros: null,
                  currencyCode: 'BRL',
                },
              },
            },
          ],
        },
        acessosCliente: {
          __typename: 'AcessoConnection',
          edges: [
            {
              __typename: 'AcessoEdge',
              node: {
                __typename: 'Acesso',
                id: 'github',
                name: 'GitHub',
                login: 'leonardoscordeiro',
                revisadoEm: null,
              },
            },
          ],
        },
        noteTargets: { __typename: 'NoteTargetConnection', edges: [] },
      },
    },
    {
      __typename: 'CompanyEdge',
      node: {
        __typename: 'Company',
        id: 'v8',
        name: 'V8',
        mensalidade: {
          __typename: 'Currency',
          amountMicros: 300_000_000,
          currencyCode: 'BRL',
        },
        custoInfraCliente: { __typename: 'CustoInfraConnection', edges: [] },
        acessosCliente: {
          __typename: 'AcessoConnection',
          edges: [
            {
              __typename: 'AcessoEdge',
              node: {
                __typename: 'Acesso',
                id: 'neon',
                name: 'Neon',
                login: null,
                revisadoEm: '2026-11-05',
              },
            },
          ],
        },
        noteTargets: { __typename: 'NoteTargetConnection', edges: [] },
      },
    },
  ],
} as unknown as RecordGqlConnectionEdgesRequired;

const RELATION_FIELD_NAMES = [
  { target: 'custoInfra', fieldName: 'custoInfraCliente' },
  { target: 'acesso', fieldName: 'acessosCliente' },
  { target: 'noteTarget', fieldName: 'noteTargets' },
  // Relation missing from this workspace's metadata.
  { target: 'person', fieldName: undefined },
] as const;

const NOW = new Date('2026-11-05T23:30:00-03:00');

const companies = toCentralCompanies(
  getRecordsFromRecordConnection({ recordConnection: COMPANIES_RESPONSE }),
  [...RELATION_FIELD_NAMES],
);

describe('centralAlerts', () => {
  it('maps connections to arrays, including empty and missing relations', () => {
    const [conseg, v8] = companies;

    expect(conseg.custosInfra.map((custo) => custo.id)).toEqual([
      'railway',
      'supabase',
    ]);
    expect(v8.custosInfra).toEqual([]);
    expect(v8.noteTargets).toEqual([]);
    expect(v8.people).toEqual([]);
  });

  it('builds the "Precisa de você" alerts from the real data', () => {
    const alerts = getCentralAlerts(companies, NOW);

    expect(alerts.map((alert) => [alert.id, alert.title])).toEqual([
      ['mensalidade', 'Mensalidade vazia em 1 cliente'],
      ['custos', '1 custo de infra sem valor'],
      ['acessos', '1 acesso a revisar'],
    ]);
    expect(alerts[1].links).toEqual([
      { label: 'ConSeg Contempladas 1', path: '/central/conseg?aba=infra' },
    ]);
    expect(alerts[2].actionPath).toBe('/central/conseg?aba=acessos');
  });

  it('only shows a margin when nothing is missing', () => {
    const [conseg, v8] = companies;

    expect(getCentralClientMargin(conseg)).toMatchObject({
      margin: null,
      isComplete: false,
      missingCostCount: 1,
      reason: '1 custo e a mensalidade sem valor',
    });
    expect(getCentralClientMargin(v8)).toMatchObject({
      margin: 300,
      isComplete: true,
      reason: null,
    });
  });

  it('searches by client, provider label and access', () => {
    const [conseg] = companies;
    const getProvedorLabel = (value: string | null) =>
      value === 'RAILWAY' ? 'Railway' : value;

    expect(matchesCentralSearch(conseg, 'consórcio', getProvedorLabel)).toBe(
      false,
    );
    expect(matchesCentralSearch(conseg, 'railway', getProvedorLabel)).toBe(
      true,
    );
    expect(matchesCentralSearch(conseg, 'GITHUB', getProvedorLabel)).toBe(true);
  });

  it('parses pt-BR amounts typed in place', () => {
    expect(parseCentralAmount('1.234,56')).toBe(1234.56);
    expect(parseCentralAmount('R$ 89,9')).toBe(89.9);
    expect(parseCentralAmount('89.90')).toBe(89.9);
    expect(parseCentralAmount('')).toBeNull();
    expect(parseCentralAmount('abc')).toBeUndefined();
  });
});
