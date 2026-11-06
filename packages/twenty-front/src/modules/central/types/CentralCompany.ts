import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type CentralCurrency = {
  amountMicros: number | null;
  currencyCode: string | null;
} | null;

type CentralLinks = {
  primaryLinkUrl: string | null;
  primaryLinkLabel: string | null;
} | null;

export type CentralCustoInfra = ObjectRecord & {
  name: string | null;
  provedor: string | null;
  servico: string | null;
  custoMensal: CentralCurrency;
  quemPaga: string | null;
  renovacao: string | null;
  observacao: string | null;
};

export type CentralAcesso = ObjectRecord & {
  name: string | null;
  tipo: string | null;
  url: CentralLinks;
  login: string | null;
  ondeEstaASenha: string | null;
  quemTemAcesso: string | null;
  revisadoEm: string | null;
};

// papel is optional: the field only exists once it is created in the workspace.
export type CentralPerson = ObjectRecord & {
  name: { firstName: string | null; lastName: string | null } | null;
  jobTitle: string | null;
  emails: { primaryEmail: string | null } | null;
  phones?: {
    primaryPhoneNumber: string | null;
    primaryPhoneCallingCode: string | null;
  } | null;
  papel?: string | null;
};

export type CentralCompany = ObjectRecord & {
  name: string | null;
  domainName: CentralLinks;
  statusCliente: string | null;
  produto: string | null;
  mensalidade: CentralCurrency;
  inicioContrato: string | null;
  fimContrato?: string | null;
  cnpj: string | null;
  repositorio: CentralLinks;
  stack: string | null;
  address: { addressCity: string | null; addressState: string | null } | null;
  people: CentralPerson[];
  custosInfra: CentralCustoInfra[];
  acessos: CentralAcesso[];
  noteTargets: (ObjectRecord & {
    note:
      | (ObjectRecord & {
          title: string | null;
          bodyV2: { markdown: string | null } | null;
        })
      | null;
  })[];
};
