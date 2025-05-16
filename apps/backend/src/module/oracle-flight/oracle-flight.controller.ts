import { Controller, Post } from '@nestjs/common';
import { OracleFlightService } from './oracle-flight.service';

@Controller('oracle')
export class OracleFlightController {
  constructor(private readonly oracleFlightService: OracleFlightService) {}

  // 🔁 Trigger the mock flight status check (payout/expiration logic)
  @Post('check')
  async checkPoliciesNow() {
    return this.oracleFlightService.handleScheduledChecks();
  }
}
