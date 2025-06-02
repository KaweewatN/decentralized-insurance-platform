import { Module } from '@nestjs/common';
import { OracleFlightController } from './oracle-flight.controller';
import { OracleFlightService } from './oracle-flight.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../../service/prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [OracleFlightController],
  providers: [OracleFlightService, PrismaService],
})
export class OracleFlightModule {}
