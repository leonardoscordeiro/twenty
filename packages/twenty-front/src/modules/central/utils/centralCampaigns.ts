// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { isNonEmptyString } from '@sniptt/guards';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type CentralCampaign = {
  id: string;
  name: string | null;
  subject: string | null;
  status: string;
  createdAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number | null;
  deliveredCount: number | null;
  failedCount: number | null;
  bouncedCount: number | null;
  uniqueOpenCount: number | null;
  uniqueClickCount: number | null;
  list: { id: string; name: string | null } | null;
};

export type CentralCampaignTab = 'all' | 'active' | 'draft' | 'done';

export type CentralCampaignTone =
  | 'progress'
  | 'neutral'
  | 'warning'
  | 'success';

const STATUS: Record<
  string,
  { label: string; tone: CentralCampaignTone; tab: CentralCampaignTab }
> = {
  [MessageCampaignStatus.DRAFT]: {
    label: 'Rascunho',
    tone: 'warning',
    tab: 'draft',
  },
  [MessageCampaignStatus.SCHEDULED]: {
    label: 'Agendada',
    tone: 'neutral',
    tab: 'active',
  },
  [MessageCampaignStatus.SENDING]: {
    label: 'Enviando',
    tone: 'progress',
    tab: 'active',
  },
  [MessageCampaignStatus.SENT]: {
    label: 'Encerrada',
    tone: 'success',
    tab: 'done',
  },
  [MessageCampaignStatus.SENT_WITH_ERRORS]: {
    label: 'Encerrada com erros',
    tone: 'warning',
    tab: 'done',
  },
  [MessageCampaignStatus.CANCELED]: {
    label: 'Cancelada',
    tone: 'neutral',
    tab: 'done',
  },
};

export const CENTRAL_CAMPAIGN_TABS: {
  id: CentralCampaignTab;
  label: string;
}[] = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Em andamento' },
  { id: 'draft', label: 'Rascunho' },
  { id: 'done', label: 'Encerradas' },
];

export const getCentralCampaignStatus = (status: string) =>
  STATUS[status] ?? {
    label: status,
    tone: 'neutral' as const,
    tab: 'done' as const,
  };

export const filterCentralCampaigns = (
  campaigns: CentralCampaign[],
  tab: CentralCampaignTab,
) =>
  tab === 'all'
    ? campaigns
    : campaigns.filter(
        (campaign) => getCentralCampaignStatus(campaign.status).tab === tab,
      );

export const getCentralCampaignFunnel = (campaign: CentralCampaign) => {
  const sent = campaign.sentCount ?? 0;

  return [
    { label: 'Enviados', value: sent },
    { label: 'Entregues', value: campaign.deliveredCount ?? 0 },
    { label: 'Abriram', value: campaign.uniqueOpenCount ?? 0 },
    { label: 'Clicaram', value: campaign.uniqueClickCount ?? 0 },
  ].map((step) => ({
    ...step,
    share: sent > 0 ? Math.round((step.value / sent) * 100) : 0,
  }));
};

export const hasCentralCampaignResults = (campaign: CentralCampaign) =>
  (campaign.sentCount ?? 0) > 0;

export const getCentralCampaignAudience = (campaign: CentralCampaign) =>
  isNonEmptyString(campaign.list?.name) ? campaign.list.name : null;

export const getCentralCampaignMissing = (campaign: CentralCampaign) => {
  const missing = [
    isDefined(campaign.list) ? null : 'público',
    isNonEmptyString(campaign.subject) ? null : 'assunto',
  ].filter(isNonEmptyString);

  return missing;
};

export const getCentralCampaignName = (campaign: CentralCampaign) =>
  isNonEmptyString(campaign.name) ? campaign.name : 'Campanha sem nome';
