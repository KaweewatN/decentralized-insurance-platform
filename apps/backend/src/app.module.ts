import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { OracleFlightModule } from './oracle-flight/oracle-flight.module';
import { FlightInsuranceController } from './flight-insurance/flight-insurance.controller';
import { FileUploadController } from './file-upload/file-upload.controller';
// import { OracleController } from './oracle/oracle.controller';
import { FlightInsuranceService } from './flight-insurance/flight-insurance.service';
import { SupabaseService } from './file-upload/supabase.service';
// import { OracleService } from './oracle/oracle.service';
import { PolicyCleanupService } from './flight-insurance/policy-cleanup.service';
import { PriceModule } from './module/price/price.module';
import { OracleModule } from './module/oracle/oracle.module';
import { WalletModule } from './module/wallet/wallet.module';
import { PrismaModule } from './service/prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MulterModule.register({}),
    ScheduleModule.forRoot(),
    OracleFlightModule,
  ],
  controllers: [
    FlightInsuranceController,
    FileUploadController,
    // OracleController,
  ],
  providers: [
    FlightInsuranceService,
    SupabaseService,
    // OracleService,
    PolicyCleanupService,
    PriceModule,
    OracleModule,
    WalletModule,
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
