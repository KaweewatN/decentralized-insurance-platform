import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
//import { PriceModule } from './price/price.module';
//import { OracleModule } from './oracle/oracle.module';
import { RainfallInsuranceModule } from './rainfall-insurance/rainfall-insurance.module';
import { join } from 'path';
import { existsSync } from 'fs';

// Resolve .env path and log it
const envPath = join(__dirname, '../../../../.env');
console.log('[ENV PATH]', envPath, 'Exists?', existsSync(envPath));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
    }),
    //PriceModule,
    //OracleModule,
    RainfallInsuranceModule,
  ],
})
export class AppModule {}




