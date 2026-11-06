// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { LazyMarkdownContent } from '@/ai/components/LazyMarkdownRenderer';
import { CentralPageLayout } from '@/central/components/CentralPageLayout';
import {
  centralButtonClassName,
  StyledCentralMuted,
  StyledCentralSectionTitle,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralActivities } from '@/central/hooks/useCentralActivities';
import { type CentralActivity } from '@/central/types/CentralActivity';
import {
  getCentralPlaybookTitle,
  isCentralPlaybookNote,
  searchCentralNotes,
} from '@/central/utils/centralNotes';
import { getCentralInitials, pluralize } from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconPin, IconPlus, IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const NO_COMPANY = 'none';
const PLAYBOOK_ACCENT = themeCssVariables.tag.background.amber;

const StyledHeader = styled.header`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
`;

const StyledSearch = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 12px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1 1 320px;
  gap: 10px;
  max-width: 560px;
  min-height: 48px;
  padding: 0 14px;
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: 15px;
  min-width: 0;
  outline: 0;
`;

const StyledColumns = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const StyledRail = styled.nav`
  display: flex;
  flex: 1 1 220px;
  flex-direction: column;
  gap: 4px;
  max-width: 280px;
`;

const StyledRailButton = styled.button<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) =>
    active ? themeCssVariables.grayScale.gray12 : 'transparent'};
  border: 1px solid
    ${({ active }) =>
      active ? themeCssVariables.grayScale.gray12 : 'transparent'};
  border-radius: 12px;
  color: ${({ active }) =>
    active
      ? themeCssVariables.grayScale.gray1
      : themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  gap: 10px;
  justify-content: space-between;
  min-height: 52px;
  padding: 8px 12px;
  text-align: left;
`;

const StyledRailName = styled.span`
  align-items: center;
  display: flex;
  gap: 10px;
`;

const StyledInitials = styled.span<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) =>
    active
      ? themeCssVariables.grayScale.gray10
      : themeCssVariables.background.tertiary};
  border-radius: 9px;
  display: inline-flex;
  flex: none;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 12px;
  font-weight: 700;
  height: 30px;
  justify-content: center;
  width: 30px;
`;

const StyledMain = styled.main`
  display: flex;
  flex: 999 1 560px;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
`;

const StyledPlaybook = styled.section`
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 18px;
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px 24px;
`;

const StyledPlaybookTitle = styled.span`
  align-items: center;
  color: ${PLAYBOOK_ACCENT};
  display: flex;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 18px;
  font-weight: 600;
  gap: 10px;
`;

const StyledPlaybookBody = styled.div`
  color: ${themeCssVariables.grayScale.gray3};
  font-size: 14px;
  line-height: 1.5;

  a {
    color: inherit;
  }
`;

const StyledPlaybookEmpty = styled.section`
  align-items: center;
  background: ${themeCssVariables.tag.background.amber};
  border: 1.5px dashed ${themeCssVariables.tag.text.amber};
  border-radius: 18px;
  color: ${themeCssVariables.tag.text.amber};
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: space-between;
  padding: 20px 22px;
`;

const StyledNoteGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;

const StyledNoteCard = styled(Link)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 14px;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 110px;
  padding: 16px 18px;
  text-decoration: none;
`;

const StyledNoteTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

const StyledNotePreview = styled.span`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  font-size: 14px;
  line-height: 1.45;
  overflow: hidden;
`;

const StyledNewNoteButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1.5px dashed ${themeCssVariables.border.color.strong};
  border-radius: 14px;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  min-height: 110px;
`;

const StyledMark = styled.mark`
  background: ${themeCssVariables.tag.background.amber};
  border-radius: 3px;
  color: inherit;
  padding: 0 2px;
`;

const StyledResultMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 12px;
`;

const getNotePath = (noteId: string) =>
  getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: StandardObjectNameSingular.Note,
    objectRecordId: noteId,
  });

