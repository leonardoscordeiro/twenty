import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { useEffect, useState } from 'react';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';

export type CentralHealthStatus =
  | 'ok'
  | 'slow'
  | 'down'
  | 'pending'
  | 'unmonitored';

export type CentralHealthTarget = {
  id: string;
  companyName: string;
  url: string | null;
  status: CentralHealthStatus;
  lastMs: number | null;
  uptime: number | null;
  history: { at: string; ok: boolean; ms: number | null }[];
};

export type CentralExpiration = {
  kind: 'certificate' | 'domain';
  name: string;
  companyName: string;
  expiresAt: string | null;
  error: string | null;
};

type CentralMonitorState<TData> = {
  data: TData | null;
  error: boolean;
};

const fetchCentralMonitor = async <TData>(path: string) => {
  const response = await fetch(`${REST_API_BASE_URL}/central-monitor/${path}`, {
    credentials: 'include',
    headers: { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' },
  });

  if (!response.ok) {
    throw new Error(`central-monitor/${path} ${response.status}`);
  }

  return (await response.json()) as TData;
};

const useCentralMonitorResource = <TData>(path: string) => {
  const [state, setState] = useState<CentralMonitorState<TData>>({
    data: null,
    error: false,
  });

  useEffect(() => {
    let isCurrent = true;

    fetchCentralMonitor<TData>(path)
      .then((data) => isCurrent && setState({ data, error: false }))
      .catch(() => isCurrent && setState({ data: null, error: true }));

    return () => {
      isCurrent = false;
    };
  }, [path]);

  return state;
};

export const useCentralHealth = () =>
  useCentralMonitorResource<{
    intervalMs: number;
    targets: CentralHealthTarget[];
  }>('health');

export const useCentralExpirations = () =>
  useCentralMonitorResource<{ items: CentralExpiration[] }>('expirations');
