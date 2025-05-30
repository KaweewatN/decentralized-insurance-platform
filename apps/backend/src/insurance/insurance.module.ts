import { Module } from '@nestjs/common';
import { InsuranceController } from './insurance.controller';
import { HealthService } from './health.service';
import { LifeService } from './life.service';
import { Web3Service } from './web3.service';
import { RateService } from './rate.service';
import { DataService } from './data.service';

@Module({
  controllers: [InsuranceController],
  providers: [
    HealthService,
    LifeService,
    Web3Service,
    RateService,
    DataService,
  ],
})
export class InsuranceModule {}
