import { Module } from '@nestjs/common';
import { InsuranceController } from './insurance.controller';
import { HealthService } from './health.service';
import { LifeService } from './life.service';
import { Web3Service } from './web3.service';
import { RateService } from './rate.service';
import { DataService } from './data.service';
import { PrismaService } from '../../service/prisma/prisma.service';
import { SupabaseHealthService } from 'module/file-upload/supabase.health.service';

@Module({
  controllers: [InsuranceController],
  providers: [
    HealthService,
    LifeService,
    Web3Service,
    RateService,
    DataService,
    PrismaService,
    SupabaseHealthService,
  ],
})
export class InsuranceModule {}
