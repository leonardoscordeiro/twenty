import { lazy } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { LazyRoute } from '@/app/components/LazyRoute';
import { CENTRAL_AUTOMATION_PATHS } from '@/central/constants/CentralAutomationPaths';
import { CENTRAL_DIRECTORY_PATHS } from '@/central/constants/CentralDirectoryPaths';
import { CENTRAL_PATHS } from '@/central/constants/CentralPaths';
import { PAINEIS_PATH } from '@/paineis/constants/PaineisPaths';
import { NavigatePreservingSearchAndHash } from '@/app/routing/components/NavigatePreservingSearchAndHash';
import {
  createSettingsRouteObjects,
  SettingsRouteOutlet,
} from '@/app/components/SettingsRoutes';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { StandardObjectNamePlural } from '@/object-metadata/types/StandardObjectNamePlural';
import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';

const GettingStartedPage = lazy(() =>
  import('~/pages/getting-started/GettingStartedPage').then((module) => ({
    default: module.GettingStartedPage,
  })),
);

const AgentCoreIndexPage = lazy(() =>
  import('~/pages/object-core/AgentCoreIndexPage').then((module) => ({
    default: module.AgentCoreIndexPage,
  })),
);

const AgentCoreShowPage = lazy(() =>
  import('~/pages/object-core/AgentCoreShowPage').then((module) => ({
    default: module.AgentCoreShowPage,
  })),
);

const WorkflowCoreIndexPage = lazy(() =>
  import('~/pages/object-core/WorkflowCoreIndexPage').then((module) => ({
    default: module.WorkflowCoreIndexPage,
  })),
);

const WorkflowCoreShowPage = lazy(() =>
  import('~/pages/object-core/WorkflowCoreShowPage').then((module) => ({
    default: module.WorkflowCoreShowPage,
  })),
);

const RecordIndexPage = lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);

const RecordShowPage = lazy(() =>
  import('~/pages/object-record/RecordShowPage').then((module) => ({
    default: module.RecordShowPage,
  })),
);

const StandalonePageLayoutPage = lazy(() =>
  import('~/pages/page-layout/StandalonePageLayoutPage').then((module) => ({
    default: module.StandalonePageLayoutPage,
  })),
);

const AiChatPage = lazy(() =>
  import('~/pages/ai-chat/AiChatPage').then((module) => ({
    default: module.AiChatPage,
  })),
);

const AiChatInboxPage = lazy(() =>
  import('~/pages/ai-chat/AiChatInboxPage').then((module) => ({
    default: module.AiChatInboxPage,
  })),
);

const MobileHomePage = lazy(() =>
  import('~/pages/mobile-home/MobileHomePage').then((module) => ({
    default: module.MobileHomePage,
  })),
);

const CentralClientsPage = lazy(() =>
  import('~/pages/central/CentralClientsPage').then((module) => ({
    default: module.CentralClientsPage,
  })),
);

const CentralClientPage = lazy(() =>
  import('~/pages/central/CentralClientPage').then((module) => ({
    default: module.CentralClientPage,
  })),
);

const CentralTasksPage = lazy(() =>
  import('~/pages/central/CentralTasksPage').then((module) => ({
    default: module.CentralTasksPage,
  })),
);

const CentralNotesPage = lazy(() =>
  import('~/pages/central/CentralNotesPage').then((module) => ({
    default: module.CentralNotesPage,
  })),
);

const CentralInfraPage = lazy(() =>
  import('~/pages/central/CentralInfraPage').then((module) => ({
    default: module.CentralInfraPage,
  })),
);

const PaineisPage = lazy(() =>
  import('~/pages/paineis/PaineisPage').then((module) => ({
    default: module.PaineisPage,
  })),
);

const CentralOpportunitiesPage = lazy(() =>
  import('~/pages/central/CentralOpportunitiesPage').then((module) => ({
    default: module.CentralOpportunitiesPage,
  })),
);

const CentralCompaniesPage = lazy(() =>
  import('~/pages/central/CentralCompaniesPage').then((module) => ({
    default: module.CentralCompaniesPage,
  })),
);

const CentralPeoplePage = lazy(() =>
  import('~/pages/central/CentralPeoplePage').then((module) => ({
    default: module.CentralPeoplePage,
  })),
);

const CentralPersonPage = lazy(() =>
  import('~/pages/central/CentralPersonPage').then((module) => ({
    default: module.CentralPersonPage,
  })),
);

const CentralWorkflowsPage = lazy(() =>
  import('~/pages/central/CentralWorkflowsPage').then((module) => ({
    default: module.CentralWorkflowsPage,
  })),
);

const CentralCampaignsPage = lazy(() =>
  import('~/pages/central/CentralCampaignsPage').then((module) => ({
    default: module.CentralCampaignsPage,
  })),
);

const NotFound = lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);

type CreateWorkspaceRouteObjectsArgs = {
  isAdminPageEnabled?: boolean;
};

