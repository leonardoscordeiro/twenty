// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralPageLayout } from '@/central/components/CentralPageLayout';
import {
  StyledCentralCard,
  StyledCentralKpi,
  StyledCentralKpiGrid,
  StyledCentralKpiLabel,
  StyledCentralKpiValue,
  StyledCentralMuted,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import {
  type CentralHealthStatus,
  useCentralHealth,
} from '@/central/hooks/useCentralMonitor';
import { getHealthBars } from '@/central/utils/centralMonitor';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledDownBanner = styled.section`
  background: ${themeCssVariables.tag.background.red};
  border-radius: 16px;
  color: ${themeCssVariables.tag.text.red};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
`;

const StyledSystems = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow-x: auto;
`;

const StyledRow = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: 16px;
  grid-template-columns: 260px 100px 70px 70px minmax(200px, 1fr);
  min-width: 820px;
  padding: 14px 20px;

  &:first-of-type {
    border-top: 0;
    color: ${themeCssVariables.font.color.tertiary};
    font-size: 12px;
  }
`;

const StyledName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const StyledUrl = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
`;

const StyledNumber = styled.span`
  font-size: 13px;
  text-align: right;
`;

const StyledBars = styled.div`
  display: flex;
  gap: 2px;
  height: 28px;
`;

const BAR_COLORS = {
  empty: themeCssVariables.background.tertiary,
  ok: themeCssVariables.tag.text.green,
  slow: themeCssVariables.tag.text.amber,
  down: themeCssVariables.tag.text.red,
};

const StyledBar = styled.span<{ state: keyof typeof BAR_COLORS }>`
  background: ${({ state }) => BAR_COLORS[state]};
  border-radius: 2px;
  flex: 1;
  min-width: 3px;
`;

const STATUS = {
  ok: { label: 'No ar', tone: 'green' },
  slow: { label: 'Lento', tone: 'amber' },
  down: { label: 'Fora', tone: 'red' },
  pending: { label: '1ª checagem', tone: 'gray' },
  unmonitored: { label: 'Sem /health', tone: 'gray' },
} as const satisfies Record<
  CentralHealthStatus,
  { label: string; tone: 'green' | 'amber' | 'red' | 'gray' }
>;

const StyledPill = styled.span<{ tone: 'green' | 'amber' | 'red' | 'gray' }>`
  background: ${({ tone }) => themeCssVariables.tag.background[tone]};
  border-radius: 999px;
  color: ${({ tone }) => themeCssVariables.tag.text[tone]};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  white-space: nowrap;
`;

export const CentralHealthPage = () => {
  const { data, error } = useCentralHealth();
  const now = new Date();
  const targets = data?.targets ?? [];
  const downTargets = targets.filter((target) => target.status === 'down');
  const count = (status: CentralHealthStatus) =>
    targets.filter((target) => target.status === status).length;

  return (
    <CentralPageLayout title="Saúde dos sistemas">
      <StyledHeading>
        <StyledCentralTitle>Saúde dos sistemas</StyledCentralTitle>
        <StyledCentralMuted>
          O servidor do CRM checa cada cliente a cada 5 min. No ar = resposta
          abaixo de 500 em até 10 s.
        </StyledCentralMuted>
      </StyledHeading>

      {downTargets.length > 0 && (
        <StyledDownBanner role="alert">
          <strong>
            {downTargets.map((target) => target.companyName).join(', ')} fora do
            ar
          </strong>
          <span>Sem resposta em 2 checagens seguidas (10 min).</span>
        </StyledDownBanner>
      )}

      <StyledCentralKpiGrid aria-label="Resumo">
        {(['ok', 'slow', 'down', 'unmonitored'] as const).map((status) => (
          <StyledCentralKpi key={status}>
            <StyledCentralKpiLabel>
              {STATUS[status].label}
            </StyledCentralKpiLabel>
            <StyledCentralKpiValue>{count(status)}</StyledCentralKpiValue>
          </StyledCentralKpi>
        ))}
      </StyledCentralKpiGrid>

      {!isDefined(data) ? (
        <StyledCentralCard>
          <StyledCentralMuted>
            {error ? 'Não consegui ler a saúde agora.' : 'Carregando…'}
          </StyledCentralMuted>
        </StyledCentralCard>
      ) : (
        <StyledSystems aria-label="Sistemas">
          <StyledRow>
            <span>Cliente · endpoint</span>
            <span>Agora</span>
            <StyledNumber>Resposta</StyledNumber>
            <StyledNumber>24 h</StyledNumber>
            <span>últimas 24 h</span>
          </StyledRow>
          {targets.map((target) => (
            <StyledRow key={target.id}>
              <StyledName>
                <strong>{target.companyName}</strong>
                <StyledUrl>{target.url ?? 'sem endpoint publicado'}</StyledUrl>
              </StyledName>
              <span>
                <StyledPill tone={STATUS[target.status].tone}>
                  {STATUS[target.status].label}
                </StyledPill>
              </span>
              <StyledNumber>
                {isDefined(target.lastMs) ? `${target.lastMs} ms` : '—'}
              </StyledNumber>
              <StyledNumber>
                {isDefined(target.uptime)
                  ? `${(target.uptime * 100).toFixed(1).replace('.', ',')}%`
                  : '—'}
              </StyledNumber>
              <StyledBars
                role="img"
                aria-label={`${target.companyName}: últimas 24 horas`}
              >
                {getHealthBars(target.history, now).map((state, index) => (
                  <StyledBar key={index} state={state} />
                ))}
              </StyledBars>
            </StyledRow>
          ))}
        </StyledSystems>
      )}

      <StyledCentralMuted>
        Lento = resposta acima de 2 s ou uma falha isolada. Fora = 2 checagens
        seguidas com erro. O histórico recomeça a cada deploy do CRM.
      </StyledCentralMuted>
    </CentralPageLayout>
  );
};
