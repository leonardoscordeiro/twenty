// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import {
  formatCentralAmountInput,
  formatCentralCurrency,
  parseCentralAmount,
} from '@/central/utils/centralMoney';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledValueButton = styled.button<{ empty: boolean }>`
  background: ${({ empty }) =>
    empty ? themeCssVariables.tag.background.amber : 'transparent'};
  border: 1px ${({ empty }) => (empty ? 'dashed' : 'solid')}
    ${({ empty }) => (empty ? themeCssVariables.tag.text.amber : 'transparent')};
  border-radius: 10px;
  color: ${({ empty }) =>
    empty ? themeCssVariables.tag.text.amber : 'inherit'};
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  font-weight: 600;
  min-height: 40px;
  min-width: 112px;
  padding: 0 12px;
  text-align: right;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledInputLabel = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 2px solid ${themeCssVariables.font.color.primary};
  border-radius: 10px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-size: 14px;
  gap: 6px;
  min-height: 40px;
  padding: 0 10px;
`;

const StyledInput = styled.input`
  background: transparent;
  border: 0;
  color: inherit;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  outline: 0;
  text-align: right;
  width: 96px;
`;

type CentralAmountEditorProps = {
  amount: number | null;
  label: string;
  onSave: (amount: number | null) => void;
};

export const CentralAmountEditor = ({
  amount,
  label,
  onSave,
}: CentralAmountEditorProps) => {
  const { enqueueToast } = useToast();
  const [draft, setDraft] = useState<string | null>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      setDraft(null);
      return;
    }

    if (event.key !== 'Enter' || !isDefined(draft)) {
      return;
    }

    const parsedAmount = parseCentralAmount(draft);

    if (parsedAmount === undefined) {
      enqueueToast({ status: 'error', children: 'Valor inválido' });
      return;
    }

    setDraft(null);

    if (parsedAmount !== amount) {
      onSave(parsedAmount);
    }
  };

  if (isDefined(draft)) {
    return (
      <StyledInputLabel>
        R$
        <StyledInput
          aria-label={label}
          autoFocus
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setDraft(null)}
        />
      </StyledInputLabel>
    );
  }

  return (
    <StyledValueButton
      type="button"
      empty={!isDefined(amount)}
      aria-label={`${label}: ${isDefined(amount) ? formatCentralCurrency(amount) : 'vazio'}, clique para editar`}
      onClick={() => setDraft(formatCentralAmountInput(amount))}
    >
      {isDefined(amount) ? formatCentralCurrency(amount) : 'preencher'}
    </StyledValueButton>
  );
};
