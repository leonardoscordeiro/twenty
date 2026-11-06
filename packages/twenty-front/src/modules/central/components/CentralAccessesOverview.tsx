// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralEmptyState } from '@/central/components/CentralEmptyState';
import {
  StyledCentralDisplayText,
  StyledCentralSegment,
  StyledCentralSegmented,
} from '@/central/components/CentralStyled';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { useCentralRecordUpdates } from '@/central/hooks/useCentralRecordUpdates';
import {
  type CentralAccessFilter,
  type CentralAccessRow,
  getCentralAccessCounts,
  groupCentralAccessRows,
  isAcessoVaultToConfirm,
} from '@/central/utils/centralAccesses';
import {
  getDaysSinceReview,
  getReviewLabel,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import {
  getCentralHostname,
  getNativeRecordPath,
  pluralize,
} from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSafeUrl, isDefined } from 'twenty-shared/utils';
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconLock,
  IconSearch,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const PHONE_MEDIA_QUERY = '@media (max-width: 760px)';

const StyledSummary = styled.section`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 16px;
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
  flex-wrap: wrap;
  gap: 16px 36px;
  padding: 20px 22px;
`;

const StyledSummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledFaded = styled.span`
  font-size: 13px;
  opacity: 0.75;
`;

const StyledBigNumber = styled(StyledCentralDisplayText)`
  font-size: 30px;
`;

const StyledMediumNumber = styled(StyledCentralDisplayText)`
  font-size: 20px;
`;

const StyledVaultNote = styled.span`
  align-items: center;
  display: inline-flex;
  font-size: 13px;
  gap: 8px;
  margin-left: auto;
  max-width: 320px;
  opacity: 0.75;
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const StyledField = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 10px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: 13px;
  gap: 8px;
  min-height: 44px;
  padding: 0 12px;
`;

const StyledSearch = styled(StyledField)`
  flex: 0 1 280px;
  margin-left: auto;

  ${PHONE_MEDIA_QUERY} {
    flex: 1 1 100%;
    margin-left: 0;
  }
`;

const StyledInput = styled.input`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  min-width: 0;
  outline: 0;
`;

const StyledSelect = styled.select`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  min-height: 40px;
  outline: 0;
`;

const StyledTable = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow: hidden;
`;

const GRID_COLUMNS =
  'minmax(0, 1.3fr) 150px 180px 170px minmax(0, 1.4fr) 100px 150px';

const StyledHeaderRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  display: grid;
  font-size: 12px;
  gap: 14px;
  grid-template-columns: ${GRID_COLUMNS};
  padding: 12px 20px;

  ${PHONE_MEDIA_QUERY} {
    display: none;
  }
`;

const StyledGroupHeader = styled.div`
  align-items: baseline;
  background: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: 10px;
  padding: 14px 20px 10px;
`;

const StyledGroupName = styled(StyledCentralDisplayText)`
  font-size: 16px;
`;

const StyledMuted = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 12px;
`;

const StyledRow = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  font-size: 14px;
  gap: 14px;
  grid-template-columns: ${GRID_COLUMNS};
  min-height: 56px;
  padding: 8px 20px;

  ${PHONE_MEDIA_QUERY} {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
  }
`;

const StyledName = styled.span`
  font-weight: 600;
  min-width: 0;
`;

const StyledPill = styled.span`
  align-self: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 12px;
  font-weight: 600;
  justify-self: start;
  padding: 3px 10px;
  white-space: nowrap;

  ${PHONE_MEDIA_QUERY} {
    align-self: flex-start;
  }
`;

const StyledChipButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 8px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 13px;
  gap: 6px;
  justify-self: start;
  max-width: 100%;
  min-height: 36px;
  padding: 0 10px;
`;

const StyledChipLink = styled.a`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 8px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-size: 13px;
  gap: 6px;
  justify-self: start;
  max-width: 100%;
  min-height: 36px;
  padding: 0 10px;
  text-decoration: none;
`;

const StyledFillLink = styled(Link)`
  align-items: center;
  background: ${themeCssVariables.tag.background.amber};
  border: 1px dashed ${themeCssVariables.tag.text.amber};
  border-radius: 8px;
  box-sizing: border-box;
  color: ${themeCssVariables.tag.text.amber};
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  justify-self: start;
  min-height: 36px;
  padding: 0 10px;
  text-decoration: none;
