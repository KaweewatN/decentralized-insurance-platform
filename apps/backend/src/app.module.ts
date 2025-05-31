import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InsuranceModule } from './insurance/insurance.module';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { OracleFlightModule } from './module/oracle-flight/oracle-flight.module';
import { FlightInsuranceModule } from './module/flight-insurance/flight-insurance.module';
import { PriceModule } from './module/price/price.module';
import { WalletModule } from './module/wallet/wallet.module';
import { PrismaModule } from './service/prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { AdminModule } from './module/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    InsuranceModule,
    MulterModule.register({}),
    ScheduleModule.forRoot(),
    OracleFlightModule,
    PriceModule,
    WalletModule,
    AuthModule,
    PrismaModule,
    FlightInsuranceModule,
    UserModule,
    AdminModule,
  ],
})
export class AppModule {}
