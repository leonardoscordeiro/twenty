import * as tls from 'tls';

import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import {
  CENTRAL_CERTIFICATE_HOSTS,
  CENTRAL_DOMAINS,
  CENTRAL_HEALTH_TARGETS,
} from 'src/engine/core-modules/central-monitor/constants/central-monitor-targets.constant';
import {
  type CentralExpiration,
  type CentralHealthCheck,
} from 'src/engine/core-modules/central-monitor/types/central-monitor.type';
import { getCentralHealthStatus } from 'src/engine/core-modules/central-monitor/utils/get-central-health-status.util';

const HEALTH_INTERVAL_MS = 5 * 60 * 1000;
const HEALTH_HISTORY_SIZE = 288;
const REQUEST_TIMEOUT_MS = 10_000;
const EXPIRATIONS_TTL_MS = 24 * 60 * 60 * 1000;

// ponytail: history and expirations live in memory, so a redeploy restarts the 24 h window;
// persist to a table if that gap starts to matter.
@Injectable()
export class CentralMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CentralMonitorService.name);
  private readonly historyByTargetId = new Map<string, CentralHealthCheck[]>();
  private interval: NodeJS.Timeout | undefined;
  private expirations:
    | { fetchedAt: number; items: Promise<CentralExpiration[]> }
    | undefined;

  onModuleInit() {
    void this.checkAllTargets();
    this.interval = setInterval(
      () => void this.checkAllTargets(),
      HEALTH_INTERVAL_MS,
    );
    this.interval.unref();
  }

  onModuleDestroy() {
    clearInterval(this.interval);
  }

  getHealth() {
    return {
      intervalMs: HEALTH_INTERVAL_MS,
      targets: CENTRAL_HEALTH_TARGETS.map((target) => {
        const history = this.historyByTargetId.get(target.id) ?? [];
        const okCount = history.filter((check) => check.ok).length;

        return {
          ...target,
          status:
            target.url === null
              ? 'unmonitored'
              : getCentralHealthStatus(history),
          lastMs: history[history.length - 1]?.ms ?? null,
          uptime: history.length > 0 ? okCount / history.length : null,
          history,
        };
      }),
    };
  }

  async getExpirations() {
    if (
      this.expirations === undefined ||
      Date.now() - this.expirations.fetchedAt > EXPIRATIONS_TTL_MS
    ) {
      this.expirations = {
        fetchedAt: Date.now(),
        items: this.fetchExpirations(),
      };
    }

    return { items: await this.expirations.items };
  }

  private async checkAllTargets() {
    await Promise.all(
      CENTRAL_HEALTH_TARGETS.map(async (target) => {
        if (target.url === null) {
          return;
        }

        const history = this.historyByTargetId.get(target.id) ?? [];

        history.push(await this.checkUrl(target.url));
        this.historyByTargetId.set(
          target.id,
          history.slice(-HEALTH_HISTORY_SIZE),
        );
      }),
    );
  }

  // Any answer below 500 means the server is up; some targets have no public health route.
  private async checkUrl(url: string): Promise<CentralHealthCheck> {
    const startedAt = Date.now();

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      await response.body?.cancel();

      return {
        at: new Date(startedAt).toISOString(),
        ok: response.status < 500,
        ms: Date.now() - startedAt,
      };
    } catch {
      return { at: new Date(startedAt).toISOString(), ok: false, ms: null };
    }
  }

  private async fetchExpirations(): Promise<CentralExpiration[]> {
    const settle = async (
      base: Omit<CentralExpiration, 'expiresAt' | 'error'>,
      read: () => Promise<string>,
    ): Promise<CentralExpiration> => {
      try {
        return { ...base, expiresAt: await read(), error: null };
      } catch (error) {
        this.logger.warn(`Central expiration lookup failed for ${base.name}`);

        return {
          ...base,
          expiresAt: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };

    return Promise.all([
      ...CENTRAL_CERTIFICATE_HOSTS.map(({ host, companyName }) =>
        settle({ kind: 'certificate', name: host, companyName }, () =>
          this.readCertificateExpiration(host),
        ),
      ),
      ...CENTRAL_DOMAINS.map(({ domain, companyName }) =>
        settle({ kind: 'domain', name: domain, companyName }, () =>
          this.readDomainExpiration(domain),
        ),
      ),
    ]);
  }

  private readCertificateExpiration(host: string) {
    return new Promise<string>((resolve, reject) => {
      const socket = tls.connect(
        { host, port: 443, servername: host, timeout: REQUEST_TIMEOUT_MS },
        () => {
          const { valid_to: validTo } = socket.getPeerCertificate();

          socket.end();
          resolve(new Date(validTo).toISOString());
        },
      );

      socket.on('error', reject);
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('TLS timeout'));
      });
    });
  }

  private async readDomainExpiration(domain: string) {
    const rdapBaseUrl = domain.endsWith('.br')
      ? 'https://rdap.registro.br/domain'
      : 'https://rdap.verisign.com/com/v1/domain';
    const response = await fetch(`${rdapBaseUrl}/${domain}`, {
      headers: { accept: 'application/rdap+json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`RDAP ${response.status}`);
    }

    const body = (await response.json()) as {
      events?: { eventAction: string; eventDate: string }[];
    };
    const expiration = body.events?.find(
      (event) => event.eventAction === 'expiration',
    );

    if (expiration === undefined) {
      throw new Error('RDAP without expiration event');
    }

    return new Date(expiration.eventDate).toISOString();
  }
}
