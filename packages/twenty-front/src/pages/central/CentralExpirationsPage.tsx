// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralPageLayout } from '@/central/components/CentralPageLayout';
import {
  StyledCentralCard,
  StyledCentralMuted,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { useCentralExpirations } from '@/central/hooks/useCentralMonitor';
import {
  CENTRAL_EXPIRATION_KIND_LABELS,
  CENTRAL_EXPIRATION_WINDOW_IN_DAYS,
  type CentralExpirationRow,
  getCentralExpirationRows,
  getDaysUntil,
  isExpirationAlerting,
} from '@/central/utils/centralMonitor';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledColumns = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const StyledTableWrapper = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  flex: 999 1 560px;
  min-width: 0;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: 14px;
  min-width: 600px;
  width: 100%;

  th {
    color: ${themeCssVariables.font.color.tertiary};
    font-size: 12px;
    font-weight: 500;
    padding: 12px 18px;
    text-align: left;
  }

  td {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    padding: 12px 18px;
  }

  th:last-child,
  td:last-child {
    text-align: right;
    white-space: nowrap;
  }
`;

const StyledAside = styled.aside`
  display: flex;
  flex: 1 1 300px;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
`;

const StyledAsideTitle = styled.h2`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledAsideRow = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 10px;
`;

const StyledRemaining = styled.span<{ tone: 'past' | 'alert' | 'normal' }>`
  background: ${({ tone }) =>
    tone === 'alert' ? themeCssVariables.tag.background.amber : 'transparent'};
  border-radius: 999px;
  color: ${({ tone }) =>
    tone === 'past'
      ? themeCssVariables.tag.text.red
      : tone === 'alert'
        ? themeCssVariables.tag.text.amber
        : 'inherit'};
  font-size: 13px;
  font-weight: 600;
  padding: 3px 10px;
`;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatDate = (date: string) =>
  dateFormatter.format(
    new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date),
  );

export const CentralExpirationsPage = () => {
  const { companies } = useCentralCompanies();
  const { data, error } = useCentralExpirations();
  const now = new Date();

  const rows = getCentralExpirationRows(data?.items ?? [], companies);
  const datedRows = rows
    .filter((row): row is CentralExpirationRow & { expiresAt: string } =>
      isDefined(row.expiresAt),
    )
    .sort((first, second) => first.expiresAt.localeCompare(second.expiresAt));
  const undatedRows = rows.filter((row) => !isDefined(row.expiresAt));

  return (
    <CentralPageLayout title="Vencimentos">
      <StyledHeading>
        <StyledCentralTitle>Vencimentos</StyledCentralTitle>
        <StyledCentralMuted>
          Próximos {CENTRAL_EXPIRATION_WINDOW_IN_DAYS} dias em destaque. Vira
          alerta 30 dias antes (certificado, 14).
        </StyledCentralMuted>
      </StyledHeading>

      <StyledColumns>
        <StyledTableWrapper aria-label="Lista de vencimentos">
          <StyledTable>
            <thead>
              <tr>
                <th>O quê</th>
                <th>Cliente</th>
                <th>Vence</th>
                <th>Origem</th>
                <th>Falta</th>
              </tr>
            </thead>
            <tbody>
              {datedRows.map((row) => {
                const days = getDaysUntil(row.expiresAt, now);
                const tone =
                  days < 0
                    ? 'past'
                    : isExpirationAlerting(row, now)
                      ? 'alert'
                      : 'normal';

                return (
                  <tr key={`${row.kind}-${row.name}-${row.companyName}`}>
                    <td>
                      <strong>
                        {CENTRAL_EXPIRATION_KIND_LABELS[row.kind]}
                      </strong>{' '}
                      <StyledCentralMuted>{row.name}</StyledCentralMuted>
                    </td>
                    <td>{row.companyName}</td>
                    <td>{formatDate(row.expiresAt)}</td>
                    <td>
                      <StyledCentralMuted>{row.origin}</StyledCentralMuted>
                    </td>
                    <td>
                      <StyledRemaining tone={tone}>
                        {days < 0 ? 'venceu' : `em ${days} dias`}
                      </StyledRemaining>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
          {!isDefined(data) && (
            <StyledCentralCard>
              <StyledCentralMuted>
                {error
                  ? 'Não consegui ler domínios e certificados agora.'
                  : 'Lendo domínios e certificados…'}
              </StyledCentralMuted>
            </StyledCentralCard>
          )}
        </StyledTableWrapper>

        <StyledAside>
          <StyledCentralCard>
            <StyledAsideTitle>Sem data ainda</StyledAsideTitle>
            {undatedRows.length === 0 && (
              <StyledCentralMuted>Tudo com data.</StyledCentralMuted>
            )}
            {undatedRows.map((row) => (
              <StyledAsideRow key={`${row.kind}-${row.name}`}>
                <strong>
                  {CENTRAL_EXPIRATION_KIND_LABELS[row.kind]} · {row.name}
                </strong>
                <StyledCentralMuted>
                  {row.kind === 'contract'
                    ? 'preencha "Fim do contrato" na empresa'
                    : 'leitura automática falhou, tenta de novo amanhã'}
                </StyledCentralMuted>
              </StyledAsideRow>
            ))}
          </StyledCentralCard>
          <StyledCentralCard>
            <StyledAsideTitle>De onde vêm as datas</StyledAsideTitle>
            <StyledCentralMuted>
              Domínio: RDAP (registro.br e Verisign), automático.
            </StyledCentralMuted>
            <StyledCentralMuted>
              Certificado: leitura do TLS do site, automático.
            </StyledCentralMuted>
            <StyledCentralMuted>
              Contrato: campo "Fim do contrato" da empresa. Renovação: campo
              "Renovação" do custo de infra.
            </StyledCentralMuted>
          </StyledCentralCard>
        </StyledAside>
      </StyledColumns>
    </CentralPageLayout>
  );
};
