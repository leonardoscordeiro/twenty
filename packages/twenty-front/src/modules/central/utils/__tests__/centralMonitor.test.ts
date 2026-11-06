import { type CentralCompany } from '@/central/types/CentralCompany';
import {
  getCentralExpirationRows,
  getCentralMonitorAlerts,
  getDaysUntil,
  getHealthBars,
} from '@/central/utils/centralMonitor';

const NOW = new Date('2026-11-06T00:30:00-03:00');

// fimContrato is absent until the field exists in the workspace metadata.
const companies = [
  { id: 'v8', name: 'V8', custosInfra: [] },
  {
    id: 'conseg',
    name: 'ConSeg Contempladas',
    fimContrato: '2026-11-20',
    custosInfra: [
      { id: 'c', name: 'Supabase', servico: null, renovacao: null },
    ],
  },
] as unknown as CentralCompany[];

// Same shape the /rest/central-monitor/expirations endpoint returns.
const EXPIRATIONS = [
  {
    kind: 'certificate' as const,
    name: 'app.usev8.com',
    companyName: 'V8',
    expiresAt: '2026-11-15T21:47:25.000Z',
    error: null,
  },
  {
    kind: 'domain' as const,
    name: 'usev8.com',
    companyName: 'V8',
    expiresAt: '2027-10-10T22:13:16.000Z',
    error: null,
  },
];

describe('centralMonitor', () => {
  it('counts days by local calendar date', () => {
    expect(getDaysUntil('2026-11-06', NOW)).toBe(0);
    expect(getDaysUntil('2026-12-06', NOW)).toBe(30);
  });

  it('merges automatic dates, contracts and renewals, missing fields as undated', () => {
    const rows = getCentralExpirationRows(EXPIRATIONS, companies);

    expect(rows.map((row) => [row.kind, row.name, row.expiresAt])).toEqual([
      ['certificate', 'app.usev8.com', '2026-11-15T21:47:25.000Z'],
      ['domain', 'usev8.com', '2027-10-10T22:13:16.000Z'],
      ['contract', 'V8', null],
      ['contract', 'ConSeg Contempladas', '2026-11-20'],
    ]);
  });

  it('alerts certificates at 14 days and the rest at 30', () => {
    const rows = getCentralExpirationRows(EXPIRATIONS, companies);
    const [alert] = getCentralMonitorAlerts([], rows, NOW);

    expect(alert.title).toBe('2 vencimentos chegando');
    expect(alert.detail).toBe(
      'Certificado app.usev8.com em 9 dias · Contrato ConSeg Contempladas em 14 dias',
    );
  });

  it('only flags systems down after the server says so', () => {
    const target = {
      id: 'conseg',
      companyName: 'ConSeg Contempladas',
      url: 'https://api.consegcontempladas.com/api/health',
      lastMs: null,
      uptime: 0.5,
      history: [],
    };

    expect(
      getCentralMonitorAlerts([{ ...target, status: 'slow' }], [], NOW),
    ).toEqual([]);
    expect(
      getCentralMonitorAlerts([{ ...target, status: 'down' }], [], NOW)[0]
        .title,
    ).toBe('ConSeg Contempladas fora do ar');
  });

  it('keeps the worst check per bar over the last 24 h', () => {
    const bars = getHealthBars(
      [
        { at: '2026-11-06T03:20:00.000Z', ok: true, ms: 100 },
        { at: '2026-11-06T03:25:00.000Z', ok: false, ms: null },
        { at: '2026-11-04T00:00:00.000Z', ok: false, ms: null },
      ],
      NOW,
    );

    expect(bars).toHaveLength(48);
    expect(bars.at(-1)).toBe('down');
    expect(bars.filter((bar) => bar !== 'empty')).toHaveLength(1);
  });
});
