// src/module/policies/health-care-lite/health-care-lite.module.ts
import { Module } from '@nestjs/common';
import { HealthCareLiteService } from './health-care-lite.service';
import { ContractsModule } from '../../contracts/contracts.module';
import { ConfigModule } from '@nestjs/config'; // เพิ่มการนำเข้า ConfigModule ถ้าจำเป็น
import { SignatureModule } from '../../signature/signature.module';

@Module({
  imports: [
    ContractsModule, // นำเข้า ContractsModule
    ConfigModule, // นำเข้า ConfigModule (ถ้าจำเป็น)
    SignatureModule, // นำเข้า SignatureModule
  ],
  providers: [HealthCareLiteService],
  exports: [HealthCareLiteService],
})
export class HealthCareLiteModule {}
