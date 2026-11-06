import { CENTRAL_DIRECTORY_PATHS } from '@/central/constants/CentralDirectoryPaths';
import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import { PAINEIS_PATH } from '@/paineis/constants/PaineisPaths';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useMatch } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBuildingSkyscraper,
  IconLayoutDashboard,
  IconUser,
} from 'twenty-ui/icon';

export const CentralNavigationDrawerSection = () => {
  const isPaineisOpen = isDefined(useMatch(PAINEIS_PATH));
  const isCentralOpen = isDefined(useMatch(`${CENTRAL_PATHS.clients}/*`));
  const isCompaniesOpen = isDefined(
    useMatch(CENTRAL_DIRECTORY_PATHS.companies),
  );
  const isPeopleOpen = isDefined(
    useMatch(`${CENTRAL_DIRECTORY_PATHS.people}/*`),
  );

  return (
    <NavigationDrawerSection>
      <NavigationDrawerItem
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        label="Central"
        to={CENTRAL_PATHS.clients}
        Icon={IconLayoutDashboard}
        active={isCentralOpen}
      />
      <NavigationDrawerItem
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        label="Empresas"
        to={CENTRAL_DIRECTORY_PATHS.companies}
        Icon={IconBuildingSkyscraper}
        active={isCompaniesOpen}
      />
      <NavigationDrawerItem
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        label="Pessoas"
        to={CENTRAL_DIRECTORY_PATHS.people}
        Icon={IconUser}
        active={isPeopleOpen}
      />
      <NavigationDrawerItem
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        label="Painéis"
        to={PAINEIS_PATH}
        Icon={IconLayoutDashboard}
        active={isPaineisOpen}
      />
    </NavigationDrawerSection>
  );
};
