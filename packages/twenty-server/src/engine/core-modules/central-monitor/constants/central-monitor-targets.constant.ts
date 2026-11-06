import { type CentralHealthTarget } from 'src/engine/core-modules/central-monitor/types/central-monitor.type';

// Fixed list for a single-user fork: URLs never come from requests, so checks cannot be steered (no SSRF).
export const CENTRAL_HEALTH_TARGETS: CentralHealthTarget[] = [
  {
    id: 'conseg',
    companyName: 'ConSeg Contempladas',
    url: 'https://api.consegcontempladas.com/api/health',
  },
  {
    id: 'arka',
    companyName: 'Consórcio Arka',
    url: 'https://yxaqieyatoqfkbdlzfvd.supabase.co/auth/v1/health',
  },
  { id: 'v8', companyName: 'V8', url: 'https://app.usev8.com/api/' },
  {
    id: 'crm',
    companyName: 'Interno · CRM',
    url: 'https://crm.arkahub.com.br/healthz',
  },
  { id: 'infinitypro', companyName: 'InfinityPro', url: null },
];

export const CENTRAL_CERTIFICATE_HOSTS = [
  { host: '3maisinfinitypro.com.br', companyName: 'InfinityPro' },
  { host: 'app.usev8.com', companyName: 'V8' },
  { host: 'app.arkahub.com.br', companyName: 'Consórcio Arka' },
  { host: 'consegcontempladas.com', companyName: 'ConSeg Contempladas' },
  { host: 'api.consegcontempladas.com', companyName: 'ConSeg Contempladas' },
  { host: 'crm.arkahub.com.br', companyName: 'Interno · CRM' },
];

export const CENTRAL_DOMAINS = [
  { domain: 'arkahub.com.br', companyName: 'Consórcio Arka' },
  { domain: 'consegcontempladas.com', companyName: 'ConSeg Contempladas' },
  { domain: 'usev8.com', companyName: 'V8' },
  { domain: '3maisinfinitypro.com.br', companyName: 'InfinityPro' },
];
