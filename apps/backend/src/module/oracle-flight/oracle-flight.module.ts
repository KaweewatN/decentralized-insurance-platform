import { Module } from '@nestjs/common';
import { OracleFlightController } from './oracle-flight.controller';
import { OracleFlightService } from './oracle-flight.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [OracleFlightController],
  providers: [OracleFlightService],
})
export class OracleFlightModule {}
