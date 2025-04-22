import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PriceModule } from './price/price.module';
import { OracleModule } from './oracle/oracle.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PriceModule,
    OracleModule,
  ],
})
export class AppModule {}
