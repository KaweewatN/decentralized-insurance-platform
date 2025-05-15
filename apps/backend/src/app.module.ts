import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { OracleFlightModule } from './module/oracle-flight/oracle-flight.module';
import { FlightInsuranceModule } from './module/flight-insurance/flight-insurance.module';
import { PriceModule } from './module/price/price.module';
import { OracleModule } from './module/oracle/oracle.module';
import { WalletModule } from './module/wallet/wallet.module';
import { PrismaModule } from './service/prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { PolicyModule } from './module/user/policy/policy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MulterModule.register({}),
    ScheduleModule.forRoot(),
    OracleFlightModule,
    PriceModule,
    OracleModule,
    WalletModule,
    AuthModule,
    PrismaModule,
    FlightInsuranceModule,
    PolicyModule,
  ],
})
export class AppModule {}
