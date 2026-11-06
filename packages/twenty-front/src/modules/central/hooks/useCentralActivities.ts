import { type CentralActivity } from '@/central/types/CentralActivity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useObjectMorphJunctionConfigOrThrow } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfigOrThrow';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type RecordGqlFields,
  StandardObjectNameSingular,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type CentralActivityObjectName =
  | StandardObjectNameSingular.Task
  | StandardObjectNameSingular.Note;

const SCALAR_GQL_FIELDS_BY_OBJECT: Record<
  CentralActivityObjectName,
  RecordGqlFields
> = {
  [StandardObjectNameSingular.Task]: {
    id: true,
    title: true,
    dueAt: true,
    status: true,
    updatedAt: true,
  },
  [StandardObjectNameSingular.Note]: {
    id: true,
    title: true,
    bodyV2: true,
    updatedAt: true,
  },
};

export const useCentralActivities = (
  objectNameSingular: CentralActivityObjectName,
) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem: companyMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Company,
  });
  const { junctionObjectMetadata, junctionField, targetFields } =
    useObjectMorphJunctionConfigOrThrow({ objectNameSingular });

  const companyTargetField = findTargetFieldInfo(
    targetFields,
    companyMetadataItem.id,
    objectMetadataItems,
  );

  const { records, loading, refetch } = useFindManyRecords<ObjectRecord>({
    objectNameSingular,
    recordGqlFields: {
      ...SCALAR_GQL_FIELDS_BY_OBJECT[objectNameSingular],
      [junctionField.name]: {
        id: true,
        ...(isDefined(companyTargetField) && {
          [companyTargetField.fieldName]: { id: true, name: true },
        }),
      },
    },
    orderBy: [{ updatedAt: 'DescNullsLast' }],
    limit: 200,
  });

  const { records: companies } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: StandardObjectNameSingular.Company,
    recordGqlFields: { id: true, name: true },
    orderBy: [{ name: 'AscNullsLast' }],
  });

  const activities: CentralActivity[] = records.map((record) => {
    const targets: ObjectRecord[] = Array.isArray(record[junctionField.name])
      ? record[junctionField.name]
      : [];
    const company = isDefined(companyTargetField)
      ? targets
          .map((target) => target[companyTargetField.fieldName])
          .find(isDefined)
      : undefined;

    return {
      id: record.id,
      title: record.title ?? null,
      dueAt: record.dueAt ?? null,
      status: record.status ?? null,
      bodyMarkdown: record.bodyV2?.markdown ?? null,
      companyId: company?.id ?? null,
      companyName: company?.name ?? null,
    };
  });

  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord: createActivity } = useCreateOneRecord({
    objectNameSingular,
  });
  const { createOneRecord: createTarget } = useCreateOneRecord({
    objectNameSingular: junctionObjectMetadata.nameSingular,
  });

  const updateActivity = (id: string, input: Record<string, unknown>) =>
    updateOneRecord({
      objectNameSingular,
      idToUpdate: id,
      updateOneRecordInput: input,
    });

  const createActivityForCompany = async (
    input: Record<string, unknown>,
    companyId: string | null,
  ) => {
    const created = await createActivity(input);

    if (isDefined(companyId) && isDefined(companyTargetField?.joinColumnName)) {
      await createTarget({
        [`${objectNameSingular}Id`]: created.id,
        [companyTargetField.joinColumnName]: companyId,
      });
      await refetch();
    }

    return created;
  };

  return {
    activities,
    companies: companies.map((company) => ({
      id: company.id,
      name: (company.name as string | null) ?? null,
    })),
    loading,
    updateActivity,
    createActivityForCompany,
  };
};
