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
  StyledCentralSectionTitle,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralActivities } from '@/central/hooks/useCentralActivities';
import { type CentralActivity } from '@/central/types/CentralActivity';
import {
  type CentralTaskBucket,
  getCentralDueAtInDays,
  getCentralDueLabel,
  getCentralTaskBucket,
  groupCentralActivitiesByCompany,
  isCentralTaskDone,
  sortCentralTasksByDue,
} from '@/central/utils/centralTasks';
import {
  getCentralInitials,
  getCentralTodayLabel,
  pluralize,
} from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { IconCheck, IconClock, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const OVERDUE_BACKGROUND = themeCssVariables.tag.background.orange;
const OVERDUE_TEXT = themeCssVariables.tag.text.orange;

const SECTIONS: { bucket: CentralTaskBucket; title: string }[] = [
  { bucket: 'overdue', title: 'Atrasadas' },
  { bucket: 'today', title: 'Hoje' },
  { bucket: 'upcoming', title: 'Próximas' },
];

const DUE_CHOICES = [
  { label: 'Hoje', days: 0 },
  { label: 'Amanhã', days: 1 },
  { label: 'Sem prazo', days: null },
];

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

const StyledOverdueKpi = styled(StyledCentralKpi)`
  background: ${OVERDUE_BACKGROUND};
  border-color: ${OVERDUE_BACKGROUND};
  color: ${OVERDUE_TEXT};
`;

const StyledQuickAdd = styled.form`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
`;

const StyledQuickAddRow = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
`;

const StyledQuickAddInput = styled.input`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: 15px;
  min-height: 40px;
  min-width: 0;
  outline: 0;
`;

const StyledChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const StyledChip = styled.button<{ active: boolean }>`
  background: ${({ active }) =>
    active
      ? themeCssVariables.grayScale.gray12
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ active }) =>
      active
        ? themeCssVariables.grayScale.gray12
        : themeCssVariables.border.color.strong};
  border-radius: 999px;
  color: ${({ active }) =>
    active
      ? themeCssVariables.grayScale.gray1
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  min-height: 32px;
  padding: 0 12px;
`;

const StyledPrimaryButton = styled.button`
  background: ${themeCssVariables.grayScale.gray12};
  border: 0;
  border-radius: 10px;
  color: ${themeCssVariables.grayScale.gray1};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  min-height: 40px;
  padding: 0 16px;
`;

const StyledColumns = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const StyledMain = styled.div`
  display: flex;
  flex: 999 1 560px;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const StyledAside = styled.aside`
  display: flex;
  flex: 1 1 260px;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
`;

const StyledSection = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow: hidden;
  padding-bottom: 8px;
`;

const StyledSectionHeader = styled.div<{ overdue: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${({ overdue }) => (overdue ? OVERDUE_TEXT : 'inherit')};
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 14px 20px;
`;

const StyledGroupHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 12px 20px 4px;
`;

const StyledGroupName = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: 13px;
  font-weight: 600;
  gap: 10px;
`;

const StyledInitials = styled.span<{ active?: boolean }>`
  align-items: center;
  background: ${({ active }) =>
    active
      ? themeCssVariables.grayScale.gray10
      : themeCssVariables.background.tertiary};
  border-radius: 8px;
  color: ${({ active }) =>
    active ? themeCssVariables.grayScale.gray1 : 'inherit'};
  display: inline-flex;
  flex: none;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 11px;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledGroupLink = styled(Link)`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 12px;
  text-decoration: none;
`;

const StyledTaskRow = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  padding: 2px 12px 2px 8px;
`;

const StyledCheckButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  flex: none;
  height: 44px;
  justify-content: center;
  width: 44px;
`;

const StyledCheckCircle = styled.span<{ overdue: boolean }>`
  border: 2px solid
    ${({ overdue }) =>
      overdue ? OVERDUE_TEXT : themeCssVariables.font.color.tertiary};
  border-radius: 50%;
  box-sizing: border-box;
  height: 20px;
  width: 20px;
`;

const StyledTaskTitle = styled(Link)`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: 15px;
  min-width: 0;
  text-decoration: none;
`;

const StyledDuePill = styled.span<{ bucket: CentralTaskBucket }>`
  background: ${({ bucket }) =>
    bucket === 'overdue'
      ? OVERDUE_BACKGROUND
      : bucket === 'today'
        ? themeCssVariables.background.tertiary
        : themeCssVariables.background.primary};
  border: 1px solid
    ${({ bucket }) =>
      bucket === 'upcoming'
        ? themeCssVariables.border.color.medium
        : 'transparent'};
  border-radius: 999px;
  color: ${({ bucket }) =>
    bucket === 'overdue'
      ? OVERDUE_TEXT
      : themeCssVariables.font.color.secondary};
  flex: none;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  white-space: nowrap;
`;

const StyledIconButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 10px;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  flex: none;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledFilterButton = styled.button<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) =>
    active
      ? themeCssVariables.grayScale.gray12
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ active }) =>
      active
        ? themeCssVariables.grayScale.gray12
        : themeCssVariables.border.color.medium};
  border-radius: 12px;
  color: ${({ active }) =>
    active
      ? themeCssVariables.grayScale.gray1
      : themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  gap: 10px;
  justify-content: space-between;
  min-height: 52px;
  padding: 8px 12px;
  text-align: left;
`;

const StyledFilterName = styled.span`
  align-items: center;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  gap: 10px;
`;

const StyledOverdueCount = styled.span`
  background: ${OVERDUE_BACKGROUND};
  border-radius: 999px;
  color: ${OVERDUE_TEXT};
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
`;

const StyledDoneList = styled.section`
  border: 1px dashed ${themeCssVariables.border.color.strong};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px;
`;

const StyledDoneRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: 14px;
  gap: 10px;
`;

const StyledDoneTitle = styled.span`
  flex: 1;
  text-decoration: line-through;
`;

const StyledUndoButton = styled.button`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  min-height: 36px;
  text-decoration: underline;
`;

const StyledEmpty = styled(StyledCentralCard)`
  align-items: flex-start;
`;

const getTaskPath = (taskId: string) =>
  getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: StandardObjectNameSingular.Task,
    objectRecordId: taskId,
  });

const NO_COMPANY_FILTER = 'none';

const matchesCompanyFilter = (task: CentralActivity, filterId: string | null) =>
  filterId === null ||
  (filterId === NO_COMPANY_FILTER
    ? !isDefined(task.companyId)
    : task.companyId === filterId);

const getCompanyPath = (companyId: string) => `/central/${companyId}`;

type TaskRowProps = {
  task: CentralActivity;
  bucket: CentralTaskBucket;
  now: Date;
  onComplete: (task: CentralActivity) => void;
  onPostpone: (task: CentralActivity) => void;
};

const TaskRow = ({
  task,
  bucket,
  now,
  onComplete,
  onPostpone,
}: TaskRowProps) => {
  const title = isNonEmptyString(task.title) ? task.title : 'Sem título';
  const dueLabel = getCentralDueLabel(task.dueAt, now);

  return (
    <StyledTaskRow>
      <StyledCheckButton
        type="button"
        aria-label={`Concluir: ${title}`}
        onClick={() => onComplete(task)}
      >
        <StyledCheckCircle overdue={bucket === 'overdue'} />
      </StyledCheckButton>
      <StyledTaskTitle to={getTaskPath(task.id)}>{title}</StyledTaskTitle>
      <StyledDuePill bucket={bucket}>{dueLabel}</StyledDuePill>
      {dueLabel !== 'amanhã' && (
        <StyledIconButton
          type="button"
          aria-label={`Adiar para amanhã: ${title}`}
          title="Adiar para amanhã"
          onClick={() => onPostpone(task)}
        >
          <IconClock size={16} />
        </StyledIconButton>
      )}
    </StyledTaskRow>
  );
};

export const CentralTasksPage = () => {
  const now = new Date();
  const {
    activities: tasks,
    companies,
    loading,
    updateActivity,
    createActivityForCompany,
  } = useCentralActivities(StandardObjectNameSingular.Task);

  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [draftCompanyId, setDraftCompanyId] = useState<string | null>(null);
  const [draftDueDays, setDraftDueDays] = useState<number | null>(0);
  const [completedNow, setCompletedNow] = useState<CentralActivity[]>([]);

  const openTasks = sortCentralTasksByDue(
    tasks.filter((task) => !isCentralTaskDone(task)),
  );
  const visibleTasks = openTasks.filter((task) =>
    matchesCompanyFilter(task, companyFilter),
  );
  const countByBucket = (bucket: CentralTaskBucket, list = openTasks) =>
    list.filter((task) => getCentralTaskBucket(task.dueAt, now) === bucket)
      .length;

  const handleComplete = (task: CentralActivity) => {
    setCompletedNow((previous) => [task, ...previous]);
    void updateActivity(task.id, { status: 'DONE' });
  };

  const handleUndo = (task: CentralActivity) => {
    setCompletedNow((previous) =>
      previous.filter((completed) => completed.id !== task.id),
    );
    void updateActivity(task.id, { status: task.status ?? 'TODO' });
  };

  const handlePostpone = (task: CentralActivity) =>
    void updateActivity(task.id, { dueAt: getCentralDueAtInDays(1, now) });

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const title = draft.trim();

    if (!isNonEmptyString(title)) {
      return;
    }

    setDraft('');
    await createActivityForCompany(
      {
        title,
        status: 'TODO',
        dueAt: isDefined(draftDueDays)
          ? getCentralDueAtInDays(draftDueDays, now)
          : null,
      },
      draftCompanyId,
    );
  };

  const companyFilters = [
    { id: null, name: 'Todos' },
    ...companies,
    ...(openTasks.some((task) => !isDefined(task.companyId))
      ? [{ id: NO_COMPANY_FILTER, name: 'Sem cliente' }]
      : []),
  ];

  return (
    <CentralPageLayout title="Tarefas">
      <StyledHeader>
        <StyledHeading>
          <StyledCentralMuted>{getCentralTodayLabel(now)}</StyledCentralMuted>
          <StyledCentralTitle>Meu dia</StyledCentralTitle>
        </StyledHeading>
      </StyledHeader>

      <StyledCentralKpiGrid aria-label="Resumo">
        <StyledOverdueKpi>
          <StyledCentralKpiValue>
            {countByBucket('overdue')}
          </StyledCentralKpiValue>
          <StyledCentralKpiLabel>atrasadas</StyledCentralKpiLabel>
        </StyledOverdueKpi>
        <StyledCentralKpi inverted>
          <StyledCentralKpiValue>
            {countByBucket('today')}
          </StyledCentralKpiValue>
          <StyledCentralKpiLabel>pra hoje</StyledCentralKpiLabel>
        </StyledCentralKpi>
        <StyledCentralKpi>
          <StyledCentralKpiValue>
            {countByBucket('upcoming')}
          </StyledCentralKpiValue>
          <StyledCentralKpiLabel>próximas</StyledCentralKpiLabel>
        </StyledCentralKpi>
      </StyledCentralKpiGrid>

      <StyledQuickAdd onSubmit={handleCreate}>
        <StyledQuickAddRow>
          <IconPlus size={18} />
          <StyledQuickAddInput
            aria-label="Nova tarefa"
            placeholder="Nova tarefa… escreva e aperte Enter"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <StyledPrimaryButton type="submit">Criar</StyledPrimaryButton>
        </StyledQuickAddRow>
        <StyledChips aria-label="Cliente da nova tarefa">
          {[{ id: null, name: 'Sem cliente' }, ...companies].map((company) => (
            <StyledChip
              key={company.id ?? 'none'}
              type="button"
              active={draftCompanyId === company.id}
              aria-pressed={draftCompanyId === company.id}
              onClick={() => setDraftCompanyId(company.id)}
            >
              {company.name ?? 'Sem nome'}
            </StyledChip>
          ))}
        </StyledChips>
        <StyledChips aria-label="Prazo da nova tarefa">
          {DUE_CHOICES.map((choice) => (
            <StyledChip
              key={choice.label}
              type="button"
              active={draftDueDays === choice.days}
              aria-pressed={draftDueDays === choice.days}
              onClick={() => setDraftDueDays(choice.days)}
            >
              {choice.label}
            </StyledChip>
          ))}
        </StyledChips>
      </StyledQuickAdd>

      <StyledColumns>
        <StyledMain>
          {!loading && openTasks.length === 0 && (
            <StyledEmpty>
              <StyledCentralSectionTitle>Dia limpo.</StyledCentralSectionTitle>
              <StyledCentralMuted>
                Nada atrasado, nada pra hoje. Crie a próxima tarefa aqui em
                cima.
              </StyledCentralMuted>
            </StyledEmpty>
          )}
          {SECTIONS.map(({ bucket, title }) => {
            const sectionTasks = visibleTasks.filter(
              (task) => getCentralTaskBucket(task.dueAt, now) === bucket,
            );

            if (sectionTasks.length === 0) {
              return null;
            }

            return (
              <StyledSection key={bucket} aria-label={title}>
                <StyledSectionHeader overdue={bucket === 'overdue'}>
                  <StyledCentralSectionTitle>{title}</StyledCentralSectionTitle>
                  <StyledCentralMuted>
                    {pluralize(sectionTasks.length, 'tarefa', 'tarefas')}
                  </StyledCentralMuted>
                </StyledSectionHeader>
                {groupCentralActivitiesByCompany(sectionTasks).map((group) => (
                  <div key={group.companyId ?? 'none'}>
                    <StyledGroupHeader>
                      <StyledGroupName>
                        <StyledInitials>
                          {isDefined(group.companyId)
                            ? getCentralInitials(group.companyName)
                            : '—'}
                        </StyledInitials>
                        {group.companyName}
                      </StyledGroupName>
                      {isDefined(group.companyId) && (
                        <StyledGroupLink to={getCompanyPath(group.companyId)}>
                          Abrir Central
                        </StyledGroupLink>
                      )}
                    </StyledGroupHeader>
                    {group.activities.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        bucket={bucket}
                        now={now}
                        onComplete={handleComplete}
                        onPostpone={handlePostpone}
                      />
                    ))}
                  </div>
                ))}
              </StyledSection>
            );
          })}

          {completedNow.length > 0 && (
            <StyledDoneList aria-label="Feitas agora">
              <StyledCentralMuted>
                Feitas agora · {completedNow.length}
              </StyledCentralMuted>
              {completedNow.map((task) => (
                <StyledDoneRow key={task.id}>
                  <IconCheck size={16} />
                  <StyledDoneTitle>
                    {task.title ?? 'Sem título'}
                  </StyledDoneTitle>
                  <StyledUndoButton
                    type="button"
                    onClick={() => handleUndo(task)}
                  >
                    Desfazer
                  </StyledUndoButton>
                </StyledDoneRow>
              ))}
            </StyledDoneList>
          )}
        </StyledMain>

        <StyledAside aria-label="Por cliente">
          <StyledCentralSectionTitle>Por cliente</StyledCentralSectionTitle>
          {companyFilters.map((company) => {
            const companyTasks = openTasks.filter((task) =>
              matchesCompanyFilter(task, company.id),
            );
            const overdue = countByBucket('overdue', companyTasks);
            const active = companyFilter === company.id;

            return (
              <StyledFilterButton
                key={company.id ?? 'all'}
                type="button"
                active={active}
                aria-pressed={active}
                onClick={() => setCompanyFilter(company.id)}
              >
                <StyledFilterName>
                  <StyledInitials active={active}>
                    {company.id === null
                      ? '∗'
                      : getCentralInitials(company.name)}
                  </StyledInitials>
                  {company.name ?? 'Sem nome'}
                </StyledFilterName>
                <StyledChips>
                  {overdue > 0 && (
                    <StyledOverdueCount>
                      {pluralize(overdue, 'atrasada', 'atrasadas')}
                    </StyledOverdueCount>
                  )}
                  <span>{companyTasks.length}</span>
                </StyledChips>
              </StyledFilterButton>
            );
          })}
        </StyledAside>
      </StyledColumns>
    </CentralPageLayout>
  );
};
