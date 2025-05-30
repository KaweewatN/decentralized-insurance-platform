import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InsuranceModule } from './insurance/insurance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    InsuranceModule,
  ],
})
export class AppModule {}
