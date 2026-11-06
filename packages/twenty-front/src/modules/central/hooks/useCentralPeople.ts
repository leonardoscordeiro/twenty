import { useCentralPersonRoleField } from '@/central/hooks/useCentralPersonRoleField';
import { type CentralPerson } from '@/central/types/CentralCompany';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type CentralPersonWithCompany = CentralPerson & {
  companyId: string | null;
  company: { id: string; name: string | null } | null;
};

const PERSON_GQL_FIELDS: RecordGqlFields = {
  id: true,
  name: true,
  jobTitle: true,
  emails: true,
  phones: true,
  companyId: true,
  company: { id: true, name: true },
};

export const useCentralPeople = () => {
  const { roleField } = useCentralPersonRoleField();

  const { records, loading } = useFindManyRecords<CentralPersonWithCompany>({
    objectNameSingular: 'person',
    recordGqlFields: isDefined(roleField)
      ? { ...PERSON_GQL_FIELDS, papel: true }
      : PERSON_GQL_FIELDS,
    orderBy: [{ name: { firstName: 'AscNullsLast' } }],
  });

  return { people: records, loading };
};
