import { Module } from '@nestjs/common';

import { CentralMonitorController } from 'src/engine/core-modules/central-monitor/central-monitor.controller';
import { CentralMonitorService } from 'src/engine/core-modules/central-monitor/central-monitor.service';

@Module({
  controllers: [CentralMonitorController],
  providers: [CentralMonitorService],
})
export class CentralMonitorModule {}
