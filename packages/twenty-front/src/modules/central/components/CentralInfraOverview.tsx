// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralCostsTable } from '@/central/components/CentralCostsTable';
import { CentralEmptyState } from '@/central/components/CentralEmptyState';
import {
  StyledCentralDisplayText,
  StyledCentralMuted,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { useCentralRecordUpdates } from '@/central/hooks/useCentralRecordUpdates';
import {
  formatCentralCostTotal,
  getCentralCostSummary,
} from '@/central/utils/centralMoney';
import { styled } from '@linaria/react';
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

export const CentralInfraOverview = () => {
  const { custoRows, getCustoInfraLabel, loading } = useCentralCompanies();
  const { saveAmount } = useCentralRecordUpdates();
  const summary = getCentralCostSummary(
    custoRows.map((row) => row.custo.custoMensal),
  );
  const percent =
    summary.count > 0
      ? Math.round((summary.filledCount / summary.count) * 100)
      : 0;

  if (!loading && custoRows.length === 0) {
    return (
      <CentralEmptyState
        title="Nenhum custo ainda"
        description="Sem custo, a margem de cada cliente fica em branco. Crie os custos na tabela padrão, ligados ao cliente, e lance o valor aqui."
      />
    );
  }

  return (
    <>
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
            na tabela pra lançar.
          </StyledFaded>
        </StyledProgressDetail>
      </StyledProgressCard>

      <CentralCostsTable
        rows={custoRows}
        getPayerLabel={(value) => getCustoInfraLabel('quemPaga', value)}
        onSaveAmount={(custoId, amount) =>
          saveAmount('custoInfra', custoId, amount)
        }
      />
    </>
  );
};
