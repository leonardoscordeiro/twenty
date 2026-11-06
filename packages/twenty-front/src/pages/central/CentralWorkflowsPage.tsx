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
import { CentralSwitch } from '@/central/components/CentralSwitch';
import { useCentralWorkflows } from '@/central/hooks/useCentralWorkflows';
import {
  CENTRAL_STARTER_RECIPE_IDS,
  CENTRAL_WORKFLOW_RECIPES,
  type CentralWorkflowRecipe,
  formatCentralRunDate,
  getCentralRunDate,
  getCentralRunStatus,
  getCentralWorkflowName,
} from '@/central/utils/centralWorkflows';
import { pluralize } from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconPlus, IconSettingsAutomation } from 'twenty-ui/icon';
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

const StyledColumns = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const StyledListCard = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  flex: 999 1 560px;
  min-width: 0;
  overflow: hidden;
`;

const StyledListHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px 20px;
`;

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 16px 20px;

  &[data-selected='true'] {
    background: ${themeCssVariables.background.secondary};
    box-shadow: inset 3px 0 0 ${themeCssVariables.grayScale.gray12};
  }

  &[data-state='off'],
  &[data-state='draft'] {
    opacity: 0.7;
  }
`;

const StyledRowButton = styled.button`
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 1 1 320px;
  flex-direction: column;
  font-family: inherit;
  gap: 6px;
  min-width: 0;
  padding: 0;
  text-align: left;
`;

const StyledRowName = styled.span`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
`;

const StyledStatusLine = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: 13px;
  gap: 8px;
`;

const StyledDot = styled.span`
  background: ${themeCssVariables.font.color.tertiary};
  border-radius: 50%;
  flex: none;
  height: 10px;
  margin-top: 4px;
  width: 10px;

  &[data-tone='success'] {
    background: ${themeCssVariables.tag.text.green};
  }

  &[data-tone='danger'] {
    background: ${themeCssVariables.tag.text.red};
  }

  &[data-tone='progress'] {
    background: ${themeCssVariables.tag.text.blue};
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

const StyledAside = styled.aside`
  display: flex;
  flex: 1 1 340px;
  flex-direction: column;
  gap: 12px;
  max-width: 440px;
`;

const StyledPill = styled.span`
  align-self: flex-start;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  white-space: nowrap;

  &[data-tone='on'] {
    background: ${themeCssVariables.tag.background.green};
    color: ${themeCssVariables.tag.text.green};
  }
`;

const StyledRunList = styled.ol`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledRunItem = styled.li`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: 12px;
  padding: 12px 0;
`;

const StyledRunText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledStrong = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const StyledSubtitle = styled.h3`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
  text-transform: uppercase;
`;

const StyledRecipeGrid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const StyledRecipeSentence = styled.span`
  flex: 1;
  font-size: 15px;
  line-height: 1.45;
`;

const StyledArea = styled.span`
  align-self: flex-start;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
`;

const StyledRequirement = styled.span`
  background: ${themeCssVariables.tag.background.amber};
  border-radius: 10px;
  color: ${themeCssVariables.tag.text.amber};
  font-size: 12px;
  line-height: 1.4;
  padding: 8px 10px;
`;

const StyledSectionHeader = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
`;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StyledEmptyIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 640px;
`;

const StyledEmptyTitle = styled.h2`
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const StyledParagraph = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
`;

type RecipeCardProps = {
  recipe: CentralWorkflowRecipe;
  disabled: boolean;
  onCreate: (recipe: CentralWorkflowRecipe) => void;
};

const RecipeCard = ({ recipe, disabled, onCreate }: RecipeCardProps) => (
  <StyledCentralCard as="article">
    <StyledArea>{recipe.area}</StyledArea>
    <StyledRecipeSentence>{recipe.sentence}</StyledRecipeSentence>
    {isDefined(recipe.requirement) && (
      <StyledRequirement>{recipe.requirement}</StyledRequirement>
    )}
    <button
      type="button"
      className={centralButtonClassName}
      data-inverted={!isDefined(recipe.requirement)}
      disabled={disabled}
      onClick={() => onCreate(recipe)}
    >
      Montar este fluxo
    </button>
  </StyledCentralCard>
);

