// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralPageLayout } from '@/central/components/CentralPageLayout';
import {
  centralButtonClassName,
  StyledCentralCard,
  StyledCentralMuted,
  StyledCentralSectionTitle,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralCampaigns } from '@/central/hooks/useCentralCampaigns';
import {
  CENTRAL_CAMPAIGN_TABS,
  type CentralCampaign,
  type CentralCampaignTab,
  filterCentralCampaigns,
  getCentralCampaignAudience,
  getCentralCampaignFunnel,
  getCentralCampaignMissing,
  getCentralCampaignName,
  getCentralCampaignStatus,
  hasCentralCampaignResults,
} from '@/central/utils/centralCampaigns';
import { getNativeRecordPath } from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconBrandWhatsapp, IconMail, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const CAMPAIGNS_INDEX_PATH = getAppPath(AppPath.RecordIndexPage, {
  objectNamePlural: 'messageCampaigns',
});

const StyledHeader = styled.header`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledTabs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
`;

const StyledTab = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 999px;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  flex: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  min-height: 40px;
  padding: 0 14px;

  &[aria-selected='true'] {
    background: ${themeCssVariables.grayScale.gray12};
    border-color: ${themeCssVariables.grayScale.gray12};
    color: ${themeCssVariables.grayScale.gray1};
  }
`;

const StyledColumns = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const StyledList = styled.section`
  display: flex;
  flex: 999 1 560px;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const StyledCampaignButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  box-sizing: border-box;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  font-family: inherit;
  gap: 14px;
  padding: 16px 18px;
  text-align: left;
  width: 100%;

  &[aria-pressed='true'] {
    border-color: ${themeCssVariables.grayScale.gray12};
    box-shadow: 0 0 0 1px ${themeCssVariables.grayScale.gray12};
  }
`;

const StyledIconBox = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 11px;
  display: flex;
  flex: none;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledCampaignMain = styled.span`
  display: flex;
  flex: 1 1 260px;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledNameLine = styled.span`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledName = styled.span`
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 16px;
  font-weight: 600;
`;

const StyledPill = styled.span`
  align-self: flex-start;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  white-space: nowrap;

  &[data-tone='progress'] {
    background: ${themeCssVariables.tag.background.blue};
    color: ${themeCssVariables.tag.text.blue};
  }

  &[data-tone='warning'] {
    background: ${themeCssVariables.tag.background.amber};
    color: ${themeCssVariables.tag.text.amber};
  }

  &[data-tone='success'] {
    background: ${themeCssVariables.tag.background.green};
    color: ${themeCssVariables.tag.text.green};
  }
`;

const StyledNumbers = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex: 1 1 240px;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 16px;
`;

const StyledNumber = styled.b`
  color: ${themeCssVariables.font.color.primary};
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 16px;
`;

const StyledAside = styled.aside`
  display: flex;
  flex: 1 1 340px;
  flex-direction: column;
  gap: 12px;
  max-width: 440px;
`;

const StyledBarLabel = styled.span`
  display: flex;
  font-size: 13px;
  justify-content: space-between;
`;

const StyledBarTrack = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 8px;
  display: block;
  height: 8px;
  overflow: hidden;
`;

const StyledBarFill = styled.span<{ share: number }>`
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 8px;
  display: block;
  height: 8px;
  width: ${({ share }) => `${share}%`};
`;

const StyledBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledSubject = styled.p`
  background: ${themeCssVariables.background.secondary};
  border-radius: 12px;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  padding: 14px;
`;

const StyledSubtitle = styled.h3`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledAlertRow = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding-top: 12px;
`;

const StyledAlertText = styled.div`
  display: flex;
  flex: 1 1 320px;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledStrong = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

const StyledChannelGrid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const StyledChannelName = styled.span`
  align-items: center;
  display: flex;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 19px;
  font-weight: 600;
  gap: 12px;
`;

const StyledParagraph = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

const StyledRequirement = styled.span`
  align-self: flex-start;
  background: ${themeCssVariables.tag.background.amber};
  border: 1px dashed ${themeCssVariables.tag.text.amber};
  border-radius: 8px;
  color: ${themeCssVariables.tag.text.amber};
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
`;

