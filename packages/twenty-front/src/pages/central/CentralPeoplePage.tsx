// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralDirectoryLayout } from '@/central/components/CentralDirectoryLayout';
import {
  centralButtonClassName,
  StyledCentralDisplayText,
  StyledCentralMuted,
  StyledCentralSegment,
  StyledCentralSegmented,
  StyledCentralTitle,
} from '@/central/components/CentralStyled';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import {
  type CentralPersonWithCompany,
  useCentralPeople,
} from '@/central/hooks/useCentralPeople';
import {
  getCentralPersonName,
  getCentralPersonPhone,
  getPrimaryContact,
} from '@/central/utils/centralPeople';
import {
  getCentralClientPath,
  getCentralInitials,
  getCentralPersonPath,
  getNativeRecordPath,
  pluralize,
} from '@/central/utils/centralText';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  IconCopy,
  IconMail,
  IconPlus,
  IconSearch,
  IconUser,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeader = styled.header`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledSearch = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: 10px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1 1 260px;
  gap: 10px;
  min-height: 40px;
  padding: 0 12px;
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  min-width: 0;
  outline: 0;
`;

const StyledGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StyledGroup = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  overflow: hidden;
`;

const StyledGroupHeader = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  min-height: 52px;
  padding: 6px 20px;

  a {
    align-items: center;
    color: ${themeCssVariables.font.color.primary};
    display: flex;
    gap: 10px;
    text-decoration: none;
  }
`;

const StyledPersonRow = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  padding: 12px 20px;

  &:nth-of-type(2) {
    border-top: 0;
  }
`;

const StyledPersonLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1 1 240px;
  gap: 12px;
  min-height: 44px;
  min-width: 0;
  text-decoration: none;
`;

const StyledAvatar = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 50%;
  display: flex;
  flex: none;
  font-weight: 600;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledStack = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledNameRow = styled.span`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledPrimaryBadge = styled.span`
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 999px;
  color: ${themeCssVariables.grayScale.gray1};
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
`;

const StyledFill = styled(Link)`
  color: ${themeCssVariables.tag.text.amber};
  font-size: 13px;
`;

const StyledEmptyRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 14px 20px;
`;

