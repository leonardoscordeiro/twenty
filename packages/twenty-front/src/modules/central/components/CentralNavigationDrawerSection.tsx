import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useMatch } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconLayoutDashboard } from 'twenty-ui/icon';

export const CentralNavigationDrawerSection = () => {
  const isCentralOpen = isDefined(useMatch(`${CENTRAL_PATHS.clients}/*`));

  return (
    <NavigationDrawerSection>
      <NavigationDrawerItem
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        label="Central"
        to={CENTRAL_PATHS.clients}
        Icon={IconLayoutDashboard}
        active={isCentralOpen}
      />
    </NavigationDrawerSection>
  );
};