const StyledEmptyTitle = styled.h2`
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const getListNumbers = (campaign: CentralCampaign) =>
  hasCentralCampaignResults(campaign)
    ? getCentralCampaignFunnel(campaign)
        .filter((step) => step.label !== 'Entregues')
        .map((step) => ({ value: step.value, label: step.label.toLowerCase() }))
    : [];

const getFooter = (campaign: CentralCampaign) => {
  const missing = getCentralCampaignMissing(campaign);

  if (campaign.status === 'DRAFT' && missing.length > 0) {
    return `Falta: ${missing.join(' e ')}`;
  }

  if (campaign.status === 'SCHEDULED' && isDefined(campaign.scheduledAt)) {
    return `Sai em ${new Date(campaign.scheduledAt).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })}`;
  }

  if (isDefined(campaign.sentAt)) {
    return `Enviada em ${new Date(campaign.sentAt).toLocaleDateString('pt-BR')}`;
  }

  return null;
};

const CampaignStatusPill = ({ status }: { status: string }) => {
  const { label, tone } = getCentralCampaignStatus(status);

  return <StyledPill data-tone={tone}>{label}</StyledPill>;
};

const EmptyCampaigns = () => (
  <StyledCentralCard>
    <StyledEmptyTitle>Nenhuma campanha ainda</StyledEmptyTitle>
    <StyledParagraph>
      Escolha por onde vai falar com as pessoas. O público sai das listas de
      Pessoas que já estão no CRM.
    </StyledParagraph>
    <StyledChannelGrid>
      <StyledCentralCard>
        <StyledChannelName>
          <StyledIconBox aria-hidden="true">
            <IconMail size={20} />
          </StyledIconBox>
          E-mail
        </StyledChannelName>
        <StyledParagraph>
          Sai da sua conta de e-mail conectada no CRM. Você monta, testa e
          decide quando enviar.
        </StyledParagraph>
        <Link
          className={centralButtonClassName}
          data-inverted
          to={CAMPAIGNS_INDEX_PATH}
        >
          Criar campanha de e-mail
        </Link>
      </StyledCentralCard>
      <StyledCentralCard>
        <StyledChannelName>
          <StyledIconBox aria-hidden="true">
            <IconBrandWhatsapp size={20} />
          </StyledIconBox>
          WhatsApp
        </StyledChannelName>
        <StyledParagraph>
          Mensagem curta pro celular. Precisa de número verificado e modelo
          aprovado na API oficial.
        </StyledParagraph>
        <StyledRequirement>Ainda não disponível no CRM</StyledRequirement>
      </StyledCentralCard>
    </StyledChannelGrid>
  </StyledCentralCard>
);

export const CentralCampaignsPage = () => {
  const { campaigns, loading } = useCentralCampaigns();
  const [tab, setTab] = useState<CentralCampaignTab>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = filterCentralCampaigns(campaigns, tab);
  const selected =
    visible.find((campaign) => campaign.id === selectedId) ?? visible[0];
  const stuckDrafts = campaigns.filter(
    (campaign) =>
      campaign.status === 'DRAFT' &&
      getCentralCampaignMissing(campaign).length > 0,
  );
  const withErrors = campaigns.filter(
    (campaign) => campaign.status === 'SENT_WITH_ERRORS',
  );

  return (
    <CentralPageLayout title="Campanhas">
      <StyledHeader>
        <StyledHeading>
          <StyledCentralTitle>Campanhas</StyledCentralTitle>
          <StyledCentralMuted>
            Envios de prospecção. Quem responde vira oportunidade.
          </StyledCentralMuted>
        </StyledHeading>
        <Link
          className={centralButtonClassName}
          data-inverted
          to={CAMPAIGNS_INDEX_PATH}
        >
          <IconPlus size={16} />
          Nova campanha
        </Link>
      </StyledHeader>

      {!loading && campaigns.length === 0 && <EmptyCampaigns />}

      {stuckDrafts.length + withErrors.length > 0 && (
        <StyledCentralCard aria-label="Precisa de você">
          <StyledCentralSectionTitle>Precisa de você</StyledCentralSectionTitle>
          {[...withErrors, ...stuckDrafts].map((campaign) => (
            <StyledAlertRow key={campaign.id}>
              <StyledAlertText>
                <StyledStrong>
                  {campaign.status === 'DRAFT'
                    ? `Rascunho parado: ${getCentralCampaignName(campaign)}`
                    : `${getCentralCampaignName(campaign)} teve erros de envio`}
                </StyledStrong>
                <StyledCentralMuted>
                  {campaign.status === 'DRAFT'
                    ? `Falta: ${getCentralCampaignMissing(campaign).join(' e ')}`
                    : `${campaign.failedCount ?? 0} falharam · ${campaign.bouncedCount ?? 0} voltaram`}
                </StyledCentralMuted>
              </StyledAlertText>
              <Link
                className={centralButtonClassName}
                data-inverted
                to={getNativeRecordPath('messageCampaign', campaign.id)}
              >
                {campaign.status === 'DRAFT' ? 'Continuar' : 'Ver detalhes'}
              </Link>
            </StyledAlertRow>
          ))}
        </StyledCentralCard>
      )}

      {campaigns.length > 0 && (
        <>
          <StyledTabs role="tablist" aria-label="Filtrar campanhas">
            {CENTRAL_CAMPAIGN_TABS.map((item) => (
              <StyledTab
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
              >
                {item.label} {filterCentralCampaigns(campaigns, item.id).length}
              </StyledTab>
            ))}
          </StyledTabs>

          <StyledColumns>
            <StyledList aria-label="Lista de campanhas">
              {visible.length === 0 && (
                <StyledCentralMuted>Nenhuma campanha aqui.</StyledCentralMuted>
              )}
              {visible.map((campaign) => {
                const footer = getFooter(campaign);
                const numbers = getListNumbers(campaign);

                return (
                  <StyledCampaignButton
                    key={campaign.id}
                    type="button"
                    aria-pressed={campaign.id === selected?.id}
                    onClick={() => setSelectedId(campaign.id)}
                  >
                    <StyledIconBox aria-hidden="true">
                      <IconMail size={18} />
                    </StyledIconBox>
                    <StyledCampaignMain>
                      <StyledNameLine>
                        <StyledName>
                          {getCentralCampaignName(campaign)}
                        </StyledName>
                        <CampaignStatusPill status={campaign.status} />
                      </StyledNameLine>
                      <StyledCentralMuted>
                        E-mail ·{' '}
                        {getCentralCampaignAudience(campaign) ??
                          'público não escolhido'}
                      </StyledCentralMuted>
                    </StyledCampaignMain>
                    <StyledNumbers>
                      {numbers.map((number) => (
                        <span key={number.label}>
                          <StyledNumber>{number.value}</StyledNumber>{' '}
                          {number.label}
                        </span>
                      ))}
                      {isDefined(footer) && (
                        <StyledCentralMuted>{footer}</StyledCentralMuted>
                      )}
                    </StyledNumbers>
                  </StyledCampaignButton>
                );
              })}
            </StyledList>

            {isDefined(selected) && (
              <StyledAside aria-label="Detalhe da campanha">
                <StyledCentralCard>
                  <CampaignStatusPill status={selected.status} />
                  <StyledCentralSectionTitle>
                    {getCentralCampaignName(selected)}
                  </StyledCentralSectionTitle>
                  <StyledCentralMuted>
                    E-mail ·{' '}
                    {getCentralCampaignAudience(selected) ??
                      'público não escolhido'}
                  </StyledCentralMuted>

                  <StyledSubtitle>Resultado</StyledSubtitle>
                  {hasCentralCampaignResults(selected) ? (
                    getCentralCampaignFunnel(selected).map((step) => (
                      <StyledBar key={step.label}>
                        <StyledBarLabel>
                          <span>{step.label}</span>
                          <b>
                            {step.value} · {step.share}%
                          </b>
                        </StyledBarLabel>
                        <StyledBarTrack>
                          <StyledBarFill share={step.share} />
                        </StyledBarTrack>
                      </StyledBar>
                    ))
                  ) : (
                    <StyledSubject>
                      Ainda não saiu. O resultado aparece aqui conforme envia.
                    </StyledSubject>
                  )}

                  <StyledSubtitle>Assunto</StyledSubtitle>
                  <StyledSubject>
                    {selected.subject ?? 'Assunto não escrito'}
                  </StyledSubject>

                  <Link
                    className={centralButtonClassName}
                    data-inverted
                    to={getNativeRecordPath('messageCampaign', selected.id)}
                  >
                    {selected.status === 'DRAFT'
                      ? 'Continuar editando'
                      : 'Abrir campanha'}
                  </Link>
                </StyledCentralCard>
              </StyledAside>
            )}
          </StyledColumns>
        </>
      )}
    </CentralPageLayout>
  );
};
