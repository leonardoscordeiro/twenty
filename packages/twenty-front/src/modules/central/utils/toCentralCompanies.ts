import { type CentralCompany } from '@/central/types/CentralCompany';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const CENTRAL_COMPANY_KEY_BY_RELATION_TARGET = {
  person: 'people',
  custoInfra: 'custosInfra',
  acesso: 'acessos',
  noteTarget: 'noteTargets',
} as const satisfies Record<string, keyof CentralCompany>;

export type CentralRelationTarget =
  keyof typeof CENTRAL_COMPANY_KEY_BY_RELATION_TARGET;

export type CentralRelationFieldName = {
  target: CentralRelationTarget;
  fieldName: string | undefined;
};

export const toCentralCompanies = (
  records: ObjectRecord[],
  relationFieldNames: CentralRelationFieldName[],
) =>
  records.map((record) => ({
    ...record,
    ...Object.fromEntries(
      relationFieldNames.map(({ target, fieldName }) => {
        const value = isDefined(fieldName) ? record[fieldName] : undefined;

        return [
          CENTRAL_COMPANY_KEY_BY_RELATION_TARGET[target],
          Array.isArray(value) ? value.filter(isDefined) : [],
        ];
      }),
    ),
  })) as CentralCompany[];
