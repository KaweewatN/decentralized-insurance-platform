import { Controller, Get, Query } from '@nestjs/common';
import { PolicyService } from './policy.service';

@Controller('user/policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async getPolicies(@Query('walletAddress') walletAddress: string) {
    return this.policyService.getPoliciesByWallet(walletAddress);
  }
}
