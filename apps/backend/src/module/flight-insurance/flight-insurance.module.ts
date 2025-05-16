import { Module } from '@nestjs/common';
import { FlightInsuranceController } from './flight-insurance.controller';
import { FlightInsuranceService } from './flight-insurance.service';
import { SupabaseService } from '../file-upload/supabase.service';
import { Web3Module } from 'src/service/web3/web3.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [Web3Module, ConfigModule],
  controllers: [FlightInsuranceController],
  providers: [FlightInsuranceService, SupabaseService],
  exports: [FlightInsuranceService],
})
export class FlightInsuranceModule {}
