import { type CentralOpportunity } from '@/central/utils/centralOpportunities';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const OPPORTUNITY_GQL_FIELDS: RecordGqlFields = {
  id: true,
  name: true,
  stage: true,
  amount: true,
  closeDate: true,
  updatedAt: true,
  position: true,
  company: { id: true, name: true },
  taskTargets: {
    id: true,
    task: { id: true, title: true, dueAt: true, status: true },
  },
};

export const useCentralOpportunities = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'opportunity',
  });

  const { records, loading } = useFindManyRecords<CentralOpportunity>({
    objectNameSingular: 'opportunity',
    recordGqlFields: OPPORTUNITY_GQL_FIELDS,
    orderBy: [{ position: 'AscNullsLast' }],
  });

  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'opportunity',
  });

  const stageOptions = [
    ...(objectMetadataItem.fields.find((field) => field.name === 'stage')
      ?.options ?? []),
  ].sort((first, second) => first.position - second.position);

  const opportunities = records.map((record) => ({
    ...record,
    taskTargets: (record.taskTargets ?? []).filter(isDefined),
  }));

  const moveToStage = (opportunityId: string, stage: string) =>
    updateOneRecord({
      objectNameSingular: 'opportunity',
      idToUpdate: opportunityId,
      updateOneRecordInput: { stage },
    });

  const createOpportunity = (name: string) =>
    createOneRecord({ name, stage: stageOptions[0]?.value });

  return {
    opportunities,
    loading,
    stageOptions,
    moveToStage,
    createOpportunity,
  };
};
