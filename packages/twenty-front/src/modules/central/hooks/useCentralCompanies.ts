import { type CentralCompany } from '@/central/types/CentralCompany';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlFields } from 'twenty-shared/types';

const CENTRAL_COMPANY_GQL_FIELDS: RecordGqlFields = {
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
  people: { id: true, name: true, jobTitle: true, emails: true },
  custosInfra: {
    id: true,
    name: true,
    provedor: true,
    servico: true,
    custoMensal: true,
    quemPaga: true,
    renovacao: true,
    observacao: true,
  },
  acessos: {
    id: true,
    name: true,
    tipo: true,
    url: true,
    login: true,
    ondeEstaASenha: true,
    quemTemAcesso: true,
    revisadoEm: true,
  },
  noteTargets: {
    id: true,
    note: { id: true, title: true, bodyV2: true },
  },
};

const getSelectOption = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  fieldName: string,
  value: string | null,
) =>
  objectMetadataItem.fields
    .find((field) => field.name === fieldName)
    ?.options?.find((option) => option.value === value);

export const useCentralCompanies = () => {
  const { records, loading, objectMetadataItem } =
    useFindManyRecords<CentralCompany>({
      objectNameSingular: 'company',
      recordGqlFields: CENTRAL_COMPANY_GQL_FIELDS,
      orderBy: [{ name: 'AscNullsLast' }],
    });

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
    companies: records,
    loading,
    statusOptions,
    getStatusOption,
    getCustoInfraLabel,
  };
};
