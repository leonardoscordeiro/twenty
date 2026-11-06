import {
  type CentralWorkflowRun,
  getCentralWorkflowState,
  groupCentralRunsByWorkflow,
} from '@/central/utils/centralWorkflows';
import { CREATE_CORE_WORKFLOW } from '@/object-core/workflows/graphql/mutations/createCoreWorkflow';
import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { skipToken, useMutation, useQuery } from '@apollo/client/react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateCoreWorkflowMutation,
  type CreateCoreWorkflowMutationVariables,
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  GetCoreWorkflowsDocument,
  GetCoreWorkflowsWithCurrentVersionsDocument,
} from '~/generated/graphql';

const RUN_GQL_FIELDS: RecordGqlFields = {
  id: true,
  name: true,
  status: true,
  createdAt: true,
  startedAt: true,
  endedAt: true,
  coreWorkflowId: true,
};

const RUNS_LIMIT = 100;

export const useCentralWorkflows = () => {
  const canManageWorkflows = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery(
    GetCoreWorkflowsDocument,
    canManageWorkflows
      ? {
          client: apolloCoreClient,
          variables: {
            first: 200,
            orderBy: CoreWorkflowOrderByField.UPDATED_AT,
            orderByDirection: CoreWorkflowOrderByDirection.DESC,
          },
        }
      : skipToken,
  );

  const workflowNodes = (data?.coreWorkflows.edges ?? [])
    .map((edge) => edge.node)
    .filter((node) => !node.isSystem);
  const workflowIds = workflowNodes.map((node) => node.id);

  const { data: versionsData } = useQuery(
    GetCoreWorkflowsWithCurrentVersionsDocument,
    workflowIds.length === 0
      ? skipToken
      : {
          client: apolloCoreClient,
          variables: { input: { coreWorkflowIds: workflowIds } },
        },
  );

  const publishedVersionIdByWorkflowId = new Map<string, string>(
    (versionsData?.coreWorkflowsWithCurrentVersions ?? []).flatMap(
      ({ workflow }) =>
        isDefined(workflow.lastPublishedCoreWorkflowVersionId)
          ? [[workflow.id, workflow.lastPublishedCoreWorkflowVersionId]]
          : [],
    ),
  );

  const { records: runs, loading: runsLoading } = useFindManyRecords<
    CentralWorkflowRun & { __typename: string }
  >({
    objectNameSingular: 'workflowRun',
    recordGqlFields: RUN_GQL_FIELDS,
    orderBy: [{ createdAt: 'DescNullsLast' }],
    limit: RUNS_LIMIT,
    skip: !canManageWorkflows || workflowIds.length === 0,
  });

  const runsByWorkflowId = groupCentralRunsByWorkflow(runs);

  const workflows = workflowNodes.map((node) => ({
    id: node.id,
    name: node.name,
    state: getCentralWorkflowState(node.statuses),
    publishedVersionId: publishedVersionIdByWorkflowId.get(node.id),
    runs: runsByWorkflowId.get(node.id) ?? [],
  }));

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();

  const setWorkflowEnabled = async (
    publishedVersionId: string,
    enabled: boolean,
  ) => {
    if (enabled) {
      await activateWorkflowVersion({ workflowVersionId: publishedVersionId });
    } else {
      await deactivateWorkflowVersion({
        workflowVersionId: publishedVersionId,
      });
    }

    await invalidateCoreWorkflowQueries(apolloCoreClient);
  };

  const [createCoreWorkflowMutation] = useMutation<
    CreateCoreWorkflowMutation,
    CreateCoreWorkflowMutationVariables
  >(CREATE_CORE_WORKFLOW, { client: apolloCoreClient });

  const createWorkflow = async (name?: string) => {
    const { data: created } = await createCoreWorkflowMutation({
      variables: { input: { name } },
    });

    await invalidateCoreWorkflowQueries(apolloCoreClient);

    return created?.createCoreWorkflow.id as string | undefined;
  };

  return {
    canManageWorkflows,
    workflows,
    loading: loading || runsLoading,
    setWorkflowEnabled,
    createWorkflow,
  };
};
