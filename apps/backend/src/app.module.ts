import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

import { FlightInsuranceController } from './flight-insurance/flight-insurance.controller';
import { FlightInsuranceService } from './flight-insurance/flight-insurance.service';

import { SupabaseService } from './file-upload/supabase.service';
import { FileUploadController } from './file-upload/file-upload.controller';

import { OracleController } from './oracle/oracle.controller';
import { OracleService } from './oracle/oracle.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({}),
  ],
  controllers: [
    FlightInsuranceController,
    FileUploadController,
    OracleController, 
  ],
  providers: [
    FlightInsuranceService,
    SupabaseService,
    OracleService, 
  ],
})
export class AppModule {}



