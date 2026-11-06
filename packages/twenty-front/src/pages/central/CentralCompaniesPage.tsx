// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralDirectoryLayout } from '@/central/components/CentralDirectoryLayout';
import {
  centralButtonClassName,
  StyledCentralDisplayText,
  StyledCentralMuted,
  StyledCentralSegment,
  StyledCentralSegmented,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { CENTRAL_DIRECTORY_PATHS } from '@/central/constants/CentralDirectoryPaths';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { type CentralCompany } from '@/central/types/CentralCompany';
import {
  getCentralClientMargin,
  getMissingCostCount,
  matchesCentralSearch,
} from '@/central/utils/centralAlerts';
import {
  formatCentralCurrency,
  fromAmountMicros,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import {
  getCentralPersonName,
  getPrimaryContact,
} from '@/central/utils/centralPeople';
import {
  getPlaybookNote,
  getPlaybookRules,
} from '@/central/utils/centralPlaybook';
import {
  getCentralClientPath,
  getCentralHostname,
  getCentralInitials,
  pluralize,
} from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  IconBuildingSkyscraper,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const MOBILE_QUERY = '@media (max-width: 760px)';

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

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledSearch = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 10px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1 1 260px;
  gap: 10px;
  min-height: 40px;
  padding: 0 12px;
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  min-width: 0;
  outline: 0;
`;

const StyledGaps = styled.section`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 14px;
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 8px 10px;
  padding: 12px 16px;
`;

const StyledGap = styled.span<{ tone: 'amber' | 'blue' }>`
  background: ${({ tone }) => themeCssVariables.tag.background[tone]};
  border-radius: 999px;
  color: ${({ tone }) => themeCssVariables.tag.text[tone]};
  padding: 6px 12px;

  a {
    color: inherit;
  }
`;

const StyledTable = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow: hidden;
`;

const ROW_COLUMNS =
  'minmax(220px, 2fr) 140px minmax(130px, 1.1fr) 150px minmax(160px, 1.4fr) 130px 110px 20px';

const StyledHeadRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  display: grid;
  font-size: 12px;
  font-weight: 500;
  gap: 16px;
  grid-template-columns: ${ROW_COLUMNS};
  padding: 12px 20px;

  ${MOBILE_QUERY} {
    display: none;
  }
`;

const StyledRow = styled(Link)`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  gap: 16px;
  grid-template-columns: ${ROW_COLUMNS};
  min-height: 72px;
  padding: 10px 20px;
  text-decoration: none;

  &:first-of-type {
    border-top: 0;
  }

  &:hover {
    background: ${themeCssVariables.background.secondary};
  }

  ${MOBILE_QUERY} {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    padding: 14px 16px;
  }
`;

const StyledIdentity = styled.span`
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;

  ${MOBILE_QUERY} {
    flex-basis: 100%;
  }
`;

const StyledInitials = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 11px;
  display: flex;
  flex: none;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 14px;
  font-weight: 700;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledStack = styled.span<{ alignEnd?: boolean }>`
  align-items: ${({ alignEnd }) => (alignEnd ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  ${MOBILE_QUERY} {
    align-items: flex-start;
  }
`;

const StyledCell = styled.span<{ tone?: 'amber' | 'blue' | 'muted' }>`
  color: ${({ tone }) =>
    tone === 'muted'
      ? themeCssVariables.font.color.tertiary
      : isDefined(tone)
        ? themeCssVariables.tag.text[tone]
        : themeCssVariables.font.color.primary};
  font-size: 14px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledChevron = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: flex;

  ${MOBILE_QUERY} {
    display: none;
  }
`;

const StyledEmpty = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 36px 28px;
`;

const COMPANIES_INDEX_PATH = getAppPath(AppPath.RecordIndexPage, {
  objectNamePlural: 'companies',
});

const getAcessoCell = (company: CentralCompany, now: Date) => {
  if (company.acessos.length === 0) {
    return { label: 'nenhum', tone: 'muted' as const };
  }

  const pending = company.acessos.filter((acesso) =>
    isAcessoPendingReview(acesso, now),
  ).length;

  return pending > 0
    ? { label: `${pending} a revisar`, tone: 'blue' as const }
    : { label: 'em dia', tone: undefined };
};

const getPlaybookCell = (company: CentralCompany) => {
  const note = getPlaybookNote(company);

  if (!isDefined(note)) {
    return { label: 'sem playbook', tone: 'muted' as const };
  }

  const ruleCount = getPlaybookRules(note.bodyV2?.markdown).length;

  return {
    label: ruleCount > 0 ? pluralize(ruleCount, 'regra', 'regras') : 'tem',
    tone: undefined,
  };
};

export const CentralCompaniesPage = () => {
  const {
    companies,
    loading,
    statusOptions,
    getStatusOption,
    getProdutoLabel,
    getCustoInfraLabel,
  } = useCentralCompanies();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const now = new Date();

  const visibleCompanies = companies
    .filter(
      (company) =>
        !isDefined(statusFilter) || company.statusCliente === statusFilter,
    )
    .filter(
      (company) =>
        matchesCentralSearch(company, query, (value) =>
          getCustoInfraLabel('provedor', value),
        ) ||
        [company.cnpj, company.domainName?.primaryLinkUrl].some((text) =>
          text?.toLowerCase().includes(query.trim().toLowerCase()),
        ),
    );

  const withoutMensalidade = companies.filter(
    (company) => !isDefined(fromAmountMicros(company.mensalidade)),
  ).length;
  const missingCosts = companies.reduce(
    (sum, company) => sum + getMissingCostCount(company),
    0,
  );
  const withoutContact = companies.filter(
    (company) => company.people.length === 0,
  ).length;
  const pendingAcessos = companies
    .flatMap((company) => company.acessos)
    .filter((acesso) => isAcessoPendingReview(acesso, now)).length;
  const usedStatusOptions = statusOptions.filter((option) =>
    companies.some((company) => company.statusCliente === option.value),
  );
  const statusSummary = usedStatusOptions
    .map(
      (option) =>
        `${companies.filter((company) => company.statusCliente === option.value).length} ${option.label.toLowerCase()}`,
    )
    .join(' · ');

  const clearFilters = () => {
    setStatusFilter(null);
    setQuery('');
  };

  return (
    <CentralDirectoryLayout title="Empresas">
      <StyledHeader>
        <StyledHeading>
          <StyledCentralTitle>Empresas</StyledCentralTitle>
          <StyledCentralMuted>
            {pluralize(companies.length, 'cliente', 'clientes')}
            {isNonEmptyString(statusSummary) && ` · ${statusSummary}`}
          </StyledCentralMuted>
        </StyledHeading>
        <StyledToolbar>
          <StyledSearch>
            <IconSearch size={16} />
            <StyledSearchInput
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar cliente, CNPJ, domínio"
              aria-label="Buscar empresa"
            />
          </StyledSearch>
          <Link
            className={centralButtonClassName}
            data-inverted="true"
            to={COMPANIES_INDEX_PATH}
          >
            <IconPlus size={16} />
            Nova empresa
          </Link>
        </StyledToolbar>
      </StyledHeader>

      {companies.length > 0 &&
        withoutMensalidade + missingCosts + withoutContact + pendingAcessos >
          0 && (
          <StyledGaps aria-label="Falta preencher">
            <strong>Falta preencher</strong>
            {withoutMensalidade > 0 && (
              <StyledGap tone="amber">
                Mensalidade em {withoutMensalidade}
              </StyledGap>
            )}
            {missingCosts > 0 && (
              <StyledGap tone="amber">
                {pluralize(missingCosts, 'custo de infra', 'custos de infra')}
              </StyledGap>
            )}
            {withoutContact > 0 && (
              <StyledGap tone="blue">
                <Link to={CENTRAL_DIRECTORY_PATHS.people}>
                  Contato principal em {withoutContact}
                </Link>
              </StyledGap>
            )}
            {pendingAcessos > 0 && (
              <StyledGap tone="blue">
                {pluralize(pendingAcessos, 'acesso', 'acessos')} a revisar
              </StyledGap>
            )}
          </StyledGaps>
        )}

      {usedStatusOptions.length > 1 && (
        <StyledCentralSegmented role="tablist" aria-label="Filtrar por status">
          <StyledCentralSegment
            type="button"
            role="tab"
            active={!isDefined(statusFilter)}
            aria-selected={!isDefined(statusFilter)}
            onClick={() => setStatusFilter(null)}
          >
            Todos {companies.length}
          </StyledCentralSegment>
          {usedStatusOptions.map((option) => (
            <StyledCentralSegment
              key={option.value}
              type="button"
              role="tab"
              active={statusFilter === option.value}
              aria-selected={statusFilter === option.value}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}{' '}
              {
                companies.filter(
                  (company) => company.statusCliente === option.value,
                ).length
              }
            </StyledCentralSegment>
          ))}
        </StyledCentralSegmented>
      )}

      <StyledTable aria-label="Lista de empresas">
        {companies.length === 0 ? (
          <StyledEmpty>
            <IconBuildingSkyscraper size={28} />
            <StyledCentralDisplayText>
              {loading ? 'Carregando…' : 'Nenhum cliente ainda'}
            </StyledCentralDisplayText>
            {!loading && (
              <StyledCentralMuted>
                Nome, status e mensalidade bastam pra começar. O resto você
                completa na ficha.
              </StyledCentralMuted>
            )}
          </StyledEmpty>
        ) : visibleCompanies.length === 0 ? (
          <StyledEmpty>
            <StyledCentralDisplayText>
              Nenhuma empresa com esse filtro
            </StyledCentralDisplayText>
            <button
              type="button"
              className={centralButtonClassName}
              onClick={clearFilters}
            >
              Limpar busca e filtro
            </button>
          </StyledEmpty>
        ) : (
          <>
            <StyledHeadRow>
              <span>Cliente</span>
              <span>Status</span>
              <span>Produto</span>
              <span>Margem / mês</span>
              <span>Contato principal</span>
              <span>Acessos</span>
              <span>Playbook</span>
              <span />
            </StyledHeadRow>
            {visibleCompanies.map((company) => {
              const statusOption = getStatusOption(company.statusCliente);
              const produto = getProdutoLabel(company.produto);
              const { margin, reason } = getCentralClientMargin(company);
              const contact = getPrimaryContact(company.people);
              const contactName = isDefined(contact)
                ? getCentralPersonName(contact)
                : '';
              const acessoCell = getAcessoCell(company, now);
              const playbookCell = getPlaybookCell(company);

              return (
                <StyledRow
                  key={company.id}
                  to={getCentralClientPath(company.id)}
                  aria-label={`Abrir ${company.name ?? 'cliente'}`}
                >
                  <StyledIdentity>
                    <StyledInitials>
                      {getCentralInitials(company.name)}
                    </StyledInitials>
                    <StyledStack>
                      <StyledCentralDisplayText>
                        {company.name}
                      </StyledCentralDisplayText>
                      <StyledCentralMuted>
                        {getCentralHostname(
                          company.domainName?.primaryLinkUrl,
                        ) ?? 'domínio: preencher'}
                      </StyledCentralMuted>
                    </StyledStack>
                  </StyledIdentity>
                  <span>
                    {isDefined(statusOption) ? (
                      <Tag color={statusOption.color}>{statusOption.label}</Tag>
                    ) : (
                      <StyledCell tone="amber">status: preencher</StyledCell>
                    )}
                  </span>
                  <StyledCell
                    tone={isNonEmptyString(produto) ? undefined : 'amber'}
                  >
                    {isNonEmptyString(produto) ? produto : 'produto: preencher'}
                  </StyledCell>
                  <StyledStack alignEnd>
                    <StyledCell tone={isDefined(margin) ? undefined : 'amber'}>
                      {isDefined(margin)
                        ? formatCentralCurrency(margin)
                        : 'incompleta'}
                    </StyledCell>
                    {isNonEmptyString(reason) && (
                      <StyledCentralMuted>{reason}</StyledCentralMuted>
                    )}
                  </StyledStack>
                  <StyledStack>
                    <StyledCell tone={isDefined(contact) ? undefined : 'blue'}>
                      {isDefined(contact)
                        ? contactName || 'sem nome'
                        : 'definir contato'}
                    </StyledCell>
                    {isNonEmptyString(contact?.jobTitle) && (
                      <StyledCentralMuted>
                        {contact.jobTitle}
                      </StyledCentralMuted>
                    )}
                  </StyledStack>
                  <StyledCell tone={acessoCell.tone}>
                    {acessoCell.label}
                  </StyledCell>
                  <StyledCell tone={playbookCell.tone}>
                    {playbookCell.label}
                  </StyledCell>
                  <StyledChevron>
                    <IconChevronRight size={18} />
                  </StyledChevron>
                </StyledRow>
              );
            })}
          </>
        )}
      </StyledTable>
      <StyledCentralMuted>
        LinkedIn, endereço, receita anual e os outros campos padrão seguem na
        ficha completa do Twenty (botão Editar na ficha).
      </StyledCentralMuted>
    </CentralDirectoryLayout>
  );
};
