import { Module } from '@nestjs/common';
import { HealthcheckController } from './HealthcheckController';

@Module({
    controllers: [HealthcheckController]
})
export class HealthcheckModule {}
