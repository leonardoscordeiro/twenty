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
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { type CentralCompany } from '@/central/types/CentralCompany';
import {
  getCentralAlerts,
  getCentralClientMargin,
  isAlertSnoozed,
  matchesCentralSearch,
  readSnoozedAlerts,
  snoozeAlert,
} from '@/central/utils/centralAlerts';
import {
  formatCentralCostTotal,
  formatCentralCurrency,
  fromAmountMicros,
  getCentralCostSummary,
  getCentralMargin,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import {
  getCentralClientPath,
  getCentralHostname,
  getCentralInitials,
  getCentralTodayLabel,
  pluralize,
} from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconClock, IconPlus, IconSearch } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
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

const StyledHeaderActions = styled.div`
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

const StyledShortcut = styled.kbd`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  padding: 2px 6px;
`;

const StyledAlerts = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow: hidden;
`;

const StyledAlertsHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px 20px;
`;

const StyledAlert = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 14px 20px;

  &:nth-of-type(2) {
    border-top: 0;
  }
`;

const StyledAlertDot = styled.span<{ warning: boolean }>`
  background: ${({ warning }) =>
    warning
      ? themeCssVariables.tag.text.amber
      : themeCssVariables.tag.text.blue};
  border-radius: 50%;
  flex: none;
  height: 10px;
  width: 10px;
`;

const StyledAlertText = styled.div`
  display: flex;
  flex: 1 1 320px;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledAlertTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

const StyledAlertDetail = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 4px 10px;

  a {
    color: inherit;
  }
`;

const StyledAlertActions = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledAllClear = styled.div`
  color: ${themeCssVariables.tag.text.green};
  font-size: 14px;
  padding: 16px 20px;
`;

const StyledMarginBox = styled.div`
  align-items: baseline;
  background: ${themeCssVariables.background.secondary};
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  justify-content: space-between;
  padding: 12px 14px;
`;

const StyledMarginValue = styled.span<{ warning: boolean }>`
  color: ${({ warning }) =>
    warning ? themeCssVariables.tag.text.amber : 'inherit'};
  font-size: 15px;
  font-weight: 600;
`;

const StyledMarginReason = styled(StyledCentralMuted)`
  flex-basis: 100%;
`;

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledFilterChip = styled.button<{ active: boolean }>`
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
      : themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  min-height: 40px;
  padding: 0 16px;
`;

const StyledFilterCount = styled.span`
  margin-left: 4px;
  opacity: 0.6;
`;

const StyledGrid = styled.section`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
`;

const StyledCardLink = styled(Link)`
  color: inherit;
  display: flex;
  text-decoration: none;

  &:hover > div {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledCardTop = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
`;

const StyledIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
`;

const StyledInitials = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 12px;
  display: flex;
  flex: none;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 16px;
  font-weight: 700;
  height: 44px;
  justify-content: center;
  width: 44px;
`;

const StyledNameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledName = styled(StyledCentralDisplayText)`
  font-size: 18px;
`;

const StyledProduct = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

const StyledStats = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding-top: 14px;
`;

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledStatValue = styled.span<{ warning?: boolean }>`
  color: ${({ warning }) =>
    warning ? themeCssVariables.tag.text.amber : 'inherit'};
  font-size: 14px;
  font-weight: 600;
