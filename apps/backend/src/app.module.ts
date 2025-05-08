import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    PriceModule,
    OracleModule,
    WalletModule,
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