`;

const StyledEllipsis = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledVault = styled.span<{ warning: boolean }>`
  align-items: flex-start;
  color: ${({ warning }) =>
    warning
      ? themeCssVariables.tag.text.amber
      : themeCssVariables.font.color.secondary};
  display: flex;
  font-size: 13px;
  font-weight: ${({ warning }) => (warning ? 600 : 400)};
  gap: 6px;
  line-height: 1.35;
  min-width: 0;

  & > svg {
    flex: none;
    margin-top: 2px;
  }
`;

const StyledReviewButton = styled.button<{ pending: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 8px;
  color: ${({ pending }) =>
    pending
      ? themeCssVariables.tag.text.amber
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  justify-self: start;
  min-height: 36px;
  padding: 0 10px;
  white-space: nowrap;

  &:disabled {
    cursor: default;
  }
`;

const StyledEmpty = styled.p`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  margin: 0;
  padding: 32px 20px;
  text-align: center;
`;

const StyledFootnote = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 13px;
  margin: 0;
`;

const ALL_TYPES = '';

export const CentralAccessesOverview = () => {
  const { companies, getAcessoLabel, loading } = useCentralCompanies();
  const { markAcessoReviewed } = useCentralRecordUpdates();
  const { copyToClipboard } = useCopyToClipboard();
  const [filter, setFilter] = useState<CentralAccessFilter>('todos');
  const [typeLabel, setTypeLabel] = useState(ALL_TYPES);
  const [query, setQuery] = useState('');

  const now = new Date();
  const rows: CentralAccessRow[] = companies.flatMap((company) =>
    company.acessos.map((acesso) => ({
      acesso,
      clientName: company.name ?? 'Sem nome',
      typeLabel: getAcessoLabel('tipo', acesso.tipo),
    })),
  );

  if (!loading && rows.length === 0) {
    return (
      <CentralEmptyState
        title="Índice vazio"
        description="Cadastre na tabela padrão onde cada acesso mora: o painel, o login e em que cofre está a senha. A senha em si nunca entra aqui."
      />
    );
  }

  const counts = getCentralAccessCounts(rows, now);
  const groups = groupCentralAccessRows(rows, {
    filter,
    typeLabel: typeLabel === ALL_TYPES ? null : typeLabel,
    query,
    now,
  });
  const typeLabels = [
    ...new Set(rows.map((row) => row.typeLabel).filter(isNonEmptyString)),
  ].sort((first, second) => first.localeCompare(second, 'pt-BR'));

  const filters: { id: CentralAccessFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'revisar', label: `A revisar · ${counts.revisar}` },
    { id: 'confirmar', label: `Senha a confirmar · ${counts.confirmar}` },
    { id: 'login', label: `Sem login · ${counts.login}` },
  ];

  return (
    <>
      <StyledSummary aria-label="Situação dos acessos">
        <StyledSummaryItem>
          <StyledFaded>A revisar (nunca ou há mais de 90 dias)</StyledFaded>
          <StyledBigNumber>
            {counts.revisar} de {rows.length}
          </StyledBigNumber>
        </StyledSummaryItem>
        <StyledSummaryItem>
          <StyledMediumNumber>{counts.login}</StyledMediumNumber>
          <StyledFaded>sem login</StyledFaded>
        </StyledSummaryItem>
        <StyledSummaryItem>
          <StyledMediumNumber>{counts.confirmar}</StyledMediumNumber>
          <StyledFaded>senha com lugar a confirmar</StyledFaded>
        </StyledSummaryItem>
        <StyledVaultNote>
          <IconLock size={16} />
          Este índice não guarda senha. Mostra só onde ela está.
        </StyledVaultNote>
      </StyledSummary>

      <StyledToolbar>
        <StyledCentralSegmented role="group" aria-label="Filtrar">
          {filters.map((accessFilter) => (
            <StyledCentralSegment
              key={accessFilter.id}
              type="button"
              active={filter === accessFilter.id}
              aria-pressed={filter === accessFilter.id}
              onClick={() => setFilter(accessFilter.id)}
            >
              {accessFilter.label}
            </StyledCentralSegment>
          ))}
        </StyledCentralSegmented>
        <StyledField>
          Tipo
          <StyledSelect
            value={typeLabel}
            onChange={(event) => setTypeLabel(event.target.value)}
          >
            <option value={ALL_TYPES}>Todos</option>
            {typeLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </StyledSelect>
        </StyledField>
        <StyledSearch>
          <IconSearch size={16} />
          <StyledInput
            aria-label="Buscar acesso"
            placeholder="Buscar acesso, endereço ou cofre"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </StyledSearch>
      </StyledToolbar>

      <StyledTable aria-label="Índice de acessos">
        <StyledHeaderRow>
          <span>Acesso</span>
          <span>Tipo</span>
          <span>Endereço</span>
          <span>Login</span>
          <span>Senha fica em</span>
          <span>Dono</span>
          <span>Revisão</span>
        </StyledHeaderRow>

        {groups.map((group) => (
          <div key={group.clientName}>
            <StyledGroupHeader>
              <StyledGroupName>{group.clientName}</StyledGroupName>
              <StyledMuted>
                {pluralize(group.rows.length, 'acesso', 'acessos')}
              </StyledMuted>
            </StyledGroupHeader>

            {group.rows.map(({ acesso, typeLabel: rowTypeLabel }) => {
              const recordPath = getNativeRecordPath('acesso', acesso.id);
              const url = getSafeUrl(acesso.url?.primaryLinkUrl);
              const hostname = getCentralHostname(acesso.url?.primaryLinkUrl);
              const isPending = isAcessoPendingReview(acesso, now);
              const isReviewedToday =
                getDaysSinceReview(acesso.revisadoEm, now) === 0;

              return (
                <StyledRow key={acesso.id}>
                  <StyledName>{acesso.name}</StyledName>
                  {isNonEmptyString(rowTypeLabel) ? (
                    <StyledPill>{rowTypeLabel}</StyledPill>
                  ) : (
                    <StyledFillLink to={recordPath}>
                      tipo: preencher
                    </StyledFillLink>
                  )}
                  {isDefined(url) ? (
                    <StyledChipLink
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir ${acesso.name}`}
                    >
                      <StyledEllipsis>{hostname}</StyledEllipsis>
                      <IconExternalLink size={12} />
                    </StyledChipLink>
                  ) : (
                    <StyledFillLink to={recordPath}>
                      endereço: preencher
                    </StyledFillLink>
                  )}
                  {isNonEmptyString(acesso.login) ? (
                    <StyledChipButton
                      type="button"
                      aria-label={`Copiar login ${acesso.login}`}
                      onClick={() =>
                        copyToClipboard(acesso.login ?? '', 'Login copiado')
                      }
                    >
                      <StyledEllipsis>{acesso.login}</StyledEllipsis>
                      <IconCopy size={14} />
                    </StyledChipButton>
                  ) : (
                    <StyledFillLink to={recordPath}>
                      login: preencher
                    </StyledFillLink>
                  )}
                  <StyledVault warning={isAcessoVaultToConfirm(acesso)}>
                    <IconLock size={14} />
                    {acesso.ondeEstaASenha ?? 'preencher onde está a senha'}
                  </StyledVault>
                  <span>{acesso.quemTemAcesso ?? '—'}</span>
                  <StyledReviewButton
                    type="button"
                    pending={isPending}
                    disabled={isReviewedToday}
                    onClick={() => markAcessoReviewed(acesso.id)}
                  >
                    {isReviewedToday ? (
                      <>
                        <IconCheck size={12} /> revisado hoje
                      </>
                    ) : (
                      `${getReviewLabel(acesso.revisadoEm, now)} · marcar`
                    )}
                  </StyledReviewButton>
                </StyledRow>
              );
            })}
          </div>
        ))}

        {groups.length === 0 && (
          <StyledEmpty>
            {filter !== 'todos' && query.trim() === ''
              ? 'Nada aqui: esse filtro está em dia.'
              : 'Nenhum acesso com essa busca.'}
          </StyledEmpty>
        )}
      </StyledTable>

      <StyledFootnote>
        Copiar só existe pra login. Senha não tem botão: a coluna diz em que
        cofre ela mora. Revisar = conferi que funciona e quem tem; some do
        alerta por 90 dias.
      </StyledFootnote>
    </>
  );
};