const StyledEmpty = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 36px 28px;
`;

type CentralPeopleFilter = 'todas' | 'principais' | 'semContato';

type CentralPeopleGroup = {
  id: string;
  name: string;
  path: string | null;
  statusCliente?: string | null;
  people: CentralPersonWithCompany[];
};

const PEOPLE_INDEX_PATH = getAppPath(AppPath.RecordIndexPage, {
  objectNamePlural: 'people',
});

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const CentralPeoplePage = () => {
  const { companies, getStatusOption } = useCentralCompanies();
  const { people, loading } = useCentralPeople();
  const { copyToClipboard } = useCopyToClipboard();
  const [filter, setFilter] = useState<CentralPeopleFilter>('todas');
  const [query, setQuery] = useState('');

  const normalizedQuery = normalize(query.trim());
  const matchesQuery = (person: CentralPersonWithCompany) =>
    normalizedQuery === '' ||
    [
      getCentralPersonName(person),
      person.emails?.primaryEmail,
      person.jobTitle,
      person.company?.name,
    ].some(
      (text) =>
        isNonEmptyString(text) && normalize(text).includes(normalizedQuery),
    );

  const companyGroups: CentralPeopleGroup[] = companies.map((company) => ({
    id: company.id,
    name: company.name ?? 'Sem nome',
    path: getCentralClientPath(company.id),
    statusCliente: company.statusCliente,
    people: people.filter((person) => person.companyId === company.id),
  }));
  const peopleWithoutCompany = people.filter(
    (person) => !isDefined(person.companyId),
  );
  const groups =
    peopleWithoutCompany.length > 0
      ? [
          ...companyGroups,
          {
            id: 'sem-empresa',
            name: 'Sem empresa',
            path: null,
            people: peopleWithoutCompany,
          },
        ]
      : companyGroups;
  const companiesWithoutContact = companyGroups.filter(
    (group) => group.people.length === 0,
  ).length;

  const visibleGroups = groups
    .filter((group) =>
      filter === 'semContato'
        ? group.people.length === 0
        : filter === 'principais'
          ? group.people.length > 0
          : true,
    )
    .map((group) => {
      const primaryContact = getPrimaryContact(group.people);
      const groupPeople =
        filter === 'principais' && isDefined(primaryContact)
          ? [primaryContact]
          : group.people;

      return {
        ...group,
        primaryContactId: group.path === null ? null : primaryContact?.id,
        people: groupPeople.filter(matchesQuery),
      };
    })
    .filter(
      (group) =>
        normalizedQuery === '' ||
        group.people.length > 0 ||
        normalize(group.name).includes(normalizedQuery),
    );

  const filters: { id: CentralPeopleFilter; label: string }[] = [
    { id: 'todas', label: `Todas ${people.length}` },
    {
      id: 'principais',
      label: `Contatos principais ${companyGroups.length - companiesWithoutContact}`,
    },
    {
      id: 'semContato',
      label: `Clientes sem contato ${companiesWithoutContact}`,
    },
  ];

  return (
    <CentralDirectoryLayout title="Pessoas">
      <StyledHeader>
        <StyledHeading>
          <StyledCentralTitle>Pessoas</StyledCentralTitle>
          <StyledCentralMuted>
            {pluralize(people.length, 'pessoa', 'pessoas')}
            {companiesWithoutContact > 0 &&
              ` · ${pluralize(companiesWithoutContact, 'cliente', 'clientes')} sem contato principal`}
          </StyledCentralMuted>
        </StyledHeading>
        <StyledToolbar>
          <StyledSearch>
            <IconSearch size={16} />
            <StyledSearchInput
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nome, e-mail, empresa"
              aria-label="Buscar pessoa"
            />
          </StyledSearch>
          <Link
            className={centralButtonClassName}
            data-inverted="true"
            to={PEOPLE_INDEX_PATH}
          >
            <IconPlus size={16} />
            Nova pessoa
          </Link>
        </StyledToolbar>
      </StyledHeader>

      {people.length === 0 && companies.length === 0 ? (
        <StyledEmpty>
          <IconUser size={28} />
          <StyledCentralDisplayText>
            {loading ? 'Carregando…' : 'Ninguém cadastrado'}
          </StyledCentralDisplayText>
          {!loading && (
            <StyledCentralMuted>
              Comece pelo contato principal de cada cliente: quem decide e paga.
            </StyledCentralMuted>
          )}
        </StyledEmpty>
      ) : (
        <>
          <StyledCentralSegmented role="tablist" aria-label="Filtrar pessoas">
            {filters.map((option) => (
              <StyledCentralSegment
                key={option.id}
                type="button"
                role="tab"
                active={filter === option.id}
                aria-selected={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </StyledCentralSegment>
            ))}
          </StyledCentralSegmented>

          {visibleGroups.length === 0 ? (
            <StyledEmpty>
              <StyledCentralDisplayText>
                Ninguém com esse filtro
              </StyledCentralDisplayText>
              <button
                type="button"
                className={centralButtonClassName}
                onClick={() => {
                  setFilter('todas');
                  setQuery('');
                }}
              >
                Limpar busca e filtro
              </button>
            </StyledEmpty>
          ) : (
            <StyledGroups>
              {visibleGroups.map((group) => {
                const statusOption = getStatusOption(
                  group.statusCliente ?? null,
                );

                return (
                  <StyledGroup key={group.id} aria-label={group.name}>
                    <StyledGroupHeader>
                      {isDefined(group.path) ? (
                        <Link to={group.path}>
                          <StyledCentralDisplayText>
                            {group.name}
                          </StyledCentralDisplayText>
                          {isDefined(statusOption) && (
                            <Tag color={statusOption.color}>
                              {statusOption.label}
                            </Tag>
                          )}
                        </Link>
                      ) : (
                        <StyledCentralDisplayText>
                          {group.name}
                        </StyledCentralDisplayText>
                      )}
                      <StyledCentralMuted>
                        {group.people.length > 0
                          ? pluralize(group.people.length, 'pessoa', 'pessoas')
                          : 'sem contato'}
                      </StyledCentralMuted>
                    </StyledGroupHeader>
                    {group.people.map((person) => {
                      const name = getCentralPersonName(person);
                      const email = person.emails?.primaryEmail;
                      const phone = getCentralPersonPhone(person);

                      return (
                        <StyledPersonRow key={person.id}>
                          <StyledPersonLink
                            to={getCentralPersonPath(person.id)}
                          >
                            <StyledAvatar>
                              {getCentralInitials(name)}
                            </StyledAvatar>
                            <StyledStack>
                              <StyledNameRow>
                                <strong>{name || 'Sem nome'}</strong>
                                {group.primaryContactId === person.id && (
                                  <StyledPrimaryBadge>
                                    Principal
                                  </StyledPrimaryBadge>
                                )}
                              </StyledNameRow>
                              <StyledCentralMuted>
                                {person.jobTitle ?? 'cargo: preencher'}
                              </StyledCentralMuted>
                            </StyledStack>
                          </StyledPersonLink>
                          {isNonEmptyString(email) ? (
                            <button
                              type="button"
                              className={centralButtonClassName}
                              aria-label={`Copiar e-mail de ${name}`}
                              onClick={() => copyToClipboard(email, 'Copiado')}
                            >
                              {email}
                              <IconCopy size={14} />
                            </button>
                          ) : (
                            <StyledFill
                              to={getNativeRecordPath('person', person.id)}
                            >
                              e-mail: preencher
                            </StyledFill>
                          )}
                          {isNonEmptyString(phone) ? (
                            <StyledCentralMuted>{phone}</StyledCentralMuted>
                          ) : (
                            <StyledFill
                              to={getNativeRecordPath('person', person.id)}
                            >
                              telefone: preencher
                            </StyledFill>
                          )}
                          {isNonEmptyString(email) && (
                            <a
                              className={centralButtonClassName}
                              data-inverted="true"
                              href={`mailto:${email}`}
                              aria-label={`Escrever para ${name}`}
                            >
                              <IconMail size={16} />
                            </a>
                          )}
                        </StyledPersonRow>
                      );
                    })}
                    {group.people.length === 0 && (
                      <StyledEmptyRow>
                        <StyledCentralMuted>
                          Ninguém ligado a este cliente.
                        </StyledCentralMuted>
                        <Link
                          className={centralButtonClassName}
                          to={PEOPLE_INDEX_PATH}
                        >
                          <IconPlus size={16} />
                          Adicionar contato principal
                        </Link>
                      </StyledEmptyRow>
                    )}
                  </StyledGroup>
                );
              })}
            </StyledGroups>
          )}
        </>
      )}
    </CentralDirectoryLayout>
  );
};
