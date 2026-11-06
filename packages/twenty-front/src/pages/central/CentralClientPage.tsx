// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { LazyMarkdownContent } from '@/ai/components/LazyMarkdownRenderer';
import { CentralAmountEditor } from '@/central/components/CentralAmountEditor';
import { CentralPageLayout } from '@/central/components/CentralPageLayout';
import {
  centralButtonClassName,
  StyledCentralCard,
  StyledCentralFillLink,
  StyledCentralKpi,
  StyledCentralKpiGrid,
  StyledCentralKpiHint,
  StyledCentralKpiLabel,
  StyledCentralKpiValue,
  StyledCentralMuted,
  StyledCentralSectionTitle,
  StyledCentralSegment,
  StyledCentralSegmented,
  StyledCentralWarning,
} from '@/central/components/CentralStyled';
import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { useCentralRecordUpdates } from '@/central/hooks/useCentralRecordUpdates';
import { type CentralCompany } from '@/central/types/CentralCompany';
import { getCentralClientMargin } from '@/central/utils/centralAlerts';
import {
  formatCentralCostTotal,
  formatCentralCurrency,
  fromAmountMicros,
  getCentralCostSummary,
  getDaysSinceReview,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import {
  type CentralClientTab,
  getCentralHostname,
  getCentralInitials,
  getNativeRecordPath,
  getSupabaseRef,
  pluralize,
} from '@/central/utils/centralText';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getSafeUrl, isDefined } from 'twenty-shared/utils';
import {
  IconCheck,
  IconChevronLeft,
  IconCode,
  IconCopy,
  IconExternalLink,
  IconLock,
  IconPencil,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBackLink = styled(Link)`
  align-items: center;
  align-self: flex-start;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: 14px;
  gap: 6px;
  min-height: 32px;
  text-decoration: none;
`;

const StyledHero = styled.header`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 18px;
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  padding: 24px;
`;

const StyledHeroIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
  min-width: 0;
`;

const StyledHeroInitials = styled.div`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray1};
  border-radius: 16px;
  color: ${themeCssVariables.grayScale.gray12};
  display: flex;
  flex: none;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 22px;
  font-weight: 700;
  height: 60px;
  justify-content: center;
  width: 60px;
`;

const StyledHeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const StyledHeroTitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StyledHeroTitle = styled.h1`
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
`;

const StyledHeroSubtitle = styled.span`
  font-size: 14px;
  opacity: 0.75;
`;

const StyledHeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledCopyChip = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 9px;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 13px;
  gap: 8px;
  min-height: 34px;
  opacity: 0.85;
  padding: 0 12px;

  &:hover {
    opacity: 1;
  }
`;

const StyledHeroMargin = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledHeroMarginValue = styled.span`
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 30px;
  font-weight: 600;
`;

const StyledHeroMarginNote = styled.span`
  font-size: 13px;
  opacity: 0.8;
`;

const StyledRulesBanner = styled.section`
  align-items: center;
  background: ${themeCssVariables.tag.background.amber};
  border-radius: 14px;
  color: ${themeCssVariables.tag.text.amber};
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  gap: 8px 18px;
  padding: 12px 18px;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const StyledRulesBannerButton = styled.button`
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  margin-left: auto;
  padding: 0;
  text-decoration: underline;
`;

const StyledAcessoActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledSmallButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 8px;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 12px;
  gap: 6px;
  max-width: 100%;
  min-height: 32px;
  overflow: hidden;
  padding: 0 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledColumns = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const StyledMainColumn = styled.div`
  display: flex;
  flex: 999 1 520px;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const StyledAside = styled.aside`
  display: flex;
  flex: 1 1 280px;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
`;

const StyledAsideTitle = styled.h2`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledMiniGrid = styled.section`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
`;

const StyledRowBetween = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: space-between;
`;

const StyledStrong = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