export const CentralWorkflowsPage = () => {
  const navigate = useNavigate();
  const {
    canManageWorkflows,
    workflows,
    loading,
    setWorkflowEnabled,
    createWorkflow,
  } = useCentralWorkflows();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const now = new Date();

  const getEditorPath = (coreWorkflowId: string) =>
    getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId });

  const handleCreate = async (name?: string) => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const coreWorkflowId = await createWorkflow(name);

      if (isDefined(coreWorkflowId)) {
        navigate(getEditorPath(coreWorkflowId));
      }
    } finally {
      setIsCreating(false);
    }
  };

  const onCount = workflows.filter(
    (workflow) => workflow.state === 'on',
  ).length;
  const selected =
    workflows.find((workflow) => workflow.id === selectedId) ?? workflows[0];
  const createDisabled = !canManageWorkflows || isCreating;
  const hasWorkflows = workflows.length > 0;
  const starterRecipes = CENTRAL_WORKFLOW_RECIPES.filter((recipe) =>
    CENTRAL_STARTER_RECIPE_IDS.includes(recipe.id),
  );

  return (
    <CentralPageLayout title="Fluxos">
      <StyledHeader>
        <StyledHeading>
          <StyledCentralTitle>Fluxos</StyledCentralTitle>
          <StyledCentralMuted>
            Regras que trabalham sozinhas. Escolha uma receita, ajuste no editor
            e ligue.
          </StyledCentralMuted>
        </StyledHeading>
        <StyledActions>
          {hasWorkflows && (
            <StyledCentralMuted>
              {pluralize(onCount, 'ligado', 'ligados')} ·{' '}
              {pluralize(workflows.length - onCount, 'desligado', 'desligados')}
            </StyledCentralMuted>
          )}
          <button
            type="button"
            className={centralButtonClassName}
            disabled={createDisabled}
            onClick={() => handleCreate()}
          >
            <IconPlus size={16} />
            Criar do zero
          </button>
        </StyledActions>
      </StyledHeader>

      {!canManageWorkflows && (
        <StyledCentralCard>
          <StyledCentralSectionTitle>
            Fluxos ainda não estão liberados pra você
          </StyledCentralSectionTitle>
          <StyledParagraph>
            Seu papel não tem a permissão de Fluxos de trabalho. Libere em
            Configurações, Funções, e volte aqui.
          </StyledParagraph>
          <Link
            className={centralButtonClassName}
            data-inverted
            to={getSettingsPath(SettingsPath.Roles)}
          >
            Abrir Funções
          </Link>
        </StyledCentralCard>
      )}

      {canManageWorkflows && !loading && !hasWorkflows && (
        <StyledCentralCard>
          <StyledEmptyIntro>
            <StyledIconBox aria-hidden="true">
              <IconSettingsAutomation size={20} />
            </StyledIconBox>
            <StyledEmptyTitle>Nenhum fluxo ainda</StyledEmptyTitle>
            <StyledParagraph>
              Comece por um destes três. O fluxo nasce desligado: você revisa no
              editor e liga quando quiser.
            </StyledParagraph>
          </StyledEmptyIntro>
          <StyledRecipeGrid>
            {starterRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                disabled={createDisabled}
                onCreate={(item) => handleCreate(item.sentence)}
              />
            ))}
          </StyledRecipeGrid>
        </StyledCentralCard>
      )}

      {hasWorkflows && isDefined(selected) && (
        <StyledColumns>
          <StyledListCard aria-label="Seus fluxos">
            <StyledListHeader>
              <StyledCentralSectionTitle>Seus fluxos</StyledCentralSectionTitle>
              <StyledCentralMuted>
                clique num fluxo pra ver o histórico
              </StyledCentralMuted>
            </StyledListHeader>
            {workflows.map((workflow) => {
              const name = getCentralWorkflowName(workflow.name);
              const lastRun = workflow.runs[0];
              const lastRunStatus = isDefined(lastRun)
                ? getCentralRunStatus(lastRun.status)
                : undefined;

              return (
                <StyledRow
                  key={workflow.id}
                  data-selected={workflow.id === selected.id}
                  data-state={workflow.state}
                >
                  <StyledIconBox aria-hidden="true">
                    <IconSettingsAutomation size={18} />
                  </StyledIconBox>
                  <StyledRowButton
                    type="button"
                    onClick={() => setSelectedId(workflow.id)}
                  >
                    <StyledRowName>{name}</StyledRowName>
                    <StyledStatusLine>
                      <StyledDot
                        data-tone={
                          workflow.state === 'on'
                            ? lastRunStatus?.tone
                            : undefined
                        }
                      />
                      {workflow.state === 'draft'
                        ? 'Rascunho, ainda não publicado'
                        : workflow.state === 'off'
                          ? 'Desligado'
                          : isDefined(lastRun) && isDefined(lastRunStatus)
                            ? `${formatCentralRunDate(getCentralRunDate(lastRun), now)} · ${lastRunStatus.label}`
                            : 'Ligado · ainda não rodou'}
                    </StyledStatusLine>
                  </StyledRowButton>
                  {workflow.state === 'draft' ? (
                    <Link
                      className={centralButtonClassName}
                      to={getEditorPath(workflow.id)}
                    >
                      Abrir editor
                    </Link>
                  ) : (
                    <CentralSwitch
                      checked={workflow.state === 'on'}
                      label={`${workflow.state === 'on' ? 'Desligar' : 'Ligar'} ${name}`}
                      disabled={!isDefined(workflow.publishedVersionId)}
                      onChange={(enabled) =>
                        isDefined(workflow.publishedVersionId) &&
                        setWorkflowEnabled(workflow.publishedVersionId, enabled)
                      }
                    />
                  )}
                </StyledRow>
              );
            })}
          </StyledListCard>

          <StyledAside aria-label="Histórico do fluxo">
            <StyledCentralCard>
              <StyledActions>
                <StyledCentralSectionTitle>
                  {getCentralWorkflowName(selected.name)}
                </StyledCentralSectionTitle>
                <StyledPill data-tone={selected.state}>
                  {selected.state === 'on'
                    ? 'Ligado'
                    : selected.state === 'off'
                      ? 'Desligado'
                      : 'Rascunho'}
                </StyledPill>
              </StyledActions>
              <div>
                <StyledSubtitle>Execuções</StyledSubtitle>
                {selected.runs.length === 0 ? (
                  <StyledCentralMuted>
                    Nenhuma execução ainda.
                  </StyledCentralMuted>
                ) : (
                  <StyledRunList>
                    {selected.runs.slice(0, 8).map((run) => {
                      const status = getCentralRunStatus(run.status);

                      return (
                        <StyledRunItem key={run.id}>
                          <StyledDot data-tone={status.tone} />
                          <StyledRunText>
                            <StyledStrong>
                              {formatCentralRunDate(
                                getCentralRunDate(run),
                                now,
                              )}{' '}
                              · {status.label}
                            </StyledStrong>
                            {isDefined(run.name) && (
                              <StyledCentralMuted>
                                {run.name}
                              </StyledCentralMuted>
                            )}
                          </StyledRunText>
                        </StyledRunItem>
                      );
                    })}
                  </StyledRunList>
                )}
              </div>
              <Link
                className={centralButtonClassName}
                data-inverted
                to={getEditorPath(selected.id)}
              >
                Abrir no editor
              </Link>
            </StyledCentralCard>
          </StyledAside>
        </StyledColumns>
      )}

      <StyledSection aria-label="Receitas prontas">
        <StyledSectionHeader>
          <StyledCentralSectionTitle>
            Receitas prontas
          </StyledCentralSectionTitle>
          <StyledCentralMuted>
            cria o fluxo com o nome da receita; gatilho e passos você ajusta no
            editor
          </StyledCentralMuted>
        </StyledSectionHeader>
        <StyledRecipeGrid>
          {CENTRAL_WORKFLOW_RECIPES.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              disabled={createDisabled}
              onCreate={(item) => handleCreate(item.sentence)}
            />
          ))}
        </StyledRecipeGrid>
      </StyledSection>
    </CentralPageLayout>
  );
};
