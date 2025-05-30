import { Module } from '@nestjs/common';
import { RainfallInsuranceController } from './rainfall-insurance.controller';
import { RainfallService } from './rainfall-insurance.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [RainfallInsuranceController],
  providers: [RainfallService],
  exports: [RainfallService],
})
export class RainfallInsuranceModule {}
