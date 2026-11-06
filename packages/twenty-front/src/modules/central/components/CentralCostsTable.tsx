// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralAmountEditor } from '@/central/components/CentralAmountEditor';
import {
  StyledCentralDisplayText,
  StyledCentralSegment,
  StyledCentralSegmented,
} from '@/central/components/CentralStyled';
import {
  type CentralCostFilter,
  type CentralCostGroupMode,
  type CentralCostRow,
  groupCentralCostRows,
  isCentralCostMissing,
} from '@/central/utils/centralCosts';
import {
  formatCentralCostTotal,
  fromAmountMicros,
  getCentralCostSummary,
} from '@/central/utils/centralMoney';
import { pluralize } from '@/central/utils/centralText';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { IconChevronRight, IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const PHONE_MEDIA_QUERY = '@media (max-width: 640px)';

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const StyledSearch = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 10px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 0 1 280px;
  gap: 8px;
  margin-left: auto;
  min-height: 44px;
  padding: 0 12px;

  ${PHONE_MEDIA_QUERY} {
    flex: 1 1 100%;
    margin-left: 0;
  }
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

const StyledTable = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow: hidden;
`;

const StyledGrid = styled.div`
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) 140px 180px;
  padding: 0 20px;

  ${PHONE_MEDIA_QUERY} {
    gap: 10px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 0 14px;
  }
`;

const StyledHideOnPhone = styled.span`
  ${PHONE_MEDIA_QUERY} {
    display: none;
  }
`;

const StyledHeaderRow = styled(StyledGrid)`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 12px;
  min-height: 40px;
`;

const StyledGroupButton = styled.button`
  background: ${themeCssVariables.background.secondary};
  border: 0;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  min-height: 52px;
  text-align: left;
  width: 100%;
`;

const StyledGroupTitle = styled.span`
  align-items: center;
  display: flex;
  gap: 10px;
  min-width: 0;
`;

const StyledChevron = styled.span<{ open: boolean }>`
  display: inline-flex;
  transform: rotate(${({ open }) => (open ? '90deg' : '0deg')});
  transition: transform 0.15s;
`;

const StyledGroupName = styled(StyledCentralDisplayText)`
  font-size: 16px;
`;

const StyledSmall = styled.span<{ warning?: boolean }>`
  color: ${({ warning }) =>
    warning
      ? themeCssVariables.tag.text.amber
      : themeCssVariables.font.color.tertiary};
  font-size: 12px;
  font-weight: ${({ warning }) => (warning ? 600 : 400)};
`;

const StyledRight = styled.span`
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
`;

const StyledRow = styled(StyledGrid)`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  min-height: 60px;
  padding-bottom: 8px;
  padding-left: 44px;
  padding-top: 8px;

  ${PHONE_MEDIA_QUERY} {
    padding-left: 14px;
  }
`;

const StyledStack = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledEllipsis = styled(StyledSmall)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPayer = styled.span<{ empty: boolean }>`
  color: ${({ empty }) =>
    empty
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.primary};
  font-size: 13px;
`;

const StyledAmountCell = styled.span`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledHint = styled(StyledSmall)`
  max-width: 180px;
  text-align: right;
`;

const StyledTotalRow = styled(StyledGrid)`
  border-top: 2px solid ${themeCssVariables.font.color.primary};
  font-size: 15px;
  min-height: 56px;
`;

const StyledEmpty = styled.p`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  margin: 0;
  padding: 32px 20px;
  text-align: center;
`;

const GROUP_MODES: { id: CentralCostGroupMode; label: string }[] = [
  { id: 'provedor', label: 'Por provedor' },
  { id: 'cliente', label: 'Por cliente' },
];

type CentralCostsTableProps = {
  rows: CentralCostRow[];
  getPayerLabel: (value: string | null) => string | null;
  onSaveAmount: (custoId: string, amount: number | null) => void;
};

