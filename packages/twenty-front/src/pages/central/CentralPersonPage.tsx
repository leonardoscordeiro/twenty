// Central is a pt-BR screen for a single-user fork; its copy is not in the Lingui catalogs.
// oxlint-disable lingui/no-unlocalized-strings
import { CentralDirectoryLayout } from '@/central/components/CentralDirectoryLayout';
import {
  centralButtonClassName,
  StyledCentralCard,
  StyledCentralDisplayText,
  StyledCentralFillLink,
  StyledCentralMuted,
  StyledCentralSectionTitle,
  StyledCentralSegment,
  StyledCentralSegmented,
} from '@/central/components/CentralStyled';
import { CENTRAL_DIRECTORY_PATHS } from '@/central/constants/CentralDirectoryPaths';
import { useCentralCompanies } from '@/central/hooks/useCentralCompanies';
import { useCentralPeople } from '@/central/hooks/useCentralPeople';
import { useCentralPersonRoleField } from '@/central/hooks/useCentralPersonRoleField';
import { useCentralRecordUpdates } from '@/central/hooks/useCentralRecordUpdates';
import { getCentralClientMargin } from '@/central/utils/centralAlerts';
import {
  formatCentralCurrency,
  isAcessoPendingReview,
} from '@/central/utils/centralMoney';
import {
  getCentralPersonName,
  getCentralPersonPhone,
  getPrimaryContact,
  getWhatsAppUrl,
} from '@/central/utils/centralPeople';
import {
  getCentralClientPath,
  getCentralInitials,
  getNativeRecordPath,
  pluralize,
} from '@/central/utils/centralText';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { Link, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBrandWhatsapp,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconMail,
  IconPencil,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBackLink = styled(Link)`
  align-items: center;
  align-self: flex-start;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: 14px;
  gap: 6px;
  min-height: 32px;
  text-decoration: none;
`;

const StyledHero = styled.header`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray12};
  border-radius: 18px;
  color: ${themeCssVariables.grayScale.gray1};
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  padding: 24px;
`;

const StyledHeroIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
  min-width: 0;
`;

const StyledHeroAvatar = styled.div`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray1};
  border-radius: 50%;
  color: ${themeCssVariables.grayScale.gray12};
  display: flex;
  flex: none;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 22px;
  font-weight: 700;
  height: 60px;
  justify-content: center;
  width: 60px;
`;

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StyledHeroTitle = styled.h1`
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
`;

const StyledHeroBadge = styled.span`
  background: ${themeCssVariables.grayScale.gray1};
  border-radius: 999px;
  color: ${themeCssVariables.grayScale.gray12};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
`;

const StyledHeroSubtitle = styled.span`
  font-size: 14px;
  opacity: 0.8;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledColumns = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const StyledMain = styled.div`
  display: flex;
  flex: 999 1 520px;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const StyledAside = styled.aside`
  display: flex;
  flex: 1 1 280px;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
`;

const StyledCompanyLink = styled(Link)`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 16px;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  justify-content: space-between;
  padding: 18px 20px;
  text-decoration: none;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
`;

const StyledInitials = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: 12px;
  display: flex;
  flex: none;
  font-family: 'Space Grotesk', ${themeCssVariables.font.family};
  font-weight: 700;
  height: 44px;
  justify-content: center;
  width: 44px;
`;

const StyledHint = styled.span<{ tone: 'amber' | 'blue' }>`
  background: ${({ tone }) => themeCssVariables.tag.background[tone]};
  border-radius: 8px;
  color: ${({ tone }) => themeCssVariables.tag.text[tone]};
  font-size: 13px;
  padding: 6px 10px;
`;

const StyledAsideTitle = styled.h2`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledField = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  gap: 12px;
  justify-content: space-between;

  > span:last-child {
    overflow-wrap: anywhere;
    text-align: right;
  }
`;

