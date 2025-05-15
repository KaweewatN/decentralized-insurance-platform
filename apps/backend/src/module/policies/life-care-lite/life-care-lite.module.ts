// src/module/policies/life-care-lite/life-care-lite.module.ts
import { Module } from '@nestjs/common';
import { LifeCareLiteService } from './life-care-lite.service';
import { LifeCareLiteController } from './life-care-lite.controller';
import { ContractsModule } from '../../contracts/contracts.module';
import { ConfigModule } from '@nestjs/config'; // เพิ่มการนำเข้า ConfigModule ถ้าจำเป็น
import { SignatureModule } from '../../signature/signature.module';

@Module({
  imports: [
    ContractsModule, // นำเข้า ContractsModule
    ConfigModule, // นำเข้า ConfigModule (ถ้าจำเป็น)
    SignatureModule, // นำเข้า SignatureModule
  ],
  providers: [LifeCareLiteService],
  controllers: [LifeCareLiteController],
  exports: [LifeCareLiteService],
})
export class LifeCareLiteModule {}