const StyledTableWrapper = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: 14px;
  min-width: 560px;
  width: 100%;

  th {
    color: ${themeCssVariables.font.color.tertiary};
    font-size: 12px;
    font-weight: 500;
    padding: 14px 18px;
    text-align: left;
  }

  td {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    padding: 14px 18px;
  }

  th:last-child,
  td:last-child {
    text-align: right;
  }
`;

const StyledNotice = styled.div`
  align-items: center;
  background: ${themeCssVariables.tag.background.amber};
  border-radius: 12px;
  color: ${themeCssVariables.tag.text.amber};
  display: flex;
  font-size: 13px;
  gap: 10px;
  padding: 12px 16px;
`;

const StyledStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const StyledChip = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 8px;
  font-size: 13px;
  padding: 6px 10px;
`;

const StyledContact = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 50%;
  display: flex;
  flex: none;
  font-weight: 600;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledPendingList = styled.ul`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledArticle = styled(StyledCentralCard)`
  font-size: 15px;
  line-height: 1.6;
  max-width: 760px;
`;

const StyledFillButton = styled.button`
  background: none;
  border: 0;
  color: ${themeCssVariables.tag.text.amber};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  padding: 0;
  text-align: left;
  text-decoration: underline;
`;

const TABS = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'infra', label: 'Infra e custos' },
  { id: 'acessos', label: 'Acessos' },
  { id: 'playbook', label: 'Playbook' },
] as const;

type CentralPendingItem = {
  label: string;
  to?: string;
  onClick?: () => void;
};

const PLAYBOOK_BANNER_RULE_COUNT = 4;

const LIST_ITEM_REGEX = /^\s*(?:[-*]|\d+\.)\s+(.*)$/;

const getPlaybookNote = (company: CentralCompany) => {
  const notes = company.noteTargets
    .map((noteTarget) => noteTarget.note)
    .filter(isDefined);

  return (
    notes.find((note) => note.title?.startsWith('Playbook')) ?? notes.at(0)
  );
};

const getPlaybookRules = (markdown: string | null | undefined) =>
  (markdown ?? '')
    .split('\n')
    .map((line) => LIST_ITEM_REGEX.exec(line)?.[1])
    .filter(isNonEmptyString)
    .map((item) => item.replace(/\*\*|__|`/g, '').replace(/\\(.)/g, '$1'))
    .slice(0, 5);

const getReviewLabel = (revisadoEm: string | null, now: Date) => {
  const days = getDaysSinceReview(revisadoEm, now);

  if (!isDefined(days)) {
    return 'nunca revisado';
  }

  return days === 0
    ? 'revisado hoje'
    : `revisado há ${pluralize(days, 'dia', 'dias')}`;
};

const formatCnpj = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, '');

  return digits.length === 14
    ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    : cnpj;
};

