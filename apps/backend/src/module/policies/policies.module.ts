// src/module/policies/policies.module.ts
import { Module } from '@nestjs/common';
import { LifeCareLiteModule } from './life-care-lite/life-care-lite.module';
import { HealthCareLiteModule } from './health-care-lite/health-care-lite.module';
import { ContractsModule } from '../contracts/contracts.module'; // เพิ่มการนำเข้า ContractsModule
import { SignatureModule } from '../signature/signature.module'; // เพิ่มการนำเข้า SignatureModule

@Module({
  imports: [
    LifeCareLiteModule,
    HealthCareLiteModule,
    ContractsModule, // เพิ่ม ContractsModule
    SignatureModule, // เพิ่ม SignatureModule
  ],
  exports: [LifeCareLiteModule, HealthCareLiteModule],
})
export class PoliciesModule {}
