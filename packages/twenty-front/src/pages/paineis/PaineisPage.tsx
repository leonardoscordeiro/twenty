// Painéis is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { useCentralOpportunities } from '@/central/hooks/useCentralOpportunities';
import {
  formatCentralCostTotal,
  formatCentralCurrency,
} from '@/central/utils/centralMoney';
import { getCentralClientPath, pluralize } from '@/central/utils/centralText';
import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import {
  DEFAULT_PAINEIS_LAYOUT,
  getVisibleBlocks,
  moveBlock,
  type PaineisBlockId,
  type PaineisLayout,
  readLayout,
  toggleBlock,
  writeLayout,
} from '@/paineis/utils/paineisLayout';
import {
  getAcessoReviewSummary,
  getBusinessHeadline,
  getBusinessMargin,
  getInfraCostSummary,
  getOpenOpportunitiesWithoutAmount,
  getPipelineStages,
  getRevenueSummary,
  getVencimentos,
  VENCIMENTO_WINDOW_IN_DAYS,
} from '@/paineis/utils/paineisSummary';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconEye,
  IconEyeOff,
  IconLayoutDashboard,
} from 'twenty-ui/icon';
import { GRAY_SCALE_DARK, useTheme } from 'twenty-ui/theme';

// BI screens are always dark and monochrome, independent of the app theme.
const COLOR = {
  ground: GRAY_SCALE_DARK.gray1,
  card: GRAY_SCALE_DARK.gray2,
  border: GRAY_SCALE_DARK.gray5,
  track: GRAY_SCALE_DARK.gray4,
  line: GRAY_SCALE_DARK.gray6,
  text: GRAY_SCALE_DARK.gray12,
  soft: GRAY_SCALE_DARK.gray11,
  muted: GRAY_SCALE_DARK.gray9,
};
const DISPLAY_FONT = `'Space Grotesk', Inter, sans-serif`;

const StyledBody = styled.div`
  background: ${COLOR.ground};
  box-sizing: border-box;
  color: ${COLOR.text};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  overflow-y: auto;
  padding: 24px clamp(16px, 4vw, 48px) 56px;

  & > * {
    flex-shrink: 0;
  }
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
`;

const StyledMuted = styled.span`
  color: ${COLOR.muted};
  font-size: 13px;
`;

const StyledHeadline = styled.h1`
  font-family: ${DISPLAY_FONT};
  font-size: clamp(26px, 3.2vw, 38px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0;
  max-width: 960px;
`;

const StyledGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const StyledCard = styled.section`
  background: ${COLOR.card};
  border: 1px solid ${COLOR.border};
  border-radius: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 20px;
`;

const StyledCardTitle = styled.h2`
  font-family: ${DISPLAY_FONT};
  font-size: 19px;
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
`;

const StyledBigValue = styled.span`
  font-family: ${DISPLAY_FONT};
  font-size: 34px;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const StyledSoft = styled.span`
  color: ${COLOR.soft};
  font-size: 13px;
`;

const StyledTrack = styled.div<{ height: number }>`
  background: ${COLOR.track};
  border-radius: 6px;
  height: ${({ height }) => height}px;
  overflow: hidden;
`;

const StyledFill = styled.div<{ percent: number }>`
  background: ${COLOR.text};
  border-radius: 6px;
  height: 100%;
  width: ${({ percent }) => percent}%;
`;

const StyledBarRow = styled.div`
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(72px, 110px) 1fr auto;
`;

const StyledFillLink = styled(Link)`
  align-self: flex-start;
  border: 1px dashed ${COLOR.muted};
  border-radius: 9px;
  color: ${COLOR.text};
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  text-decoration: none;
`;

const StyledButton = styled.button<{ primary?: boolean }>`
  align-items: center;
  background: ${({ primary }) => (primary ? COLOR.text : 'transparent')};
  border: 1px solid ${({ primary }) => (primary ? COLOR.text : COLOR.line)};
  border-radius: 10px;
  color: ${({ primary }) => (primary ? COLOR.ground : COLOR.text)};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
