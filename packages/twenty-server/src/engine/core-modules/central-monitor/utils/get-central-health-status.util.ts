import {
  type CentralHealthCheck,
  type CentralHealthStatus,
} from 'src/engine/core-modules/central-monitor/types/central-monitor.type';

export const CENTRAL_SLOW_THRESHOLD_MS = 2000;

// Down needs two failed checks in a row; a single failure only marks it slow.
export const getCentralHealthStatus = (
  history: CentralHealthCheck[],
): CentralHealthStatus => {
  const last = history[history.length - 1];
  const previous = history[history.length - 2];

  if (last === undefined) {
    return 'pending';
  }

  if (!last.ok) {
    return previous !== undefined && !previous.ok ? 'down' : 'slow';
  }

  return (last.ms ?? 0) > CENTRAL_SLOW_THRESHOLD_MS ? 'slow' : 'ok';
};