`;

const ALL_FILTER = 'TODOS';

const CentralClientCard = ({
  company,
  statusTag,
}: {
  company: CentralCompany;
  statusTag: React.ReactNode;
}) => {
  const costSummary = getCentralCostSummary(
    company.custosInfra.map((custo) => custo.custoMensal),
  );
  const mensalidade = fromAmountMicros(company.mensalidade);
  const clientMargin = getCentralClientMargin(company);

  return (
    <StyledCardLink to={getCentralClientPath(company.id)}>
      <StyledCentralCard style={{ flex: 1 }}>
        <StyledCardTop>
          <StyledIdentity>
            <StyledInitials>{getCentralInitials(company.name)}</StyledInitials>
            <StyledNameBlock>
              <StyledName>{company.name}</StyledName>
              <StyledCentralMuted>
                {getCentralHostname(company.domainName?.primaryLinkUrl) ??
                  'sem domínio'}
              </StyledCentralMuted>
            </StyledNameBlock>
          </StyledIdentity>
          {statusTag}
        </StyledCardTop>
        <StyledProduct>{company.produto ?? 'Produto: preencher'}</StyledProduct>
        <StyledMarginBox>
          <StyledCentralMuted>Margem / mês</StyledCentralMuted>
          <StyledMarginValue warning={!clientMargin.isComplete}>
            {clientMargin.isComplete
              ? formatCentralCurrency(clientMargin.margin)
              : 'incompleta'}
          </StyledMarginValue>
          {isDefined(clientMargin.reason) && (
            <StyledMarginReason>{clientMargin.reason}</StyledMarginReason>
          )}
        </StyledMarginBox>
        <StyledStats>
          <StyledStat>
            <StyledCentralMuted>Mensalidade</StyledCentralMuted>
            <StyledStatValue warning={!isDefined(mensalidade)}>
              {formatCentralCurrency(mensalidade)}
            </StyledStatValue>
          </StyledStat>
          <StyledStat>
            <StyledCentralMuted>Infra</StyledCentralMuted>
            <StyledStatValue>
              {pluralize(costSummary.count, 'item', 'itens')}
              {costSummary.filledCount > 0 &&
                ` · ${formatCentralCostTotal(costSummary)}`}
            </StyledStatValue>
          </StyledStat>
          <StyledStat>
            <StyledCentralMuted>Acessos</StyledCentralMuted>
            <StyledStatValue>{company.acessos.length}</StyledStatValue>
          </StyledStat>
        </StyledStats>
      </StyledCentralCard>
    </StyledCardLink>
  );
};

export const CentralClientsPage = () => {
  const {
    companies,
    loading,
    statusOptions,
    getStatusOption,
    getCustoInfraLabel,
  } = useCentralCompanies();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [snoozedAlerts, setSnoozedAlerts] = useState(readSnoozedAlerts);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const now = new Date();

  // Capture phase so Ctrl K focuses this search instead of opening Twenty's command menu.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopPropagation();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const alerts = getCentralAlerts(companies, now).filter(
    (alert) => !isAlertSnoozed(snoozedAlerts, alert.id, now),
  );

  const revenueValues = companies.map((company) =>
    fromAmountMicros(company.mensalidade),
  );
  const filledRevenues = revenueValues.filter(isDefined);
  const revenue =
    filledRevenues.length > 0
      ? filledRevenues.reduce((sum, value) => sum + value, 0)
      : null;
  const costSummary = getCentralCostSummary(
    companies.flatMap((company) =>
      company.custosInfra.map((custo) => custo.custoMensal),
    ),
  );
  const { margin, isIncomplete } = getCentralMargin(revenue, costSummary);
  const acessos = companies.flatMap((company) => company.acessos);
  const pendingAcessos = acessos.filter((acesso) =>
    isAcessoPendingReview(acesso, now),
  );
  const neverReviewedCount = pendingAcessos.filter(
    (acesso) => !isDefined(acesso.revisadoEm),
  ).length;

  const filters = [
    { value: ALL_FILTER, label: 'Todos', count: companies.length },
    ...statusOptions.map((option) => ({
      value: option.value,
      label: option.label,
      count: companies.filter(
        (company) => company.statusCliente === option.value,
      ).length,
    })),
  ];
  const visibleCompanies = companies.filter(
    (company) =>
      (statusFilter === ALL_FILTER || company.statusCliente === statusFilter) &&
      matchesCentralSearch(company, searchQuery, (value) =>
        getCustoInfraLabel('provedor', value),
      ),
  );

  if (loading && companies.length === 0) {
    return (
      <CentralPageLayout title="Meus clientes">
        <StyledCentralMuted>Carregando…</StyledCentralMuted>
      </CentralPageLayout>
    );
  }

  return (
    <CentralPageLayout title="Meus clientes">
      <StyledHeader>
        <StyledHeading>
          <StyledCentralMuted>{getCentralTodayLabel(now)}</StyledCentralMuted>
          <StyledCentralTitle>Meus clientes</StyledCentralTitle>
        </StyledHeading>
        <StyledHeaderActions>
          <StyledSearch>
            <IconSearch size={16} />
            <StyledSearchInput
              ref={searchInputRef}
              type="search"
              placeholder="Buscar cliente, acesso, provedor"
              aria-label="Buscar cliente, acesso ou provedor"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <StyledShortcut>Ctrl K</StyledShortcut>
          </StyledSearch>
          <Link
            className={centralButtonClassName}
            data-inverted="true"
            to={getAppPath(AppPath.RecordIndexPage, {
              objectNamePlural: 'companies',
            })}
          >
            <IconPlus size={16} />
            Novo cliente
          </Link>
        </StyledHeaderActions>
      </StyledHeader>

      <StyledAlerts aria-label="Precisa de você">
        <StyledAlertsHeader>
          <StyledCentralSectionTitle>Precisa de você</StyledCentralSectionTitle>
          <StyledCentralMuted>
            {pluralize(alerts.length, 'pendência', 'pendências')}
          </StyledCentralMuted>
        </StyledAlertsHeader>
        {alerts.map((alert) => (
          <StyledAlert key={alert.id}>
            <StyledAlertDot
              aria-hidden="true"
              warning={alert.id !== 'acessos'}
            />
            <StyledAlertText>
              <StyledAlertTitle>{alert.title}</StyledAlertTitle>
              <StyledAlertDetail>
                <span>{alert.detail}</span>
                {alert.links.map((link) => (
                  <Link key={link.path} to={link.path}>
                    {link.label}
                  </Link>
                ))}
              </StyledAlertDetail>
            </StyledAlertText>
            <StyledAlertActions>
              <Link
                className={centralButtonClassName}
                data-inverted="true"
                to={alert.actionPath}
              >
                {alert.actionLabel}
              </Link>
              <button
                type="button"
                className={centralButtonClassName}
                title="Adiar 7 dias"
                aria-label={`Adiar por 7 dias: ${alert.title}`}
                onClick={() =>
                  setSnoozedAlerts(snoozeAlert(snoozedAlerts, alert.id, now))
                }
              >
                <IconClock size={16} />
              </button>
            </StyledAlertActions>
          </StyledAlert>
        ))}
        {alerts.length === 0 && <StyledAllClear>Tudo em dia.</StyledAllClear>}
      </StyledAlerts>

      <StyledCentralKpiGrid aria-label="Resumo do mês">
        <StyledCentralKpi>
          <StyledCentralKpiLabel>Receita mensal</StyledCentralKpiLabel>
          <StyledCentralKpiValue>
            {formatCentralCurrency(revenue)}
          </StyledCentralKpiValue>
          <StyledCentralKpiHint
            warning={filledRevenues.length < companies.length}
          >
            {filledRevenues.length} de {companies.length} mensalidades
            preenchidas
          </StyledCentralKpiHint>
        </StyledCentralKpi>
        <StyledCentralKpi>
          <StyledCentralKpiLabel>Custo de infra / mês</StyledCentralKpiLabel>
          <StyledCentralKpiValue>
            {formatCentralCostTotal(costSummary)}
          </StyledCentralKpiValue>
          <StyledCentralKpiHint
            warning={costSummary.filledCount < costSummary.count}
          >
            {costSummary.filledCount} de {costSummary.count} custos preenchidos
          </StyledCentralKpiHint>
        </StyledCentralKpi>
        <StyledCentralKpi>
          <StyledCentralKpiLabel>Margem</StyledCentralKpiLabel>
          <StyledCentralKpiValue>
            {isDefined(margin) ? formatCentralCurrency(margin) : '—'}
          </StyledCentralKpiValue>
          <StyledCentralKpiHint warning={isDefined(margin) && isIncomplete}>
            {isDefined(margin) && isIncomplete
              ? 'incompleto: falta custo'
              : 'receita menos infra'}
          </StyledCentralKpiHint>
        </StyledCentralKpi>
        <StyledCentralKpi inverted>
          <StyledCentralKpiLabel>Acessos a revisar</StyledCentralKpiLabel>
          <StyledCentralKpiValue>{pendingAcessos.length}</StyledCentralKpiValue>
          <StyledCentralKpiHint>
            {neverReviewedCount === pendingAcessos.length
              ? 'nunca revisados'
              : `${neverReviewedCount} nunca revisados, resto há 90+ dias`}
          </StyledCentralKpiHint>
        </StyledCentralKpi>
      </StyledCentralKpiGrid>

      <StyledFilters role="group" aria-label="Filtrar por status">
        {filters.map((filter) => (
          <StyledFilterChip
            key={filter.value}
            type="button"
            active={statusFilter === filter.value}
            aria-pressed={statusFilter === filter.value}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
            <StyledFilterCount>{filter.count}</StyledFilterCount>
          </StyledFilterChip>
        ))}
      </StyledFilters>

      <StyledGrid aria-label="Clientes">
        {visibleCompanies.map((company) => {
          const statusOption = getStatusOption(company.statusCliente);

          return (
            <CentralClientCard
              key={company.id}
              company={company}
              statusTag={
                isDefined(statusOption) ? (
                  <Tag color={statusOption.color}>{statusOption.label}</Tag>
                ) : (
                  <Tag color="gray">sem status</Tag>
                )
              }
            />
          );
        })}
      </StyledGrid>
    </CentralPageLayout>
  );
};
