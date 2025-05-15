import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { ContractsModule } from './module/contracts/contracts.module';
import { HealthCareLiteModule } from './module/policies/health-care-lite/health-care-lite.module';
import { LifeCareLiteModule } from './module/policies/life-care-lite/life-care-lite.module';
import { UsersModule } from './module/users/users.module';
import { PoliciesModule } from './module/policies/policies.module';
import { SignatureModule } from './module/signature/signature.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables available throughout the application
    }),
    AuthModule,
    ContractsModule,
    HealthCareLiteModule,
    LifeCareLiteModule,
    UsersModule,
    PoliciesModule,
  ],
})
export class AppModule {}
