import { type CentralPerson } from '@/central/types/CentralCompany';
import { isNonEmptyString } from '@sniptt/guards';

export const CENTRAL_PRIMARY_CONTACT_ROLE = 'PRINCIPAL';

// Without a papel marked PRINCIPAL, the first person linked stays the contact, as before.
export const getPrimaryContact = <TPerson extends { papel?: string | null }>(
  people: TPerson[],
) =>
  people.find((person) => person.papel === CENTRAL_PRIMARY_CONTACT_ROLE) ??
  people.at(0);

export const getCentralPersonName = (person: Pick<CentralPerson, 'name'>) =>
  [person.name?.firstName, person.name?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

export const getCentralPersonPhone = (person: Pick<CentralPerson, 'phones'>) =>
  isNonEmptyString(person.phones?.primaryPhoneNumber)
    ? `${person.phones.primaryPhoneCallingCode ?? ''} ${person.phones.primaryPhoneNumber}`.trim()
    : null;

export const getWhatsAppUrl = (phone: string | null) => {
  const digits = (phone ?? '').replace(/\D/g, '');

  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
};
