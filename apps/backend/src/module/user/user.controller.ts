import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
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

  @Get('claim/:walletAddress')
  async getClaimsByWallet(@Param('walletAddress') walletAddress: string) {
    return this.policyService.getClaimsByWallet(walletAddress);
  }

  @Get('claim/:walletAddress/:claimId')
  async getClaimsByWalletAndPolicy(
    @Param('walletAddress') walletAddress: string,
    @Param('claimId') claimId: string,
  ) {
    return this.policyService.getClaimByClaimIdAndWallet(
      walletAddress,
      claimId,
    );
  }

  @Post('claim/submit')
  async createClaim(
    @Body()
    claimData: {
      policyId: string;
      planType: string;
      walletAddress: string;
      subject: string;
      incidentDate: string;
      incidentDescription: string;
      document: {
        name: string;
        base64: string;
        type: string;
        size: number;
      };
    },
  ) {
    return this.policyService.createClaim(claimData);
  }
}
