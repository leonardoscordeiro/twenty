// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { centralButtonClassName } from '@/central/components/CentralStyled';
import { CENTRAL_NATIVE_LISTS } from '@/central/constants/CentralNativeLists';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconTable } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

// Same scrolling column as CentralPageLayout.
const StyledBody = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  overflow-y: auto;
  padding: 24px clamp(16px, 4vw, 48px) 48px;

  & > * {
    flex-shrink: 0;
  }
`;

type CentralNativeListLayoutProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

export const CentralNativeListLayout = ({
  title,
  icon,
  children,
}: CentralNativeListLayoutProps) => {
  const theme = useTheme();

  return (
    <>
      <PageTitle title={title} />
      <PageCardLayout
        header={
          <PageCardHeader
            icon={icon}
            title={title}
            actionButton={
              <Link
                className={centralButtonClassName}
                to={`?${CENTRAL_NATIVE_LISTS.tableSearchParam}=1`}
              >
                <IconTable size={theme.icon.size.md} />
                Tabela padrão
              </Link>
            }
          />
        }
      >
        <StyledBody>{children}</StyledBody>
      </PageCardLayout>
    </>
  );
};
