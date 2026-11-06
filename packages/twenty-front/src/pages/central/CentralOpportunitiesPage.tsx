// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralPageLayout } from '@/central/components/CentralPageLayout';
import {
  centralButtonClassName,
  StyledCentralCard,
  StyledCentralDisplayText,
  StyledCentralKpi,
  StyledCentralKpiGrid,
  StyledCentralKpiHint,
  StyledCentralKpiLabel,
  StyledCentralKpiValue,
  StyledCentralMuted,
  StyledCentralSectionTitle,
  StyledCentralSegmented,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import { useCentralOpportunities } from '@/central/hooks/useCentralOpportunities';
import {
  formatCentralCurrency,
  fromAmountMicros,
} from '@/central/utils/centralMoney';
import {
  type CentralOpportunity,
  getDaysSinceUpdate,
  getFunnelReachCounts,
  getNextStep,
  getStageSummary,
  isClosedStage,
  isLostStage,
  type NextStepStatus,
  STALE_AFTER_DAYS,
} from '@/central/utils/centralOpportunities';
import {
  getCentralTodayLabel,
  getNativeRecordPath,
  pluralize,
} from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

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

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StyledFocusChip = styled.button<{ active: boolean }>`
  background: ${themeCssVariables.grayScale.gray11};
  border: 1px solid
    ${({ active }) =>
      active ? themeCssVariables.grayScale.gray1 : 'transparent'};
  border-radius: 10px;
  color: ${themeCssVariables.grayScale.gray1};
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  min-height: 40px;
  padding: 0 14px;
`;

const StyledFocusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledBoardScroll = styled.div`
  overflow-x: auto;
  padding-bottom: 8px;
`;

const StyledBoard = styled.div<{ columnCount: number }>`
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(
    ${({ columnCount }) => columnCount},
    minmax(240px, 1fr)
  );
`;

const StyledColumn = styled.section<{ closed: boolean }>`
  background: ${({ closed }) =>
    closed
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.quaternary};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
`;

const StyledColumnHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 4px 10px;
`;

const StyledColumnTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const StyledCount = styled.span`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
`;

const StyledOpportunityCard = styled.article<{ overdue: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ overdue }) =>
      overdue
        ? themeCssVariables.tag.background.orange
        : themeCssVariables.border.color.medium};
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
`;

const StyledCardName = styled(Link)`
  color: ${themeCssVariables.font.color.primary};
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledMissing = styled.span`
  align-self: flex-start;
  background: ${themeCssVariables.tag.background.amber};
  border: 1px dashed ${themeCssVariables.tag.text.amber};
  border-radius: 6px;
  color: ${themeCssVariables.tag.text.amber};
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
`;

const StyledStepBadge = styled.span<{ status: NextStepStatus }>`
  align-self: flex-start;
  background: ${({ status }) =>
    status === 'overdue'
      ? themeCssVariables.tag.background.orange
      : status === 'today'
        ? themeCssVariables.tag.background.blue
        : themeCssVariables.background.tertiary};
  border-radius: 6px;
  color: ${({ status }) =>
    status === 'overdue'
      ? themeCssVariables.tag.text.orange
      : status === 'today'
        ? themeCssVariables.tag.text.blue
        : themeCssVariables.font.color.secondary};
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
`;

const StyledStep = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
`;

const StyledStageSelect = styled.select`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  color: ${themeCssVariables.font.color.secondary};
  font-family: inherit;
  font-size: 12px;
  min-height: 32px;
  padding: 0 6px;
`;

const StyledStale = styled.span`
  color: ${themeCssVariables.tag.text.orange};
  font-size: 12px;
`;

const StyledViewLink = styled(Link)`
  border-radius: 9px;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  font-weight: 500;
  line-height: 40px;
  padding: 0 16px;
  text-decoration: none;

  &[aria-current='page'] {
    background: ${themeCssVariables.background.primary};
    box-shadow: ${themeCssVariables.boxShadow.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledFunnelRow = styled.div`
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: 110px 1fr 120px;
`;

const StyledFunnelTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 10px;
  height: 40px;
  overflow: hidden;
`;

const StyledFunnelBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 10px;
  box-sizing: border-box;
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
  font-size: 14px;
  font-weight: 600;
  height: 100%;
  min-width: 36px;
  padding: 0 12px;
`;

const StyledEmptyForm = styled.form`
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
  width: 100%;
`;

const StyledInput = styled.input`
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 10px;
  font-family: inherit;
  font-size: 15px;
  min-height: 44px;
  padding: 0 12px;
`;

const STEP_LABEL: Record<NextStepStatus, string> = {
  overdue: 'Atrasado',
  today: 'Hoje',
  upcoming: '',
  missing: '',
};

const FOCUS_LABEL: Record<Exclude<NextStepStatus, 'upcoming'>, string> = {
  overdue: 'atrasados',
  today: 'para hoje',
  missing: 'sem próximo passo',
};

type Focus = keyof typeof FOCUS_LABEL;

const formatDueDate = (dueAt: string | null) =>
  isDefined(dueAt)
    ? new Intl.DateTimeFormat('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(new Date(dueAt))
    : 'sem data';

const formatMonthly = (amount: number) =>
  `${formatCentralCurrency(amount)}/mês`;

const opportunityPath = (opportunity: CentralOpportunity) =>
  getNativeRecordPath('opportunity', opportunity.id);

type OpportunityCardProps = {
  opportunity: CentralOpportunity;
  now: Date;
  closed: boolean;
  stageOptions: { value: string; label: string }[];
  onMove: (stage: string) => void;
};

const OpportunityCard = ({
  opportunity,
  now,
  closed,
  stageOptions,
  onMove,
}: OpportunityCardProps) => {
  const amount = fromAmountMicros(opportunity.amount);
  const { task, status } = getNextStep(opportunity, now);
  const daysSinceUpdate = getDaysSinceUpdate(opportunity, now);

  return (
    <StyledOpportunityCard overdue={status === 'overdue'}>
      <StyledCardName to={opportunityPath(opportunity)}>
        {opportunity.name ?? 'Sem nome'}
      </StyledCardName>
      {isDefined(opportunity.company) && (
        <StyledCentralMuted>{opportunity.company.name}</StyledCentralMuted>
      )}
      {isDefined(amount) ? (
        <StyledCentralDisplayText>
          {formatMonthly(amount)}
        </StyledCentralDisplayText>
      ) : (
        <StyledMissing>Valor: preencher</StyledMissing>
      )}
      {isDefined(task) ? (
        <StyledStep>
          <span>{task.title ?? 'Tarefa sem título'}</span>
          <StyledStepBadge status={status}>
            {[STEP_LABEL[status], formatDueDate(task.dueAt)]
              .filter(isNonEmptyString)
              .join(' · ')}
          </StyledStepBadge>
        </StyledStep>
      ) : (
        !closed && (
          <Link to={opportunityPath(opportunity)}>
            <StyledMissing>Definir próximo passo</StyledMissing>
          </Link>
        )
      )}
      {!closed && daysSinceUpdate >= STALE_AFTER_DAYS && (
        <StyledStale>Sem mudança há {daysSinceUpdate} dias</StyledStale>
      )}
      <StyledStageSelect
        aria-label={`Etapa de ${opportunity.name ?? 'oportunidade'}`}
        value={opportunity.stage ?? ''}
        onChange={(event) => onMove(event.target.value)}
      >
        {stageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledStageSelect>
    </StyledOpportunityCard>
  );
};

export const CentralOpportunitiesPage = () => {
  const {
    opportunities,
    loading,
    stageOptions,
    moveToStage,
    createOpportunity,
  } = useCentralOpportunities();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [focus, setFocus] = useState<Focus | null>(null);
  const [newName, setNewName] = useState('');
  const now = new Date();
  const isFunnel = pathname.startsWith(CENTRAL_PATHS.funnel);

  const openOpportunities = opportunities.filter(
    (opportunity) => !isClosedStage(opportunity.stage),
  );
  const openSummary = getStageSummary(openOpportunities);
  const countByFocus = (target: Focus) =>
    openOpportunities.filter(
      (opportunity) => getNextStep(opportunity, now).status === target,
    ).length;

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    if (!isNonEmptyString(newName.trim())) {
      return;
    }

    const created = await createOpportunity(newName.trim());

    setNewName('');

    if (isDefined(created)) {
      navigate(opportunityPath(created as CentralOpportunity));
    }
  };

  if (loading && opportunities.length === 0) {
    return (
      <CentralPageLayout title="Oportunidades">
        <StyledCentralMuted>Carregando…</StyledCentralMuted>
      </CentralPageLayout>
    );
  }

  const header = (
    <StyledHeader>
      <StyledHeading>
        <StyledCentralMuted>{getCentralTodayLabel(now)}</StyledCentralMuted>
        <StyledCentralTitle>Oportunidades</StyledCentralTitle>
      </StyledHeading>
      <StyledActions>
        <StyledCentralSegmented aria-label="Visão">
          <StyledViewLink
            to={CENTRAL_PATHS.opportunities}
            aria-current={!isFunnel ? 'page' : undefined}
          >
            Quadro
          </StyledViewLink>
          <StyledViewLink
            to={CENTRAL_PATHS.funnel}
            aria-current={isFunnel ? 'page' : undefined}
          >
            Funil
          </StyledViewLink>
        </StyledCentralSegmented>
        <Link
          className={centralButtonClassName}
          to={getAppPath(AppPath.RecordIndexPage, {
            objectNamePlural: 'opportunities',
          })}
        >
          Abrir tabela
        </Link>
      </StyledActions>
    </StyledHeader>
  );

  if (opportunities.length === 0) {
    return (
      <CentralPageLayout title="Oportunidades">
        {header}
        <StyledCentralCard>
          <StyledEmptyForm onSubmit={handleCreate}>
            <StyledCentralSectionTitle>
              Nenhuma oportunidade ainda
            </StyledCentralSectionTitle>
            <StyledCentralMuted>
              Comece por quem você vai abordar esta semana. Depois de criar,
              defina o próximo passo como uma tarefa na ficha.
            </StyledCentralMuted>
            <StyledInput
              aria-label="Nome da oportunidade"
              placeholder="Nome da revenda ou oficina"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <button
              type="submit"
              className={centralButtonClassName}
              data-inverted="true"
            >
              <IconPlus size={16} />
              Criar oportunidade
            </button>
          </StyledEmptyForm>
        </StyledCentralCard>
      </CentralPageLayout>
    );
  }

  const stageValues = stageOptions.map((option) => option.value);
  const reachCounts = getFunnelReachCounts(
    opportunities.filter((opportunity) => !isLostStage(opportunity.stage)),
    stageValues,
  );
  const maxReach = Math.max(1, ...reachCounts);

  return (
    <CentralPageLayout title="Oportunidades">
      {header}

      <StyledCentralKpiGrid aria-label="Resumo">
        <StyledCentralKpi inverted>
          <StyledCentralKpiLabel>Em aberto</StyledCentralKpiLabel>
          <StyledCentralKpiValue>
            {formatMonthly(openSummary.total)}
          </StyledCentralKpiValue>
          <StyledCentralKpiHint warning={openSummary.missingAmountCount > 0}>
            {pluralize(openSummary.count, 'oportunidade', 'oportunidades')}
            {openSummary.missingAmountCount > 0 &&
              ` · ${openSummary.missingAmountCount} sem valor, fora da soma`}
          </StyledCentralKpiHint>
          <StyledFocusRow>
            {(Object.keys(FOCUS_LABEL) as Focus[]).map((key) => (
              <StyledFocusChip
                key={key}
                type="button"
                active={focus === key}
                aria-pressed={focus === key}
                onClick={() => setFocus(focus === key ? null : key)}
              >
                {countByFocus(key)} {FOCUS_LABEL[key]}
              </StyledFocusChip>
            ))}
          </StyledFocusRow>
        </StyledCentralKpi>
      </StyledCentralKpiGrid>

      {isFunnel ? (
        <StyledCentralCard aria-label="Funil">
          <StyledCentralSectionTitle>Funil</StyledCentralSectionTitle>
          <StyledCentralMuted>
            Quantas chegaram a cada etapa, pela etapa atual de cada uma.
          </StyledCentralMuted>
          {stageOptions
            .filter((option) => !isLostStage(option.value))
            .map((option) => {
              const index = stageValues.indexOf(option.value);
              const reach = reachCounts[index];
              const stageSummary = getStageSummary(
                opportunities.filter(
                  (opportunity) => opportunity.stage === option.value,
                ),
              );

              return (
                <StyledFunnelRow key={option.value}>
                  <strong>{option.label}</strong>
                  <StyledFunnelTrack>
                    <StyledFunnelBar
                      style={{ width: `${(reach / maxReach) * 100}%` }}
                    >
                      {reach}
                    </StyledFunnelBar>
                  </StyledFunnelTrack>
                  <StyledCentralMuted>
                    {formatMonthly(stageSummary.total)}
                  </StyledCentralMuted>
                </StyledFunnelRow>
              );
            })}
        </StyledCentralCard>
      ) : (
        <StyledBoardScroll>
          <StyledBoard columnCount={stageOptions.length}>
            {stageOptions.map((option) => {
              const closed = isClosedStage(option.value);
              const inStage = opportunities.filter(
                (opportunity) => opportunity.stage === option.value,
              );
              const summary = getStageSummary(inStage);
              const visible = inStage.filter(
                (opportunity) =>
                  !isDefined(focus) ||
                  (!closed && getNextStep(opportunity, now).status === focus),
              );

              return (
                <StyledColumn
                  key={option.value}
                  closed={closed}
                  aria-label={option.label}
                >
                  <StyledColumnHeader>
                    <StyledColumnTitleRow>
                      <StyledCentralSectionTitle>
                        {option.label}
                      </StyledCentralSectionTitle>
                      <StyledCount>{summary.count}</StyledCount>
                    </StyledColumnTitleRow>
                    <StyledCentralDisplayText>
                      {formatMonthly(summary.total)}
                    </StyledCentralDisplayText>
                    {summary.missingAmountCount > 0 && (
                      <StyledMissing>
                        {summary.missingAmountCount} sem valor
                      </StyledMissing>
                    )}
                  </StyledColumnHeader>
                  {visible.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      now={now}
                      closed={closed}
                      stageOptions={stageOptions}
                      onMove={(stage) => moveToStage(opportunity.id, stage)}
                    />
                  ))}
                  {visible.length === 0 && (
                    <StyledCentralMuted>Nada aqui.</StyledCentralMuted>
                  )}
                </StyledColumn>
              );
            })}
          </StyledBoard>
        </StyledBoardScroll>
      )}
    </CentralPageLayout>
  );
};