const StyledPendingList = styled.ul`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const CentralPersonPage = () => {
  const { personId } = useParams();
  const { people, loading } = useCentralPeople();
  const { companies, getStatusOption } = useCentralCompanies();
  const { roleField, roleOptions } = useCentralPersonRoleField();
  const { savePersonRole } = useCentralRecordUpdates();
  const { copyToClipboard } = useCopyToClipboard();
  const now = new Date();

  const person = people.find((candidate) => candidate.id === personId);

  if (!isDefined(person)) {
    return (
      <CentralDirectoryLayout title="Pessoa">
        <StyledCentralMuted>
          {loading ? 'Carregando…' : 'Pessoa não encontrada.'}
        </StyledCentralMuted>
      </CentralDirectoryLayout>
    );
  }

  const name = getCentralPersonName(person);
  const email = person.emails?.primaryEmail;
  const phone = getCentralPersonPhone(person);
  const whatsAppUrl = getWhatsAppUrl(phone);
  const nativePath = getNativeRecordPath('person', person.id);
  const company = companies.find(
    (candidate) => candidate.id === person.companyId,
  );
  const isPrimary =
    isDefined(company) && getPrimaryContact(company.people)?.id === person.id;
  const statusOption = getStatusOption(company?.statusCliente ?? null);
  const clientMargin = isDefined(company)
    ? getCentralClientMargin(company)
    : null;
  const pendingAcessos =
    company?.acessos.filter((acesso) => isAcessoPendingReview(acesso, now))
      .length ?? 0;

  const missingFields = [
    !isNonEmptyString(person.name?.lastName) && 'Confirmar sobrenome',
    !isNonEmptyString(phone) && 'Pedir telefone / WhatsApp',
    !isNonEmptyString(person.jobTitle) && 'Preencher cargo',
    !isNonEmptyString(email) && 'Preencher e-mail',
  ].filter(isNonEmptyString);

  return (
    <CentralDirectoryLayout title={name || 'Pessoa'}>
      <StyledRow>
        <StyledBackLink to={CENTRAL_DIRECTORY_PATHS.people}>
          <IconChevronLeft size={16} />
          Pessoas
        </StyledBackLink>
      </StyledRow>

      <StyledHero>
        <StyledHeroIdentity>
          <StyledHeroAvatar>{getCentralInitials(name)}</StyledHeroAvatar>
          <StyledStack>
            <StyledTitleRow>
              <StyledHeroTitle>{name || 'Sem nome'}</StyledHeroTitle>
              {isPrimary && (
                <StyledHeroBadge>Contato principal</StyledHeroBadge>
              )}
            </StyledTitleRow>
            <StyledHeroSubtitle>
              {[person.jobTitle, company?.name ?? person.company?.name]
                .filter(isNonEmptyString)
                .join(' · ') || 'cargo e empresa: preencher'}
            </StyledHeroSubtitle>
          </StyledStack>
        </StyledHeroIdentity>
        <StyledActions>
          {isNonEmptyString(email) && (
            <>
              <a className={centralButtonClassName} href={`mailto:${email}`}>
                <IconMail size={16} />
                Escrever
              </a>
              <button
                type="button"
                className={centralButtonClassName}
                onClick={() => copyToClipboard(email, 'Copiado')}
              >
                <IconCopy size={16} />
                Copiar e-mail
              </button>
            </>
          )}
          {isDefined(whatsAppUrl) && (
            <a
              className={centralButtonClassName}
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
            >
              <IconBrandWhatsapp size={16} />
              WhatsApp
            </a>
          )}
          <Link className={centralButtonClassName} to={nativePath}>
            <IconPencil size={16} />
            Editar
          </Link>
        </StyledActions>
      </StyledHero>

      <StyledColumns>
        <StyledMain>
          {isDefined(company) ? (
            <StyledCompanyLink
              to={getCentralClientPath(company.id)}
              aria-label={`Abrir ${company.name ?? 'cliente'}`}
            >
              <StyledRow>
                <StyledInitials>
                  {getCentralInitials(company.name)}
                </StyledInitials>
                <StyledCentralDisplayText>
                  {company.name}
                </StyledCentralDisplayText>
              </StyledRow>
              <StyledRow>
                {isDefined(statusOption) && (
                  <Tag color={statusOption.color}>{statusOption.label}</Tag>
                )}
                {isDefined(clientMargin) &&
                  (isDefined(clientMargin.margin) ? (
                    <StyledCentralMuted>
                      margem {formatCentralCurrency(clientMargin.margin)}
                    </StyledCentralMuted>
                  ) : (
                    <StyledHint tone="amber">margem incompleta</StyledHint>
                  ))}
                {pendingAcessos > 0 && (
                  <StyledHint tone="blue">
                    {pluralize(pendingAcessos, 'acesso', 'acessos')} a revisar
                  </StyledHint>
                )}
                <IconChevronRight size={18} />
              </StyledRow>
            </StyledCompanyLink>
          ) : (
            <StyledCentralCard>
              <StyledCentralMuted>Sem empresa ligada.</StyledCentralMuted>
              <StyledCentralFillLink to={nativePath}>
                ligar a uma empresa
              </StyledCentralFillLink>
            </StyledCentralCard>
          )}

          <StyledCentralCard>
            <StyledCentralSectionTitle>
              Pendências com {person.name?.firstName || 'esta pessoa'}
            </StyledCentralSectionTitle>
            {missingFields.length > 0 ? (
              <StyledPendingList>
                {missingFields.map((label) => (
                  <li key={label}>
                    <StyledCentralFillLink to={nativePath}>
                      {label}
                    </StyledCentralFillLink>
                  </li>
                ))}
              </StyledPendingList>
            ) : (
              <StyledCentralMuted>Nada pendente.</StyledCentralMuted>
            )}
          </StyledCentralCard>

          <StyledCentralCard>
            <StyledCentralSectionTitle>
              Notas e tarefas
            </StyledCentralSectionTitle>
            <StyledCentralMuted>
              Notas, tarefas, e-mails e reuniões com esta pessoa ficam na linha
              do tempo do Twenty.
            </StyledCentralMuted>
            <Link className={centralButtonClassName} to={nativePath}>
              Abrir linha do tempo
            </Link>
          </StyledCentralCard>
        </StyledMain>

        <StyledAside>
          {isDefined(company) && (
            <StyledCentralCard>
              <StyledAsideTitle>Papel em {company.name}</StyledAsideTitle>
              {isDefined(roleField) && roleOptions.length > 0 ? (
                <StyledCentralSegmented role="radiogroup" aria-label="Papel">
                  {roleOptions.map((option) => (
                    <StyledCentralSegment
                      key={option.value}
                      type="button"
                      role="radio"
                      active={person.papel === option.value}
                      aria-checked={person.papel === option.value}
                      onClick={() => savePersonRole(person.id, option.value)}
                    >
                      {option.label}
                    </StyledCentralSegment>
                  ))}
                </StyledCentralSegmented>
              ) : (
                <StyledCentralMuted>
                  {isPrimary
                    ? 'Contato principal: é a primeira pessoa ligada ao cliente.'
                    : 'O contato principal é a primeira pessoa ligada ao cliente.'}
                </StyledCentralMuted>
              )}
            </StyledCentralCard>
          )}

          <StyledCentralCard>
            <StyledAsideTitle>Dados</StyledAsideTitle>
            <StyledField>
              <StyledCentralMuted>Nome</StyledCentralMuted>
              <span>{person.name?.firstName || '—'}</span>
            </StyledField>
            <StyledField>
              <StyledCentralMuted>Sobrenome</StyledCentralMuted>
              {isNonEmptyString(person.name?.lastName) ? (
                <span>{person.name.lastName}</span>
              ) : (
                <StyledCentralFillLink to={nativePath}>
                  preencher
                </StyledCentralFillLink>
              )}
            </StyledField>
            <StyledField>
              <StyledCentralMuted>Cargo</StyledCentralMuted>
              {isNonEmptyString(person.jobTitle) ? (
                <span>{person.jobTitle}</span>
              ) : (
                <StyledCentralFillLink to={nativePath}>
                  preencher
                </StyledCentralFillLink>
              )}
            </StyledField>
            <StyledField>
              <StyledCentralMuted>E-mail</StyledCentralMuted>
              {isNonEmptyString(email) ? (
                <span>{email}</span>
              ) : (
                <StyledCentralFillLink to={nativePath}>
                  preencher
                </StyledCentralFillLink>
              )}
            </StyledField>
            <StyledField>
              <StyledCentralMuted>Telefone</StyledCentralMuted>
              {isNonEmptyString(phone) ? (
                <span>{phone}</span>
              ) : (
                <StyledCentralFillLink to={nativePath}>
                  preencher
                </StyledCentralFillLink>
              )}
            </StyledField>
          </StyledCentralCard>
        </StyledAside>
      </StyledColumns>
    </CentralDirectoryLayout>
  );
};
