// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme';

const DISPLAY_FONT = `'Space Grotesk', ${themeCssVariables.font.family}`;

export const StyledCentralTitle = styled.h1`
  font-family: ${DISPLAY_FONT};
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
`;

export const StyledCentralSectionTitle = styled.h2`
  font-family: ${DISPLAY_FONT};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

export const StyledCentralMuted = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 13px;
`;

export const StyledCentralWarning = styled.span`
  color: ${themeCssVariables.tag.text.amber};
  font-size: 12px;
`;

export const StyledCentralFillLink = styled(Link)`
  color: ${themeCssVariables.tag.text.amber};
  font-size: 13px;
  text-decoration: underline;
`;

export const StyledCentralKpiGrid = styled.section`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

export const StyledCentralKpi = styled.div<{ inverted?: boolean }>`
  background: ${({ inverted }) =>
    inverted
      ? themeCssVariables.grayScale.gray12
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ inverted }) =>
      inverted
        ? themeCssVariables.grayScale.gray12
        : themeCssVariables.border.color.medium};
  border-radius: 14px;
  color: ${({ inverted }) =>
    inverted
      ? themeCssVariables.grayScale.gray1
      : themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
`;

export const StyledCentralKpiLabel = styled.span`
  font-size: 13px;
  opacity: 0.75;
`;

export const StyledCentralKpiValue = styled.span`
  font-family: ${DISPLAY_FONT};
  font-size: 26px;
  font-weight: 600;
`;

export const StyledCentralKpiHint = styled.span<{ warning?: boolean }>`
  color: ${({ warning }) =>
    warning ? themeCssVariables.tag.text.amber : 'inherit'};
  font-size: 12px;
  opacity: ${({ warning }) => (warning ? 1 : 0.75)};
`;

export const StyledCentralCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  padding: 20px;
`;

export const StyledCentralSegmented = styled.div`
  align-self: flex-start;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
`;

export const StyledCentralSegment = styled.button<{ active: boolean }>`
  background: ${({ active }) =>
    active ? themeCssVariables.background.primary : 'transparent'};
  border: 0;
  border-radius: 9px;
  box-shadow: ${({ active }) =>
    active ? themeCssVariables.boxShadow.light : 'none'};
  color: ${({ active }) =>
    active
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  min-height: 40px;
  padding: 0 16px;
`;

// Shared by router links and external anchors; data-inverted avoids leaking props into Link.
export const centralButtonClassName = css`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 10px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  text-decoration: none;
  white-space: nowrap;

  &[data-inverted='true'] {
    background: ${themeCssVariables.grayScale.gray12};
    border-color: ${themeCssVariables.grayScale.gray12};
    color: ${themeCssVariables.grayScale.gray1};
  }
`;

export const StyledCentralDisplayText = styled.span`
  font-family: ${DISPLAY_FONT};
  font-weight: 600;
`;
