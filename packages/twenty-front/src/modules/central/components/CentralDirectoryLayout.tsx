// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CENTRAL_DIRECTORY_PATHS } from '@/central/constants/CentralDirectoryPaths';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconBuildingSkyscraper, IconUser } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

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
`;

const StyledNav = styled.nav`
  display: flex;
  gap: 4px;
`;

const StyledNavLink = styled(Link)`
  border-radius: 8px;
  color: ${themeCssVariables.font.color.secondary};
  font-size: 13px;
  font-weight: 500;
  padding: 6px 10px;
  text-decoration: none;

  &[aria-current='page'] {
    background: ${themeCssVariables.grayScale.gray12};
    color: ${themeCssVariables.grayScale.gray1};
  }
`;

type CentralDirectoryLayoutProps = {
  title: string;
  children: ReactNode;
};

export const CentralDirectoryLayout = ({
  title,
  children,
}: CentralDirectoryLayoutProps) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const isPeople = pathname.startsWith(CENTRAL_DIRECTORY_PATHS.people);
  const Icon = isPeople ? IconUser : IconBuildingSkyscraper;

  return (
    <>
      <PageTitle title={title} />
      <PageCardLayout
        header={
          <PageCardHeader
            icon={<Icon size={theme.icon.size.md} />}
            title={isPeople ? 'Pessoas' : 'Empresas'}
            actionButton={
              <StyledNav aria-label="Empresas e pessoas">
                <StyledNavLink
                  to={CENTRAL_DIRECTORY_PATHS.companies}
                  aria-current={isPeople ? undefined : 'page'}
                >
                  Empresas
                </StyledNavLink>
                <StyledNavLink
                  to={CENTRAL_DIRECTORY_PATHS.people}
                  aria-current={isPeople ? 'page' : undefined}
                >
                  Pessoas
                </StyledNavLink>
              </StyledNav>
            }
          />
        }
      >
        <StyledBody>{children}</StyledBody>
      </PageCardLayout>
    </>
  );
};