export const CentralCostsTable = ({
  rows,
  getPayerLabel,
  onSaveAmount,
}: CentralCostsTableProps) => {
  const [mode, setMode] = useState<CentralCostGroupMode>('provedor');
  const [filter, setFilter] = useState<CentralCostFilter>('todos');
  const [query, setQuery] = useState('');
  const [closedTitles, setClosedTitles] = useState<string[]>([]);

  const groups = groupCentralCostRows(rows, { mode, filter, query });
  const totalSummary = getCentralCostSummary(
    rows.map((row) => row.custo.custoMensal),
  );
  const missingCount = rows.filter(isCentralCostMissing).length;

  const filters: { id: CentralCostFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'preencher', label: `A preencher · ${missingCount}` },
  ];

  const toggleGroup = (title: string) =>
    setClosedTitles((titles) =>
      titles.includes(title)
        ? titles.filter((closedTitle) => closedTitle !== title)
        : [...titles, title],
    );

  return (
    <>
      <StyledToolbar>
        <StyledCentralSegmented role="group" aria-label="Agrupar por">
          {GROUP_MODES.map((groupMode) => (
            <StyledCentralSegment
              key={groupMode.id}
              type="button"
              active={mode === groupMode.id}
              aria-pressed={mode === groupMode.id}
              onClick={() => {
                setMode(groupMode.id);
                setClosedTitles([]);
              }}
            >
              {groupMode.label}
            </StyledCentralSegment>
          ))}
        </StyledCentralSegmented>
        <StyledCentralSegmented role="group" aria-label="Filtrar">
          {filters.map((costFilter) => (
            <StyledCentralSegment
              key={costFilter.id}
              type="button"
              active={filter === costFilter.id}
              aria-pressed={filter === costFilter.id}
              onClick={() => setFilter(costFilter.id)}
            >
              {costFilter.label}
            </StyledCentralSegment>
          ))}
        </StyledCentralSegmented>
        <StyledSearch>
          <IconSearch size={16} />
          <StyledSearchInput
            aria-label="Buscar custo"
            placeholder="Buscar provedor, serviço ou cliente"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </StyledSearch>
      </StyledToolbar>

      <StyledTable aria-label="Custos agrupados">
        <StyledHeaderRow>
          <span>
            {mode === 'provedor' ? 'Provedor › cliente' : 'Cliente › provedor'}
          </span>
          <StyledHideOnPhone>Quem paga</StyledHideOnPhone>
          <StyledRight>Custo / mês</StyledRight>
        </StyledHeaderRow>

        {groups.map((group) => {
          const isOpen = !closedTitles.includes(group.title);

          return (
            <div key={group.title}>
              <StyledGroupButton
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.title)}
              >
                <StyledGrid>
                  <StyledGroupTitle>
                    <StyledChevron open={isOpen}>
                      <IconChevronRight size={14} />
                    </StyledChevron>
                    <StyledStack>
                      <StyledGroupName>{group.title}</StyledGroupName>
                      <StyledSmall warning={group.missingCount > 0}>
                        {pluralize(group.rows.length, 'item', 'itens')}
                        {group.missingCount > 0 &&
                          ` · ${group.missingCount} a preencher`}
                      </StyledSmall>
                    </StyledStack>
                  </StyledGroupTitle>
                  <StyledHideOnPhone />
                  <StyledRight>
                    {formatCentralCostTotal(group.summary)}
                  </StyledRight>
                </StyledGrid>
              </StyledGroupButton>

              {isOpen &&
                group.rows.map((row) => {
                  const payer = getPayerLabel(row.custo.quemPaga);
                  const itemName =
                    mode === 'provedor' ? row.clientName : row.provider;

                  return (
                    <StyledRow key={row.custo.id}>
                      <StyledStack>
                        <span>{itemName}</span>
                        <StyledEllipsis>
                          {row.custo.servico ?? row.custo.name}
                        </StyledEllipsis>
                      </StyledStack>
                      <StyledHideOnPhone>
                        <StyledPayer empty={!isNonEmptyString(payer)}>
                          {payer ?? '—'}
                        </StyledPayer>
                      </StyledHideOnPhone>
                      <StyledAmountCell>
                        <CentralAmountEditor
                          amount={fromAmountMicros(row.custo.custoMensal)}
                          label={`Custo de ${row.provider}, ${row.clientName}`}
                          onSave={(amount) =>
                            onSaveAmount(row.custo.id, amount)
                          }
                        />
                        {isNonEmptyString(row.custo.observacao) && (
                          <StyledHint>obs.: {row.custo.observacao}</StyledHint>
                        )}
                      </StyledAmountCell>
                    </StyledRow>
                  );
                })}
            </div>
          );
        })}

        {groups.length === 0 && (
          <StyledEmpty>
            {filter === 'preencher' && query.trim() === ''
              ? 'Nada a preencher: todo custo tem valor.'
              : 'Nenhum custo com essa busca.'}
          </StyledEmpty>
        )}

        <StyledTotalRow>
          <StyledCentralDisplayText>Total</StyledCentralDisplayText>
          <StyledHideOnPhone>
            <StyledSmall>
              {missingCount > 0
                ? `${pluralize(missingCount, 'custo', 'custos')} sem valor`
                : 'completo'}
            </StyledSmall>
          </StyledHideOnPhone>
          <StyledRight>{formatCentralCostTotal(totalSummary)}</StyledRight>
        </StyledTotalRow>
      </StyledTable>
    </>
  );
};