const CentralClientContent = ({ company }: { company: CentralCompany }) => {
  const { getStatusOption, getCustoInfraLabel } = useCentralCompanies();
  const { saveAmount, markAcessoReviewed } = useCentralRecordUpdates();
  const { copyToClipboard } = useCopyToClipboard();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: CentralClientTab =
    TABS.find((tab) => tab.id === searchParams.get('aba'))?.id ?? 'visao';
  const setActiveTab = (tab: CentralClientTab) =>
    setSearchParams({ aba: tab }, { replace: true });
  const now = new Date();

  const companyPath = getNativeRecordPath('company', company.id);
  const statusOption = getStatusOption(company.statusCliente);
  const mensalidade = fromAmountMicros(company.mensalidade);
  const costSummary = getCentralCostSummary(
    company.custosInfra.map((custo) => custo.custoMensal),
  );
  const { margin, missingCostCount, hasMensalidade } =
    getCentralClientMargin(company);
  const marginNote = !hasMensalidade
    ? 'preencha a mensalidade'
    : missingCostCount > 0
      ? `incompleta: faltam ${pluralize(missingCostCount, 'custo', 'custos')}`
      : 'completa';
  const pendingAcessos = company.acessos.filter((acesso) =>
    isAcessoPendingReview(acesso, now),
  );
  const playbookNote = getPlaybookNote(company);
  const playbookMarkdown = playbookNote?.bodyV2?.markdown ?? '';
  const playbookRules = getPlaybookRules(playbookMarkdown);
  const contact = company.people.at(0);
  const contactName = [contact?.name?.firstName, contact?.name?.lastName]
    .filter(isNonEmptyString)
    .join(' ');
  const contactEmail = contact?.emails?.primaryEmail;
  const stackItems = (company.stack ?? '')
    .split(/[,\n·;]/)
    .map((item) => item.trim())
    .filter(isNonEmptyString);
  const appUrl = getSafeUrl(company.domainName?.primaryLinkUrl);
  const repositoryUrl = getSafeUrl(company.repositorio?.primaryLinkUrl);
  const city = [company.address?.addressCity, company.address?.addressState]
    .filter(isNonEmptyString)
    .join('/');
  const domain = getCentralHostname(company.domainName?.primaryLinkUrl);
  const supabaseRef = getSupabaseRef([
    ...company.acessos
      .filter((acesso) =>
        [acesso.name, acesso.tipo, acesso.url?.primaryLinkUrl].some((text) =>
          text?.toLowerCase().includes('supabase'),
        ),
      )
      .flatMap((acesso) => [acesso.url?.primaryLinkUrl, acesso.login]),
    ...company.custosInfra
      .filter((custo) =>
        [custo.provedor, custo.name].some((text) =>
          text?.toLowerCase().includes('supabase'),
        ),
      )
      .flatMap((custo) => [custo.servico, custo.observacao]),
  ]);
  const copyChips = [
    isNonEmptyString(company.cnpj) && {
      label: `CNPJ ${formatCnpj(company.cnpj)}`,
      value: formatCnpj(company.cnpj),
    },
    isNonEmptyString(domain) && { label: domain, value: domain },
    isNonEmptyString(supabaseRef) && {
      label: `ref ${supabaseRef}`,
      value: supabaseRef,
    },
  ].filter((chip): chip is { label: string; value: string } => chip !== false);

  const pendingCandidates: (CentralPendingItem | false)[] = [
    missingCostCount > 0 && {
      label: `Preencher ${pluralize(missingCostCount, 'custo', 'custos')}`,
      onClick: () => setActiveTab('infra'),
    },
    pendingAcessos.length > 0 && {
      label: `Revisar ${pluralize(pendingAcessos.length, 'acesso', 'acessos')}`,
      onClick: () => setActiveTab('acessos'),
    },
    !isDefined(contact) && { label: 'Cadastrar contato', to: companyPath },
    !isDefined(playbookNote) && {
      label: 'Escrever playbook',
      to: companyPath,
    },
  ];
  const pendingItems = pendingCandidates.filter(
    (item): item is CentralPendingItem => item !== false,
  );

  const renderCost = (custo: CentralCompany['custosInfra'][number]) => (
    <CentralAmountEditor
      amount={fromAmountMicros(custo.custoMensal)}
      label={`Custo de ${getCustoInfraLabel('provedor', custo.provedor) ?? custo.name}`}
      onSave={(amount) => saveAmount('custoInfra', custo.id, amount)}
    />
  );

  return (
    <CentralPageLayout title={company.name ?? 'Cliente'}>
      <StyledRowBetween>
        <StyledBackLink to={CENTRAL_PATHS.clients}>
          <IconChevronLeft size={16} />
          Meus clientes
        </StyledBackLink>
        <StyledHeroActions>
          {isDefined(appUrl) && (
            <a
              className={centralButtonClassName}
              href={appUrl}
              target="_blank"
              rel="noreferrer"
            >
              <IconExternalLink size={16} />
              Abrir app
            </a>
          )}
          {isDefined(repositoryUrl) && (
            <a
              className={centralButtonClassName}
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
            >
              <IconCode size={16} />
              Repositório
            </a>
          )}
          <Link className={centralButtonClassName} to={companyPath}>
            <IconPencil size={16} />
            Editar
          </Link>
        </StyledHeroActions>
      </StyledRowBetween>

      <StyledHero>
        <StyledHeroIdentity>
          <StyledHeroInitials>
            {getCentralInitials(company.name)}
          </StyledHeroInitials>
          <StyledHeroText>
            <StyledHeroTitleRow>
              <StyledHeroTitle>{company.name}</StyledHeroTitle>
              {isDefined(statusOption) && (
                <Tag color={statusOption.color}>{statusOption.label}</Tag>
              )}
            </StyledHeroTitleRow>
            {isNonEmptyString(city) && (
              <StyledHeroSubtitle>{city}</StyledHeroSubtitle>
            )}
            <StyledHeroActions>
              {copyChips.map((chip) => (
                <StyledCopyChip
                  key={chip.label}
                  type="button"
                  aria-label={`Copiar ${chip.label}`}
                  onClick={() => copyToClipboard(chip.value, 'Copiado')}
                >
                  {chip.label}
                  <IconCopy size={14} />
                </StyledCopyChip>
              ))}
              {!isNonEmptyString(company.cnpj) && (
                <StyledHeroSubtitle>CNPJ: preencher</StyledHeroSubtitle>
              )}
            </StyledHeroActions>
          </StyledHeroText>
        </StyledHeroIdentity>
        <StyledHeroMargin>
          <StyledHeroSubtitle>Margem / mês</StyledHeroSubtitle>
          <StyledHeroMarginValue>
            {isDefined(margin) ? formatCentralCurrency(margin) : '—'}
          </StyledHeroMarginValue>
          <StyledHeroMarginNote>{marginNote}</StyledHeroMarginNote>
        </StyledHeroMargin>
      </StyledHero>

      {playbookRules.length > 0 && (
        <StyledRulesBanner aria-label="Antes de mexer">
          <strong>Antes de mexer:</strong>
          {playbookRules.slice(0, PLAYBOOK_BANNER_RULE_COUNT).map((rule) => (
            <span key={rule}>{rule}</span>
          ))}
          <StyledRulesBannerButton
            type="button"
            onClick={() => setActiveTab('playbook')}
          >
            Ver playbook
          </StyledRulesBannerButton>
        </StyledRulesBanner>
      )}

      <StyledCentralKpiGrid aria-label="Números do cliente">
        <StyledCentralKpi>
          <StyledCentralKpiLabel>Mensalidade</StyledCentralKpiLabel>
          <StyledCentralKpiValue>
            <CentralAmountEditor
              amount={mensalidade}
              label="Mensalidade"
              onSave={(amount) => saveAmount('company', company.id, amount)}
            />
          </StyledCentralKpiValue>
          <StyledCentralKpiHint>
            clique no valor · Enter salva · Esc cancela
          </StyledCentralKpiHint>
        </StyledCentralKpi>
        <StyledCentralKpi>
          <StyledCentralKpiLabel>Infra / mês</StyledCentralKpiLabel>
          <StyledCentralKpiValue>
            {formatCentralCostTotal(costSummary)}
          </StyledCentralKpiValue>
          <StyledCentralKpiHint warning={missingCostCount > 0}>
            {costSummary.filledCount} de {costSummary.count} custos preenchidos
          </StyledCentralKpiHint>
        </StyledCentralKpi>
        <StyledCentralKpi>
          <StyledCentralKpiLabel>Margem</StyledCentralKpiLabel>
          <StyledCentralKpiValue>
            {isDefined(margin) ? formatCentralCurrency(margin) : '—'}
          </StyledCentralKpiValue>
          <StyledCentralKpiHint warning={marginNote !== 'completa'}>
            {marginNote}
          </StyledCentralKpiHint>
        </StyledCentralKpi>
        <StyledCentralKpi inverted={pendingAcessos.length > 0}>
          <StyledCentralKpiLabel>Acessos a revisar</StyledCentralKpiLabel>
          <StyledCentralKpiValue>{pendingAcessos.length}</StyledCentralKpiValue>
          <StyledCentralKpiHint>
            de {company.acessos.length} · revisão a cada 90 dias
          </StyledCentralKpiHint>
        </StyledCentralKpi>
      </StyledCentralKpiGrid>

      <StyledCentralSegmented role="tablist" aria-label="Seções do cliente">
        {TABS.map((tab) => (
          <StyledCentralSegment
            key={tab.id}
            type="button"
            role="tab"
            active={activeTab === tab.id}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </StyledCentralSegment>
        ))}
      </StyledCentralSegmented>

      <StyledColumns>
        <StyledMainColumn>
          {activeTab === 'visao' && (
            <>
              <StyledMiniGrid aria-label="Infra">
                {company.custosInfra.map((custo) => (
                  <StyledCentralCard key={custo.id}>
                    <StyledRowBetween>
                      <StyledStrong>
                        {getCustoInfraLabel('provedor', custo.provedor) ??
                          custo.name}
                      </StyledStrong>
                      {renderCost(custo)}
                    </StyledRowBetween>
                    <StyledCentralMuted>
                      {custo.servico ?? custo.name}
                    </StyledCentralMuted>
                  </StyledCentralCard>
                ))}
              </StyledMiniGrid>
            </>
          )}

          {activeTab === 'infra' && (
            <StyledTableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Provedor</th>
                    <th>Serviço / projeto</th>
                    <th>Quem paga</th>
                    <th>Custo / mês</th>
                  </tr>
                </thead>
                <tbody>
                  {company.custosInfra.map((custo) => (
                    <tr key={custo.id}>
                      <td>
                        <StyledStrong>
                          {getCustoInfraLabel('provedor', custo.provedor) ??
                            custo.name}
                        </StyledStrong>
                      </td>
                      <td>{custo.servico ?? custo.name}</td>
                      <td>
                        {getCustoInfraLabel('quemPaga', custo.quemPaga) ?? (
                          <StyledCentralWarning>a definir</StyledCentralWarning>
                        )}
                      </td>
                      <td>{renderCost(custo)}</td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </StyledTableWrapper>
          )}

          {activeTab === 'acessos' && (
            <>
              <StyledNotice>
                <IconLock size={18} />
                Senha nunca fica aqui: só o caminho no cofre.
              </StyledNotice>
              {company.acessos.map((acesso) => {
                const acessoUrl = getSafeUrl(acesso.url?.primaryLinkUrl);
                const isPending = isAcessoPendingReview(acesso, now);
                const reviewLabel = getReviewLabel(acesso.revisadoEm, now);
                const copyValue = isNonEmptyString(acesso.login)
                  ? acesso.login
                  : getCentralHostname(acesso.url?.primaryLinkUrl);
                const isReviewedToday =
                  getDaysSinceReview(acesso.revisadoEm, now) === 0;

                return (
                  <StyledCentralCard key={acesso.id}>
                    <StyledRowBetween>
                      <StyledHeroText>
                        <StyledStrong>{acesso.name}</StyledStrong>
                        <StyledCentralMuted>
                          senha:{' '}
                          {acesso.ondeEstaASenha ??
                            'preencher caminho do cofre'}
                        </StyledCentralMuted>
                      </StyledHeroText>
                      <StyledRowBetween>
                        {isPending ? (
                          <StyledCentralWarning>
                            {reviewLabel}
                          </StyledCentralWarning>
                        ) : (
                          <StyledCentralMuted>{reviewLabel}</StyledCentralMuted>
                        )}
                        {isDefined(acessoUrl) ? (
                          <a
                            className={centralButtonClassName}
                            data-inverted="true"
                            href={acessoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Abrir
                          </a>
                        ) : (
                          <Link
                            className={centralButtonClassName}
                            to={getNativeRecordPath('acesso', acesso.id)}
                          >
                            Editar
                          </Link>
                        )}
                      </StyledRowBetween>
                    </StyledRowBetween>
                    <StyledAcessoActions>
                      {isNonEmptyString(copyValue) && (
                        <StyledSmallButton
                          type="button"
                          aria-label={`Copiar ${copyValue}`}
                          onClick={() => copyToClipboard(copyValue, 'Copiado')}
                        >
                          <IconCopy size={14} />
                          {copyValue}
                        </StyledSmallButton>
                      )}
                      {!isReviewedToday && (
                        <StyledSmallButton
                          type="button"
                          onClick={() => markAcessoReviewed(acesso.id)}
                        >
                          <IconCheck size={14} />
                          Marcar revisado
                        </StyledSmallButton>
                      )}
                    </StyledAcessoActions>
                  </StyledCentralCard>
                );
              })}
            </>
          )}

          {activeTab === 'playbook' && (
            <StyledArticle>
              <StyledRowBetween>
                <StyledCentralSectionTitle>Playbook</StyledCentralSectionTitle>
                <Link
                  className={centralButtonClassName}
                  to={
                    isDefined(playbookNote)
                      ? getNativeRecordPath('note', playbookNote.id)
                      : companyPath
                  }
                >
                  <IconPencil size={16} />
                  {isDefined(playbookNote) ? 'Editar' : 'Criar'}
                </Link>
              </StyledRowBetween>
              {isNonEmptyString(playbookMarkdown) ? (
                <LazyMarkdownContent text={playbookMarkdown} />
              ) : (
                <StyledCentralMuted>
                  Nenhuma nota "Playbook · {company.name}" ligada a este
                  cliente.
                </StyledCentralMuted>
              )}
            </StyledArticle>
          )}
        </StyledMainColumn>

        <StyledAside>
          <StyledCentralCard>
            <StyledAsideTitle>Contato</StyledAsideTitle>
            {isDefined(contact) ? (
              <>
                <StyledContact>
                  <StyledAvatar>{getCentralInitials(contactName)}</StyledAvatar>
                  <StyledHeroText>
                    <StyledStrong>{contactName || 'Sem nome'}</StyledStrong>
                    <StyledCentralMuted>
                      {contact.jobTitle ?? 'cargo: preencher'}
                    </StyledCentralMuted>
                  </StyledHeroText>
                </StyledContact>
                {isNonEmptyString(contactEmail) && (
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                )}
              </>
            ) : (
              <StyledCentralFillLink to={companyPath}>
                cadastrar contato
              </StyledCentralFillLink>
            )}
          </StyledCentralCard>
          <StyledCentralCard>
            <StyledAsideTitle>Stack</StyledAsideTitle>
            {stackItems.length > 0 ? (
              <StyledStack>
                {stackItems.map((item) => (
                  <StyledChip key={item}>{item}</StyledChip>
                ))}
              </StyledStack>
            ) : (
              <StyledCentralFillLink to={companyPath}>
                preencher
              </StyledCentralFillLink>
            )}
          </StyledCentralCard>
          <StyledCentralCard>
            <StyledAsideTitle>Pendências</StyledAsideTitle>
            {pendingItems.length > 0 ? (
              <StyledPendingList>
                {pendingItems.map((item) => (
                  <li key={item.label}>
                    {isDefined(item.to) ? (
                      <StyledCentralFillLink to={item.to}>
                        {item.label}
                      </StyledCentralFillLink>
                    ) : (
                      <StyledFillButton type="button" onClick={item.onClick}>
                        {item.label}
                      </StyledFillButton>
                    )}
                  </li>
                ))}
              </StyledPendingList>
            ) : (
              <StyledCentralMuted>Nada pendente.</StyledCentralMuted>
            )}
          </StyledCentralCard>
        </StyledAside>
      </StyledColumns>
    </CentralPageLayout>
  );
};

export const CentralClientPage = () => {
  const { companyId } = useParams();
  const { companies, loading } = useCentralCompanies();
  const company = companies.find((candidate) => candidate.id === companyId);

  if (!isDefined(company)) {
    return (
      <CentralPageLayout title="Cliente">
        <StyledCentralMuted>
          {loading ? 'Carregando…' : 'Cliente não encontrado.'}
        </StyledCentralMuted>
      </CentralPageLayout>
    );
  }

  return <CentralClientContent company={company} />;
};
