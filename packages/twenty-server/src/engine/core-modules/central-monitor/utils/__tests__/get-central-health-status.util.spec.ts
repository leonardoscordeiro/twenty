import { getCentralHealthStatus } from 'src/engine/core-modules/central-monitor/utils/get-central-health-status.util';

const check = (ok: boolean, ms: number | null = 100) => ({
  at: '2026-11-06T00:00:00.000Z',
  ok,
  ms,
});

describe('getCentralHealthStatus', () => {
  it('waits for the first check', () => {
    expect(getCentralHealthStatus([])).toBe('pending');
  });

  it('flags slow responses and a single failure as slow', () => {
    expect(getCentralHealthStatus([check(true, 2500)])).toBe('slow');
    expect(getCentralHealthStatus([check(true), check(false, null)])).toBe(
      'slow',
    );
  });

  it('only reports down after two failures in a row', () => {
    expect(getCentralHealthStatus([check(false), check(false)])).toBe('down');
    expect(getCentralHealthStatus([check(false), check(true)])).toBe('ok');
  });
});
