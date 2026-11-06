import { StyledCentralCard } from '@/central/components/CentralStyled';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTitle = styled.h2`
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const StyledDescription = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
  max-width: 480px;
`;

type CentralEmptyStateProps = {
  title: string;
  description: string;
};

export const CentralEmptyState = ({
  title,
  description,
}: CentralEmptyStateProps) => (
  <StyledCentralCard>
    <StyledTitle>{title}</StyledTitle>
    <StyledDescription>{description}</StyledDescription>
  </StyledCentralCard>
);