const getPreview = (note: CentralActivity) =>
  (note.bodyMarkdown ?? '').replace(/[#*_`>-]/g, '').trim() || 'Sem texto';

export const CentralNotesPage = () => {
  const navigate = useNavigate();
  const {
    activities: notes,
    companies,
    loading,
    createActivityForCompany,
  } = useCentralActivities(StandardObjectNameSingular.Note);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const rail = [
    ...companies,
    ...(notes.some((note) => !isDefined(note.companyId))
      ? [{ id: NO_COMPANY, name: 'Sem cliente' }]
      : []),
  ];
  const selected =
    rail.find((company) => company.id === selectedId) ?? rail.at(0);
  const selectedCompanyId =
    selected?.id === NO_COMPANY ? null : (selected?.id ?? null);

  const notesOf = (companyId: string | null) =>
    notes.filter((note) => note.companyId === companyId);
  const selectedNotes = notesOf(selectedCompanyId);
  const playbook = selectedNotes.find(isCentralPlaybookNote);
  const otherNotes = selectedNotes.filter((note) => note !== playbook);

  const results = searchCentralNotes(notes, query);
  const resultCompanyCount = new Set(results.map(({ note }) => note.companyId))
    .size;

  const handleCreate = async (title: string) => {
    const created = await createActivityForCompany(
      { title },
      selectedCompanyId,
    );

    navigate(getNotePath(created.id));
  };

  const companyLabel = selected?.name ?? 'Sem nome';

  return (
    <CentralPageLayout title="Notas">
      <StyledHeader>
        <StyledCentralTitle>Notas</StyledCentralTitle>
        <StyledSearch>
          <IconSearch size={18} />
          <StyledSearchInput
            type="search"
            aria-label="Buscar notas"
            placeholder="Buscar em todas as notas e playbooks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </StyledSearch>
      </StyledHeader>

      <StyledColumns>
        <StyledRail aria-label="Clientes">
          {rail.map((company) => {
            const active =
              company === selected && !isNonEmptyString(query.trim());

            return (
              <StyledRailButton
                key={company.id}
                type="button"
                active={active}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  setSelectedId(company.id);
                  setQuery('');
                }}
              >
                <StyledRailName>
                  <StyledInitials active={active}>
                    {company.id === NO_COMPANY
                      ? '—'
                      : getCentralInitials(company.name)}
                  </StyledInitials>
                  {company.name ?? 'Sem nome'}
                </StyledRailName>
                {notesOf(company.id === NO_COMPANY ? null : company.id).length}
              </StyledRailButton>
            );
          })}
        </StyledRail>

        <StyledMain>
          {isNonEmptyString(query.trim()) ? (
            <>
              <StyledCentralMuted>
                {pluralize(results.length, 'resultado', 'resultados')} em{' '}
                {pluralize(resultCompanyCount, 'cliente', 'clientes')}
              </StyledCentralMuted>
              <StyledNoteGrid>
                {results.map(({ note, before, match, after }) => (
                  <StyledNoteCard key={note.id} to={getNotePath(note.id)}>
                    <StyledResultMeta>
                      {note.companyName ?? 'Sem cliente'}
                      {isCentralPlaybookNote(note) ? ' · Playbook' : ''}
                    </StyledResultMeta>
                    <StyledNoteTitle>
                      {note.title ?? 'Sem título'}
                    </StyledNoteTitle>
                    <StyledNotePreview>
                      {before}
                      {isNonEmptyString(match) && (
                        <StyledMark>{match}</StyledMark>
                      )}
                      {after}
                    </StyledNotePreview>
                  </StyledNoteCard>
                ))}
              </StyledNoteGrid>
            </>
          ) : (
            isDefined(selected) && (
              <>
                <StyledRow>
                  <StyledCentralSectionTitle>
                    {companyLabel}
                  </StyledCentralSectionTitle>
                  {isDefined(selectedCompanyId) && (
                    <Link
                      className={centralButtonClassName}
                      to={`/central/${selectedCompanyId}`}
                    >
                      Abrir Central
                    </Link>
                  )}
                </StyledRow>

                {isDefined(playbook) ? (
                  <StyledPlaybook aria-label="Playbook">
                    <StyledRow>
                      <StyledPlaybookTitle>
                        <IconPin size={18} />
                        Playbook
                      </StyledPlaybookTitle>
                      <Link
                        className={centralButtonClassName}
                        to={getNotePath(playbook.id)}
                      >
                        Editar
                      </Link>
                    </StyledRow>
                    <StyledPlaybookBody>
                      {isNonEmptyString(playbook.bodyMarkdown) ? (
                        <LazyMarkdownContent text={playbook.bodyMarkdown} />
                      ) : (
                        'Playbook vazio: preencher.'
                      )}
                    </StyledPlaybookBody>
                  </StyledPlaybook>
                ) : (
                  isDefined(selectedCompanyId) && (
                    <StyledPlaybookEmpty aria-label="Playbook">
                      <div>
                        <StyledCentralSectionTitle>
                          Sem playbook
                        </StyledCentralSectionTitle>
                        Deploy, banco, acessos e cuidados deste cliente.
                      </div>
                      <button
                        type="button"
                        className={centralButtonClassName}
                        data-inverted="true"
                        onClick={() =>
                          void handleCreate(
                            getCentralPlaybookTitle(companyLabel),
                          )
                        }
                      >
                        Escrever playbook
                      </button>
                    </StyledPlaybookEmpty>
                  )
                )}

                <StyledRow>
                  <StyledCentralSectionTitle>Caderno</StyledCentralSectionTitle>
                  <StyledCentralMuted>
                    {otherNotes.length > 0
                      ? pluralize(otherNotes.length, 'nota', 'notas')
                      : 'nenhuma nota ainda'}
                  </StyledCentralMuted>
                </StyledRow>
                <StyledNoteGrid>
                  {otherNotes.map((note) => (
                    <StyledNoteCard key={note.id} to={getNotePath(note.id)}>
                      <StyledNoteTitle>
                        {note.title ?? 'Sem título'}
                      </StyledNoteTitle>
                      <StyledNotePreview>{getPreview(note)}</StyledNotePreview>
                    </StyledNoteCard>
                  ))}
                  <StyledNewNoteButton
                    type="button"
                    onClick={() => void handleCreate('Nova nota')}
                  >
                    <IconPlus size={16} />
                    Nova nota · {companyLabel}
                  </StyledNewNoteButton>
                </StyledNoteGrid>
              </>
            )
          )}
          {!loading && rail.length === 0 && (
            <StyledCentralMuted>Nenhum cliente cadastrado.</StyledCentralMuted>
          )}
        </StyledMain>
      </StyledColumns>
    </CentralPageLayout>
  );
};
