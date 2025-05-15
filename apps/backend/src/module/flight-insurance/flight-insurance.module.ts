import { Module } from '@nestjs/common';
import { FlightInsuranceController } from './flight-insurance.controller';
import { FlightInsuranceService } from './flight-insurance.service';
import { SupabaseService } from '../file-upload/supabase.service';

@Module({
  controllers: [FlightInsuranceController],
  providers: [FlightInsuranceService, SupabaseService],
  exports: [FlightInsuranceService],
})
export class FlightInsuranceModule {}
