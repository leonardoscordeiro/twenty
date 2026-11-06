import { type CentralAcesso } from '@/central/types/CentralCompany';
import {
  type CentralAccessRow,
  getCentralAccessCounts,
  groupCentralAccessRows,
  isAcessoVaultToConfirm,
} from '@/central/utils/centralAccesses';

const NOW = new Date('2026-11-06T12:00:00');

const accessRow = (
  id: string,
  clientName: string,
  fields: Partial<CentralAcesso>,
  typeLabel: string | null = 'Banco de dados',
): CentralAccessRow => ({
  acesso: {
    id,
    name: id,
    login: null,
    ondeEstaASenha: 'Conta Supabase',
    revisadoEm: null,
    url: null,
    ...fields,
  } as CentralAcesso,
  clientName,
  typeLabel,
});

const ROWS = [
  accessRow('admin', 'ConSeg', {
    login: 'admin@arka.com',
    ondeEstaASenha: 'Cofre (confirmar)',
    revisadoEm: '2026-11-01',
  }),
  accessRow('supabase', 'ConSeg', {}),
  accessRow('github', 'Arka', { revisadoEm: '2026-11-06' }, 'Código (GitHub)'),
];

describe('isAcessoVaultToConfirm', () => {
  it('flags an empty vault path or one written as "confirmar"', () => {
    expect(isAcessoVaultToConfirm(ROWS[0].acesso)).toBe(true);
    expect(isAcessoVaultToConfirm(ROWS[1].acesso)).toBe(false);
    expect(
      isAcessoVaultToConfirm({ ondeEstaASenha: null } as CentralAcesso),
    ).toBe(true);
  });
});

describe('groupCentralAccessRows', () => {
  it('groups by client in alphabetical order', () => {
    const groups = groupCentralAccessRows(ROWS, {
      filter: 'todos',
      typeLabel: null,
      query: '',
      now: NOW,
    });

    expect(groups.map((group) => group.clientName)).toEqual(['Arka', 'ConSeg']);
  });

  it('combines filter, type and search', () => {
    const groups = groupCentralAccessRows(ROWS, {
      filter: 'login',
      typeLabel: 'Banco de dados',
      query: 'supa',
      now: NOW,
    });

    expect(groups).toHaveLength(1);
    expect(groups[0].rows.map((row) => row.acesso.id)).toEqual(['supabase']);
  });

  it('counts what is missing', () => {
    expect(getCentralAccessCounts(ROWS, NOW)).toEqual({
      revisar: 1,
      confirmar: 1,
      login: 2,
    });
  });
});