`;

const StyledEditBar = styled.div`
  align-items: center;
  border-top: 1px dashed ${COLOR.line};
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
`;

const StyledChecklistRow = styled.div`
  align-items: center;
  border-top: 1px solid ${COLOR.border};
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 0;
`;

const StyledChecklistText = styled.div`
  display: flex;
  flex: 1 1 260px;
  flex-direction: column;
  gap: 2px;
`;

const toPercent = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

export const PaineisPage = () => {
  const theme = useTheme();
  const now = new Date();
  const { companies, loading: companiesLoading } = useCentralCompanies();
  const {
    opportunities,
    stageOptions,
    loading: opportunitiesLoading,
  } = useCentralOpportunities();
  const [layout, setLayout] = useState<PaineisLayout>(readLayout);
  const [isEditing, setIsEditing] = useState(false);

  const updateLayout = (nextLayout: PaineisLayout) => {
    setLayout(nextLayout);
    writeLayout(nextLayout);
  };

  const revenue = getRevenueSummary(companies);
  const infraCost = getInfraCostSummary(companies);
  const margin = getBusinessMargin(revenue, infraCost);
  const pipelineStages = getPipelineStages(opportunities, stageOptions);
  const pipelineTotal = pipelineStages.reduce(
    (sum, stage) => sum + stage.total,
    0,
  );
  const largestStageTotal = Math.max(
    0,
    ...pipelineStages.map((stage) => stage.total),
  );
  const opportunitiesWithoutAmount =
    getOpenOpportunitiesWithoutAmount(opportunities);
  const vencimentos = getVencimentos(companies, now);
  const acessos = getAcessoReviewSummary(companies, now);
  const firstCompanyId = companies[0]?.id;
  const fillPath = (tab: 'visao' | 'infra' | 'acessos') =>
    isDefined(firstCompanyId)
      ? getCentralClientPath(firstCompanyId, tab)
      : CENTRAL_PATHS.clients;

  const checklist = [
    {
      title: 'Mensalidade de cada cliente',
      detail: 'Libera receita e margem.',
      done: revenue.filledCount,
      total: revenue.count,
      path: fillPath('visao'),
    },
    {
      title: 'Custos de infra',
      detail: 'Sem o valor, o total fica com "+" e a margem não fecha.',
      done: infraCost.filledCount,
      total: infraCost.count,
      path: CENTRAL_PATHS.infra,
    },
    {
      title: 'Data de revisão dos acessos',
      detail: 'Libera o bloco de acessos.',
      done: acessos.total - acessos.pendingCount,
      total: acessos.total,
      path: fillPath('acessos'),
    },
  ].filter((item) => item.done < item.total);

  const blocks: Record<PaineisBlockId, { label: string; content: ReactNode }> =
    {
      receita: {
        label: 'Receita mensal',
        content: (
          <>
            <StyledMuted>Receita mensal · mensalidades</StyledMuted>
            <StyledBigValue>{formatCentralCostTotal(revenue)}</StyledBigValue>
            <StyledSoft>
              {revenue.filledCount === revenue.count
                ? pluralize(revenue.count, 'cliente', 'clientes')
                : `${revenue.count - revenue.filledCount} de ${revenue.count} mensalidades vazias`}
            </StyledSoft>
            {revenue.filledCount < revenue.count && (
              <StyledFillLink to={fillPath('visao')}>preencher</StyledFillLink>
            )}
          </>
        ),
      },
      custo: {
        label: 'Custo de infra',
        content: (
          <>
            <StyledMuted>Custo de infra · por mês</StyledMuted>
            <StyledBigValue>{formatCentralCostTotal(infraCost)}</StyledBigValue>
            <StyledSoft>
              {infraCost.filledCount === infraCost.count
                ? pluralize(infraCost.count, 'custo', 'custos')
                : `${infraCost.count - infraCost.filledCount} de ${infraCost.count} custos sem valor`}
            </StyledSoft>
            {infraCost.filledCount < infraCost.count && (
              <StyledFillLink to={CENTRAL_PATHS.infra}>
                preencher
              </StyledFillLink>
            )}
          </>
        ),
      },
      margem: {
        label: 'Margem',
        content: (
          <>
            <StyledMuted>Margem · receita − custo de infra</StyledMuted>
            <StyledBigValue>
              {isDefined(margin) ? formatCentralCurrency(margin) : '—'}
            </StyledBigValue>
            <StyledSoft>
              {isDefined(margin)
                ? `${toPercent(margin, revenue.total)}% da receita`
                : 'depende de receita e custo completos'}
            </StyledSoft>
          </>
        ),
      },
      pipeline: {
        label: 'Pipeline',
        content: (
          <>
            <StyledMuted>Pipeline · oportunidades abertas</StyledMuted>
            <StyledCardTitle>
              {pipelineTotal > 0
                ? `${formatCentralCurrency(pipelineTotal)} em aberto`
                : 'Sem oportunidade com valor no CRM'}
            </StyledCardTitle>
            {pipelineStages.map((stage) => (
              <StyledBarRow key={stage.value}>
                <StyledSoft>{stage.label}</StyledSoft>
                <StyledTrack height={20}>
                  <StyledFill
                    percent={toPercent(stage.total, largestStageTotal)}
                  />
                </StyledTrack>
                <StyledSoft>
                  {stage.count > 0
                    ? `${stage.count} · ${formatCentralCurrency(stage.total)}`
                    : '—'}
                </StyledSoft>
              </StyledBarRow>
            ))}
            {opportunitiesWithoutAmount > 0 && (
              <StyledFillLink to={CENTRAL_PATHS.opportunities}>
                {pluralize(
                  opportunitiesWithoutAmount,
                  'oportunidade sem valor',
                  'oportunidades sem valor',
                )}
              </StyledFillLink>
            )}
          </>
        ),
      },
      vencimentos: {
        label: 'Vencimentos',
        content: (
          <>
            <StyledMuted>
              Vencimentos · próximos {VENCIMENTO_WINDOW_IN_DAYS} dias
            </StyledMuted>
            <StyledCardTitle>
              {vencimentos.length > 0
                ? `Próximo em ${pluralize(vencimentos[0].daysLeft, 'dia', 'dias')}: ${vencimentos[0].label}`
                : 'Nenhuma renovação nos próximos 90 dias'}
            </StyledCardTitle>
            {vencimentos.slice(0, 6).map((vencimento) => (
              <div key={vencimento.id}>
                <StyledBarRow>
                  <StyledSoft>{vencimento.label}</StyledSoft>
                  <StyledMuted>{vencimento.companyName}</StyledMuted>
                  <StyledSoft>{vencimento.daysLeft} d</StyledSoft>
                </StyledBarRow>
                <StyledTrack height={6}>
                  <StyledFill
                    percent={toPercent(
                      VENCIMENTO_WINDOW_IN_DAYS - vencimento.daysLeft,
                      VENCIMENTO_WINDOW_IN_DAYS,
                    )}
                  />
                </StyledTrack>
              </div>
            ))}
            <StyledMuted>
              Lido da data de renovação dos custos. Domínio e certificado entram
              quando o job automático existir.
            </StyledMuted>
          </>
        ),
      },
      acessos: {
        label: 'Acessos a revisar',
        content: (
          <>
            <StyledMuted>Acessos a revisar</StyledMuted>
            <StyledCardTitle>
              {acessos.pendingCount === 0
                ? 'Todos os acessos revisados'
                : acessos.neverReviewedCount === acessos.total
                  ? `Nenhum dos ${acessos.total} acessos foi revisado ainda`
                  : `${acessos.pendingCount} de ${acessos.total} acessos a revisar`}
            </StyledCardTitle>
            <StyledBigValue>{acessos.pendingCount}</StyledBigValue>
            <StyledTrack height={10}>
              <StyledFill
                percent={toPercent(
                  acessos.total - acessos.pendingCount,
                  acessos.total,
                )}
              />
            </StyledTrack>
            <StyledMuted>
              Revisado há mais de 90 dias ou nunca conta como pendente.
            </StyledMuted>
            {acessos.pendingCount > 0 && (
              <StyledFillLink to={fillPath('acessos')}>
                Revisar agora
              </StyledFillLink>
            )}
          </>
        ),
      },
    };

  const visibleBlocks = getVisibleBlocks(layout);
  const isLoading = companiesLoading || opportunitiesLoading;

  return (
    <>
      <PageTitle title="Painéis" />
      <PageCardLayout
        header={
          <PageCardHeader
            icon={<IconLayoutDashboard size={theme.icon.size.md} />}
            title="Painéis · Negócio"
          />
        }
      >
        <StyledBody>
          <StyledToolbar>
            <StyledMuted>
              {new Intl.DateTimeFormat('pt-BR', {
                month: 'long',
                year: 'numeric',
              }).format(now)}
            </StyledMuted>
            <div>
              {isEditing && (
                <StyledButton
                  type="button"
                  onClick={() => updateLayout(DEFAULT_PAINEIS_LAYOUT)}
                >
                  Restaurar padrão
                </StyledButton>
              )}{' '}
              <StyledButton
                type="button"
                primary
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Concluir' : 'Editar painel'}
              </StyledButton>
            </div>
          </StyledToolbar>

          <StyledHeadline>
            {isLoading
              ? 'Carregando…'
              : getBusinessHeadline(revenue, infraCost, margin)}
          </StyledHeadline>

          {!isLoading && checklist.length > 0 && (
            <StyledCard aria-label="O que falta preencher">
              <StyledCardTitle>Pra os números aparecerem</StyledCardTitle>
              {checklist.map((item) => (
                <StyledChecklistRow key={item.title}>
                  <StyledChecklistText>
                    <strong>{item.title}</strong>
                    <StyledMuted>{item.detail}</StyledMuted>
                  </StyledChecklistText>
                  <StyledSoft>
                    {item.done} de {item.total}
                  </StyledSoft>
                  <StyledFillLink to={item.path}>Preencher</StyledFillLink>
                </StyledChecklistRow>
              ))}
            </StyledCard>
          )}

          <StyledGrid>
            {visibleBlocks.map((blockId, index) => (
              <StyledCard key={blockId} aria-label={blocks[blockId].label}>
                {blocks[blockId].content}
                {isEditing && (
                  <StyledEditBar>
                    <StyledButton
                      type="button"
                      aria-label={`Mover ${blocks[blockId].label} para trás`}
                      disabled={index === 0}
                      onClick={() =>
                        updateLayout(moveBlock(layout, blockId, -1))
                      }
                    >
                      <IconArrowUp size={16} />
                    </StyledButton>
                    <StyledButton
                      type="button"
                      aria-label={`Mover ${blocks[blockId].label} para frente`}
                      disabled={index === visibleBlocks.length - 1}
                      onClick={() =>
                        updateLayout(moveBlock(layout, blockId, 1))
                      }
                    >
                      <IconArrowDown size={16} />
                    </StyledButton>
                    <StyledButton
                      type="button"
                      onClick={() => updateLayout(toggleBlock(layout, blockId))}
                    >
                      <IconEyeOff size={16} />
                      Ocultar
                    </StyledButton>
                  </StyledEditBar>
                )}
              </StyledCard>
            ))}
          </StyledGrid>

          {isEditing && layout.hidden.length > 0 && (
            <StyledCard aria-label="Blocos ocultos">
              <StyledMuted>Blocos ocultos</StyledMuted>
              {layout.hidden.map((blockId) => (
                <StyledButton
                  key={blockId}
                  type="button"
                  onClick={() => updateLayout(toggleBlock(layout, blockId))}
                >
                  <IconEye size={16} />
                  Mostrar {blocks[blockId].label}
                </StyledButton>
              ))}
            </StyledCard>
          )}
        </StyledBody>
      </PageCardLayout>
    </>
  );
};
