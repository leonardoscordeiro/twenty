// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralPageLayout } from '@/central/components/CentralPageLayout';
import {
  StyledCentralCard,
  StyledCentralDisplayText,
  StyledCentralFillLink,
  StyledCentralMuted,
  StyledCentralSegment,
  StyledCentralSegmented,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import {
  formatCentralCostTotal,
  formatCentralCurrency,
  fromAmountMicros,
  getCentralCostSummary,
} from '@/central/utils/centralMoney';
import { getNativeRecordPath } from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeading = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledProgressCard = styled.section`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 16px;
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 22px;
`;

const StyledProgressCount = styled.div`
  display: flex;
  flex: 1 1 220px;
  flex-direction: column;
  gap: 6px;
`;

const StyledProgressDetail = styled.div`
  display: flex;
  flex: 3 1 320px;
  flex-direction: column;
  gap: 10px;
`;

const StyledFaded = styled.span`
  font-size: 13px;
  opacity: 0.75;
`;

const StyledBigNumber = styled(StyledCentralDisplayText)`
  font-size: 30px;
`;

const StyledTrack = styled.div`
  background: ${themeCssVariables.grayScale.gray10};
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
`;

const StyledFill = styled.div<{ percent: number }>`
  background: ${themeCssVariables.grayScale.gray1};
  height: 100%;
  width: ${({ percent }) => `${percent}%`};
`;

const StyledGroups = styled.section`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
`;

const StyledGroupHeader = styled.div`
  align-items: baseline;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const StyledGroupTitle = styled(StyledCentralDisplayText)`
  font-size: 17px;
`;

const StyledGroupTotal = styled.span`
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
`;

const StyledItem = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  font-size: 13px;
  gap: 10px;
  justify-content: space-between;
  padding-top: 8px;
`;

const StyledItemValue = styled.span`
  font-weight: 600;
  white-space: nowrap;
`;

type GroupMode = 'provedor' | 'cliente';

const GROUP_MODES: { id: GroupMode; label: string }[] = [
  { id: 'provedor', label: 'Por provedor' },
  { id: 'cliente', label: 'Por cliente' },
];

export const CentralInfraPage = () => {
  const { companies, getCustoInfraLabel } = useCentralCompanies();
  const [groupMode, setGroupMode] = useState<GroupMode>('provedor');

  const rows = companies.flatMap((company) =>
    company.custosInfra.map((custo) => ({
      custo,
      provider:
        getCustoInfraLabel('provedor', custo.provedor) ??
        custo.name ??
        'Sem provedor',
      clientName: company.name ?? 'Sem nome',
    })),
  );
  const summary = getCentralCostSummary(
    rows.map((row) => row.custo.custoMensal),
  );
  const percent =
    summary.count > 0
      ? Math.round((summary.filledCount / summary.count) * 100)
      : 0;

  const rowsByGroup = rows.reduce<Record<string, typeof rows>>(
    (accumulator, row) => {
      const key = groupMode === 'provedor' ? row.provider : row.clientName;

      return { ...accumulator, [key]: [...(accumulator[key] ?? []), row] };
    },
    {},
  );

  const groups = Object.entries(rowsByGroup)
    .map(([title, groupRows]) => ({
      title,
      rows: groupRows,
      total: formatCentralCostTotal(
        getCentralCostSummary(groupRows.map((row) => row.custo.custoMensal)),
      ),
    }))
    .sort((first, second) => second.rows.length - first.rows.length);

  return (
    <CentralPageLayout title="Infra e custos">
      <StyledHeading>
        <StyledCentralTitle>Infra e custos</StyledCentralTitle>
        <StyledCentralMuted>
          Tudo que você paga por mês, por provedor e por cliente.
        </StyledCentralMuted>
      </StyledHeading>

      <StyledProgressCard>
        <StyledProgressCount>
          <StyledFaded>Custos com valor preenchido</StyledFaded>
          <StyledBigNumber>
            {summary.filledCount} de {summary.count}
          </StyledBigNumber>
        </StyledProgressCount>
        <StyledProgressDetail>
          <StyledTrack
            role="progressbar"
            aria-label="Custos preenchidos"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <StyledFill percent={percent} />
          </StyledTrack>
          <StyledFaded>
            Total conhecido: {formatCentralCostTotal(summary)}. Enquanto faltar
            valor, o total e a margem ficam incompletos. Clique em "preencher"
            em cada linha.
          </StyledFaded>
        </StyledProgressDetail>
      </StyledProgressCard>

      <StyledCentralSegmented role="group" aria-label="Agrupar por">
        {GROUP_MODES.map((mode) => (
          <StyledCentralSegment
            key={mode.id}
            type="button"
            active={groupMode === mode.id}
            aria-pressed={groupMode === mode.id}
            onClick={() => setGroupMode(mode.id)}
          >
            {mode.label}
          </StyledCentralSegment>
        ))}
      </StyledCentralSegmented>

      <StyledGroups>
        {groups.map((group) => (
          <StyledCentralCard key={group.title}>
            <StyledGroupHeader>
              <StyledGroupTitle>{group.title}</StyledGroupTitle>
              <StyledGroupTotal>{group.total}</StyledGroupTotal>
            </StyledGroupHeader>
            {group.rows.map(({ custo, provider, clientName }) => {
              const amount = fromAmountMicros(custo.custoMensal);

              return (
                <StyledItem key={custo.id}>
                  <span>
                    {groupMode === 'provedor' ? clientName : provider}
                  </span>
                  {isDefined(amount) ? (
                    <StyledItemValue>
                      {formatCentralCurrency(amount)}
                    </StyledItemValue>
                  ) : (
                    <StyledCentralFillLink
                      to={getNativeRecordPath('custoInfra', custo.id)}
                    >
                      preencher
                    </StyledCentralFillLink>
                  )}
                </StyledItem>
              );
            })}
          </StyledCentralCard>
        ))}
      </StyledGroups>
    </CentralPageLayout>
  );
};
