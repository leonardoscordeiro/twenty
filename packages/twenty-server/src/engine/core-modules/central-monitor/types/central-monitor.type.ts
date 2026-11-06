export type CentralHealthTarget = {
  id: string;
  companyName: string;
  url: string | null;
};

export type CentralHealthCheck = {
  at: string;
  ok: boolean;
  ms: number | null;
};

export type CentralHealthStatus =
  | 'ok'
  | 'slow'
  | 'down'
  | 'pending'
  | 'unmonitored';

export type CentralExpiration = {
  kind: 'certificate' | 'domain';
  name: string;
  companyName: string;
  expiresAt: string | null;
  error: string | null;
};
