import {
  type CentralRelationTarget,
  toCentralCompanies,
} from '@/central/utils/toCentralCompanies';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type RecordGqlFields, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const COMPANY_SCALAR_GQL_FIELDS: RecordGqlFields = {
  id: true,
  name: true,
  domainName: true,
  statusCliente: true,
  produto: true,
  mensalidade: true,
  inicioContrato: true,
  cnpj: true,
  repositorio: true,
  stack: true,
  address: true,
};

// Keyed by target object: the generated query silently drops field names
// missing from metadata, so relation names are resolved at runtime.
const RELATION_GQL_FIELDS_BY_TARGET = {
  person: { id: true, name: true, jobTitle: true, emails: true },
  custoInfra: {
    id: true,
    name: true,
    provedor: true,
    servico: true,
    custoMensal: true,
    quemPaga: true,
    renovacao: true,
    observacao: true,
  },
  acesso: {
    id: true,
    name: true,
    tipo: true,
    url: true,
    login: true,
    ondeEstaASenha: true,
    quemTemAcesso: true,
    revisadoEm: true,
  },
  noteTarget: { id: true, note: { id: true, title: true, bodyV2: true } },
} satisfies Record<string, RecordGqlFields>;

const RELATION_TARGETS = Object.keys(
  RELATION_GQL_FIELDS_BY_TARGET,
) as CentralRelationTarget[];

const getOneToManyFieldName = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  target: CentralRelationTarget,
) =>
  objectMetadataItem.fields.find(
    (field) =>
      field.isActive &&
      field.relation?.type === RelationType.ONE_TO_MANY &&
      field.relation.targetObjectMetadata.nameSingular === target,
  )?.name;

const getSelectOption = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  fieldName: string,
  value: string | null,
) =>
  objectMetadataItem.fields
    .find((field) => field.name === fieldName)
    ?.options?.find((option) => option.value === value);

export const useCentralCompanies = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'company',
  });

  const relationFieldNames = RELATION_TARGETS.map((target) => ({
    target,
    fieldName: getOneToManyFieldName(objectMetadataItem, target),
  }));

  const recordGqlFields: RecordGqlFields = {
    ...COMPANY_SCALAR_GQL_FIELDS,
    ...Object.fromEntries(
      relationFieldNames
        .filter(({ fieldName }) => isDefined(fieldName))
        .map(({ target, fieldName }) => [
          fieldName,
          RELATION_GQL_FIELDS_BY_TARGET[target],
        ]),
    ),
  };

  const { records, loading } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: 'company',
    recordGqlFields,
    orderBy: [{ name: 'AscNullsLast' }],
  });

  const companies = toCentralCompanies(records, relationFieldNames);

  const { objectMetadataItem: custoInfraMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'custoInfra',
  });

  const statusOptions =
    objectMetadataItem.fields.find((field) => field.name === 'statusCliente')
      ?.options ?? [];

  const getStatusOption = (value: string | null) =>
    getSelectOption(objectMetadataItem, 'statusCliente', value);

  const getCustoInfraLabel = (
    fieldName: 'provedor' | 'quemPaga',
    value: string | null,
  ) =>
    getSelectOption(custoInfraMetadataItem, fieldName, value)?.label ?? value;

  return {
    companies,
    loading,
    statusOptions,
    getStatusOption,
    getCustoInfraLabel,
  };
};
