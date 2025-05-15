// src/policies/health-care-lite/health-care-lite.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HealthCareLiteService } from './health-care-lite.service';
import { HealthCarePolicy, ClaimRequest, UserProfile } from '../policy.types';

@Controller('health-care-lite')
export class HealthCareLiteController {
  constructor(private readonly healthCareLiteService: HealthCareLiteService) {}

  @Get()
  findAll(): HealthCarePolicy[] {
    return this.healthCareLiteService.findAll();
  }

  @Get(':policyId')
  findByPolicyId(
    @Param('policyId') policyId: string,
  ): HealthCarePolicy | { message: string } {
    const policy = this.healthCareLiteService.findByPolicyId(policyId);
    if (!policy) return { message: 'Policy not found' };
    return policy;
  }

  @Post('calculate-premium')
  async calculatePremium(
    @Body()
    body: {
      age: number;
      gender: string;
      occupation: string;
      sumAssured: number;
      signature: string;
    },
  ) {
    const { age, gender, occupation, sumAssured, signature } = body;
    try {
      const premium = await this.healthCareLiteService.calculatePremiumInEth(
        age,
        gender,
        occupation,
        sumAssured,
        signature,
      );
      return { premium };
    } catch (error) {
      return { message: error.message };
    }
  }

  @Post('purchase-policy')
  async purchasePolicy(
    @Body()
    body: {
      userId: string;
      age: number;
      gender: string;
      occupation: string;
      sumAssured: number;
      fullName: string;
      contactInfo: string;
      premium: number;
      signature: string;
    },
  ) {
    const {
      userId,
      age,
      gender,
      occupation,
      sumAssured,
      fullName,
      contactInfo,
      premium,
      signature,
    } = body;

    try {
      const policy = await this.healthCareLiteService.purchasePolicy(
        userId,
        age,
        gender,
        occupation,
        sumAssured,
        fullName,
        contactInfo,
        premium, // ✅ Make sure this is included
        signature,
      );
      return { policy };
    } catch (error) {
      return { message: error.message };
    }
  }

  @Post('calculate-refund')
  calculateRefund(@Body() body: { policyId: string; signature: string }) {
    const { policyId, signature } = body;
    try {
      const policy = this.healthCareLiteService.findByPolicyId(policyId);
      if (!policy) return { message: 'Policy not found' };
      const refund = this.healthCareLiteService.calculateRefund(
        policy,
        signature,
      );
      return { refund };
    } catch (error) {
      return { message: error.message };
    }
  }

  @Post('file-claim')
  fileClaim(
    @Body()
    body: {
      policyId: string;
      userId: string;
      amount: number;
      documentHash: string;
      signature: string;
    },
  ) {
    const { policyId, userId, amount, documentHash, signature } = body;
    try {
      const claim = this.healthCareLiteService.fileClaim(
        policyId,
        userId,
        amount,
        documentHash,
        signature,
      );
      return { claim };
    } catch (error) {
      return { message: error.message };
    }
  }
  @Post('cancel-policy')
  async cancelPolicy(
    @Body()
    body: {
      policyId: string;
      refundAmount: number;
      signature: string;
    },
  ) {
    const { policyId, refundAmount, signature } = body;
    try {
      // เรียกใช้ service ที่ต้องเพิ่มเข้าไปใน HealthCareLiteService
      const refund = await this.healthCareLiteService.cancelPolicy(
        policyId,
        refundAmount,
        signature,
      );
      return { refund };
    } catch (error) {
      return { message: error.message };
    }
  }

  @Post('approve-claim')
  async approveClaim(
    @Body()
    body: {
      policyId: string;
      claimId: string;
      signature: string;
    },
  ) {
    const { policyId, claimId, signature } = body;
    try {
      const approved = await this.healthCareLiteService.approveClaim(
        policyId,
        claimId,
        signature,
      );
      return { success: approved };
    } catch (error) {
      return { message: error.message };
    }
  }
}