const MAIN_AND_SIDE_PANEL = ['main', 'side-panel'] as const;
const SETTINGS_ROOT_PATH = AppPath.SettingsCatchAll.replace('/*', '');

export const createWorkspaceRouteObjects = ({
  isAdminPageEnabled,
}: CreateWorkspaceRouteObjectsArgs): WorkspaceRouteObject[] => {
  const settingsRouteObjects = createSettingsRouteObjects({
    isAdminPageEnabled,
  });

  return [
    {
      path: AppPath.GettingStarted,
      element: (
        <LazyRoute>
          <GettingStartedPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.WorkflowIndexPage,
      element: (
        <LazyRoute fallback={<RecordIndexSkeletonLoader />}>
          <WorkflowCoreIndexPage />
        </LazyRoute>
      ),
      handle: {
        workspaceSurfaces: MAIN_AND_SIDE_PANEL,
        isLocationExpandableFromSidePanel: true,
      },
    },
    {
      path: getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: StandardObjectNamePlural.Workflow,
      }),
      element: (
        <NavigatePreservingSearchAndHash
          to={getAppPath(AppPath.WorkflowIndexPage)}
        />
      ),
      handle: { workspaceSurfaces: MAIN_AND_SIDE_PANEL },
    },
    {
      path: AppPath.WorkflowCoreShowPage,
      element: (
        <LazyRoute>
          <WorkflowCoreShowPage />
        </LazyRoute>
      ),
      handle: {
        workspaceSurfaces: MAIN_AND_SIDE_PANEL,
        isLocationExpandableFromSidePanel: true,
      },
    },
    {
      path: AppPath.AgentIndexPage,
      element: (
        <LazyRoute fallback={<RecordIndexSkeletonLoader />}>
          <AgentCoreIndexPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.AgentShowPage,
      element: (
        <LazyRoute>
          <AgentCoreShowPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.Index,
      element: <RecordIndexSkeletonLoader />,
    },
    {
      path: AppPath.RecordIndexPage,
      element: (
        <LazyRoute fallback={<RecordIndexSkeletonLoader />}>
          <RecordIndexPage />
        </LazyRoute>
      ),
      handle: {
        workspaceSurfaces: MAIN_AND_SIDE_PANEL,
        isLocationExpandableFromSidePanel: true,
      },
    },
    {
      path: AppPath.RecordShowPage,
      element: (
        <LazyRoute>
          <RecordShowPage />
        </LazyRoute>
      ),
      handle: { workspaceSurfaces: MAIN_AND_SIDE_PANEL },
    },
    {
      path: AppPath.PageLayoutPage,
      element: (
        <LazyRoute>
          <StandalonePageLayoutPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.AiChat,
      element: (
        <LazyRoute>
          <AiChatPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.AiChatInbox,
      element: (
        <LazyRoute>
          <AiChatInboxPage />
        </LazyRoute>
      ),
    },
    {
      path: AppPath.Home,
      element: (
        <LazyRoute>
          <MobileHomePage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_PATHS.clients,
      element: (
        <LazyRoute>
          <CentralClientsPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_PATHS.infra,
      element: (
        <LazyRoute>
          <CentralInfraPage />
        </LazyRoute>
      ),
    },
    {
      path: `${CENTRAL_PATHS.opportunities}/*`,
      element: (
        <LazyRoute>
          <CentralOpportunitiesPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_PATHS.tasks,
      element: (
        <LazyRoute>
          <CentralTasksPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_AUTOMATION_PATHS.workflows,
      element: (
        <LazyRoute>
          <CentralWorkflowsPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_PATHS.notes,
      element: (
        <LazyRoute>
          <CentralNotesPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_AUTOMATION_PATHS.campaigns,
      element: (
        <LazyRoute>
          <CentralCampaignsPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_PATHS.client,
      element: (
        <LazyRoute>
          <CentralClientPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_DIRECTORY_PATHS.companies,
      element: (
        <LazyRoute>
          <CentralCompaniesPage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_DIRECTORY_PATHS.people,
      element: (
        <LazyRoute>
          <CentralPeoplePage />
        </LazyRoute>
      ),
    },
    {
      path: CENTRAL_DIRECTORY_PATHS.person,
      element: (
        <LazyRoute>
          <CentralPersonPage />
        </LazyRoute>
      ),
    },
    {
      path: PAINEIS_PATH,
      element: (
        <LazyRoute>
          <PaineisPage />
        </LazyRoute>
      ),
    },
    {
      path: SETTINGS_ROOT_PATH,
      element: <SettingsRouteOutlet />,
      children: settingsRouteObjects,
    },
    {
      path: AppPath.Dpa,
      element: null,
    },
    {
      path: AppPath.NotFoundWildcard,
      element: (
        <LazyRoute>
          <NotFound />
        </LazyRoute>
      ),
    },
  ];
};
