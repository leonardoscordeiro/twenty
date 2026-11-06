import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTrack = styled.button`
  background: ${themeCssVariables.border.color.strong};
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  flex: none;
  height: 30px;
  padding: 0;
  position: relative;
  width: 52px;

  &[aria-checked='true'] {
    background: ${themeCssVariables.grayScale.gray12};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledKnob = styled.span`
  background: ${themeCssVariables.grayScale.gray1};
  border-radius: 50%;
  box-shadow: ${themeCssVariables.boxShadow.light};
  height: 24px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: left 0.15s ease;
  width: 24px;

  [aria-checked='true'] > & {
    left: 25px;
  }
`;

type CentralSwitchProps = {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export const CentralSwitch = ({
  checked,
  label,
  disabled,
  onChange,
}: CentralSwitchProps) => (
  <StyledTrack
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
  >
    <StyledKnob />
  </StyledTrack>
);
