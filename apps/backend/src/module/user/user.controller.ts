import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly policyService: UserService) {}

  @Get('policy')
  async getPolicies(
    @Query('walletAddress') walletAddress: string,
    @Query('policyId') policyId?: string,
  ) {
    return this.policyService.getPoliciesByWallet(walletAddress, policyId);
  }

  @Get('policy/summary')
  async getPolicySummary(@Query('walletAddress') walletAddress: string) {
    return this.policyService.getPolicySummary(walletAddress);
  }

  @Get('profile')
  async getUserProfile(@Query('walletAddress') walletAddress: string) {
    return this.policyService.getUserProfile(walletAddress);
  }
}
