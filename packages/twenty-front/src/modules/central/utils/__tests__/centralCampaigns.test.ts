import {
  type CentralCampaign,
  filterCentralCampaigns,
  getCentralCampaignFunnel,
  getCentralCampaignMissing,
  getCentralCampaignStatus,
  hasCentralCampaignResults,
} from '@/central/utils/centralCampaigns';

const buildCampaign = (
  overrides: Partial<CentralCampaign>,
): CentralCampaign => ({
  id: 'campaign-id',
  name: 'Administradoras',
  subject: 'Uma ideia pra sua revenda',
  status: 'DRAFT',
  createdAt: '2026-11-01T10:00:00.000Z',
  scheduledAt: null,
  sentAt: null,
  sentCount: 0,
  deliveredCount: 0,
  failedCount: 0,
  bouncedCount: 0,
  uniqueOpenCount: 0,
  uniqueClickCount: 0,
  list: { id: 'list-id', name: 'Administradoras de consórcio' },
  ...overrides,
});

describe('filterCentralCampaigns', () => {
  const campaigns = [
    buildCampaign({ id: 'draft', status: 'DRAFT' }),
    buildCampaign({ id: 'scheduled', status: 'SCHEDULED' }),
    buildCampaign({ id: 'sending', status: 'SENDING' }),
    buildCampaign({ id: 'sent', status: 'SENT' }),
    buildCampaign({ id: 'canceled', status: 'CANCELED' }),
  ];

  it('groups scheduled and sending as in progress', () => {
    expect(
      filterCentralCampaigns(campaigns, 'active').map((item) => item.id),
    ).toEqual(['scheduled', 'sending']);
  });

  it('puts sent and canceled under done', () => {
    expect(
      filterCentralCampaigns(campaigns, 'done').map((item) => item.id),
    ).toEqual(['sent', 'canceled']);
  });

  it('returns everything for all', () => {
    expect(filterCentralCampaigns(campaigns, 'all')).toHaveLength(5);
  });
});

describe('getCentralCampaignFunnel', () => {
  it('computes shares against sent', () => {
    const funnel = getCentralCampaignFunnel(
      buildCampaign({
        sentCount: 40,
        deliveredCount: 38,
        uniqueOpenCount: 22,
        uniqueClickCount: 5,
      }),
    );

    expect(funnel.map((step) => [step.label, step.value, step.share])).toEqual([
      ['Enviados', 40, 100],
      ['Entregues', 38, 95],
      ['Abriram', 22, 55],
      ['Clicaram', 5, 13],
    ]);
  });

  it('never divides by zero', () => {
    expect(
      getCentralCampaignFunnel(buildCampaign({ sentCount: null })).every(
        (step) => step.share === 0,
      ),
    ).toBe(true);
    expect(hasCentralCampaignResults(buildCampaign({ sentCount: null }))).toBe(
      false,
    );
  });
});

describe('getCentralCampaignMissing', () => {
  it('lists audience and subject when absent', () => {
    expect(
      getCentralCampaignMissing(buildCampaign({ list: null, subject: '' })),
    ).toEqual(['público', 'assunto']);
  });

  it('is empty when ready', () => {
    expect(getCentralCampaignMissing(buildCampaign({}))).toEqual([]);
  });
});

describe('getCentralCampaignStatus', () => {
  it('labels sent with errors as a warning', () => {
    expect(getCentralCampaignStatus('SENT_WITH_ERRORS')).toMatchObject({
      label: 'Encerrada com erros',
      tone: 'warning',
    });
  });
});
