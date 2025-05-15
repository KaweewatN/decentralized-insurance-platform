// src/oracle/oracle.controller.ts
import { Controller, Post, Get, Query } from '@nestjs/common';
import { OracleService } from './oracle.service';

@Controller('oracle')
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  @Get('price')
  async getCurrentPrice(): Promise<number> {
    return await this.oracleService.fetchEthToThb();
  }

  @Post('update')
  async updatePriceToContract() {
    await this.oracleService['updatePriceToContract']();
    return { message: 'Oracle updated (tx sent)' };
  }

  @Get('oracle/mock-delay')
  async runMockDelay(@Query('policyId') policyId: number) {
    return this.oracleService.mockProcessFlightStatus(Number(policyId));
  }

}
