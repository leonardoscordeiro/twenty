import { Controller, Get, UseGuards } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ApiPath } from 'twenty-shared/types';

import { CentralMonitorService } from 'src/engine/core-modules/central-monitor/central-monitor.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@Controller(`${ApiPath.Rest}/central-monitor`)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: false,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
  }),
)
export class CentralMonitorController {
  constructor(private readonly centralMonitorService: CentralMonitorService) {}

  @Get('health')
  getHealth() {
    return this.centralMonitorService.getHealth();
  }

  @Get('expirations')
  getExpirations() {
    return this.centralMonitorService.getExpirations();
  }
}
