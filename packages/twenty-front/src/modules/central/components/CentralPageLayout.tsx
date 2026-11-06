// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconLayoutDashboard } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

// Scrolling column: children with overflow hidden would otherwise shrink to nothing.
const StyledBody = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
  overflow-y: auto;
  padding: 24px clamp(16px, 4vw, 48px) 48px;

  & > * {
    flex-shrink: 0;
  }
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

type CentralPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export const CentralPageLayout = ({
  title,
  children,
}: CentralPageLayoutProps) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const navItems = [
    { to: CENTRAL_PATHS.clients, label: 'Clientes' },
    { to: CENTRAL_PATHS.opportunities, label: 'Oportunidades' },
    { to: CENTRAL_PATHS.tasks, label: 'Tarefas' },
    { to: CENTRAL_PATHS.notes, label: 'Notas' },
    { to: CENTRAL_PATHS.infra, label: 'Infra e custos' },
  ];
  const activeTo =
    navItems.find(
      (item) =>
        item.to !== CENTRAL_PATHS.clients && pathname.startsWith(item.to),
    )?.to ?? CENTRAL_PATHS.clients;

  return (
    <>
      <PageTitle title={title} />
      <PageCardLayout
        header={
          <PageCardHeader
            icon={<IconLayoutDashboard size={theme.icon.size.md} />}
            title="Central"
            actionButton={
              <StyledNav aria-label="Central">
                {navItems.map((item) => (
                  <StyledNavLink
                    key={item.to}
                    to={item.to}
                    aria-current={item.to === activeTo ? 'page' : undefined}
                  >
                    {item.label}
                  </StyledNavLink>
                ))}
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
