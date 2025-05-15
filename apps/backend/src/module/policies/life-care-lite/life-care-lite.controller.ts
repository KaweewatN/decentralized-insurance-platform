import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LifeCareLiteService } from './life-care-lite.service';
import { LifeCarePolicy, ClaimRequest } from '../policy.types';

@Controller('life-care-lite')
export class LifeCareLiteController {
  constructor(private readonly lifeCareLiteService: LifeCareLiteService) {}

  @Get()
  findAll(): LifeCarePolicy[] {
    return this.lifeCareLiteService.findAll();
  }

  @Get(':policyId')
  findByPolicyId(
    @Param('policyId') policyId: string,
  ): LifeCarePolicy | { message: string } {
    const policy = this.lifeCareLiteService.findByPolicyId(policyId);
    if (!policy) return { message: 'Policy not found' };
    return policy;
  }
  // Modified calculatePremium method for LifeCareLiteController.ts

  @Post('calculate-premium')
  async calculatePremium(
    @Body()
    body: {
      age: number;
      gender: string;
      occupation: string;
      sumAssured: number;
      signature: string;
      premiumInThb?: number;
    },
  ) {
    try {
      console.log('Received calculate premium request:', body);

      const age = Number(body.age);
      const sumAssured = Number(body.sumAssured);
      const premiumInThb = body.premiumInThb
        ? Number(body.premiumInThb)
        : undefined;

      if (isNaN(age) || age <= 0) {
        return { error: true, message: 'Invalid age value' };
      }

      if (isNaN(sumAssured) || sumAssured <= 0) {
        return { error: true, message: 'Invalid sum assured value' };
      }

      if (
        premiumInThb !== undefined &&
        (isNaN(premiumInThb) || premiumInThb < 0)
      ) {
        return { error: true, message: 'Invalid premium value' };
      }

      if (!body.gender || typeof body.gender !== 'string') {
        return { error: true, message: 'Invalid gender value' };
      }

      if (!body.occupation || typeof body.occupation !== 'string') {
        return { error: true, message: 'Invalid occupation value' };
      }

      if (!body.signature || typeof body.signature !== 'string') {
        return { error: true, message: 'Invalid signature' };
      }

      console.log('Parameters sent to service:', {
        age,
        gender: body.gender,
        occupation: body.occupation,
        sumAssured,
        signature: body.signature,
        premiumInThb,
      });

      const premium = await this.lifeCareLiteService.calculatePremiumInEth(
        age,
        body.gender,
        body.occupation,
        sumAssured,
        body.signature,
        premiumInThb,
      );

      return {
        success: true,
        premium,
        premiumInThb:
          premiumInThb ||
          this.lifeCareLiteService.calculatePremium(
            age,
            body.gender,
            body.occupation,
            sumAssured,
          ),
      };
    } catch (error) {
      console.error('Calculate premium error:', error);
      return {
        error: true,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }
  }

  // Modified purchasePolicy method for LifeCareLiteController.ts

  @Post('purchase-policy')
  async purchasePolicy(
    @Body()
    body: {
      userId: string;
      fullName: string;
      age: number;
      gender: string;
      occupation: string;
      contactInfo: string;
      sumAssured: number;
      premium: number;
      signature: string;
    },
  ): Promise<{ policy: LifeCarePolicy } | { message: string; stack?: string }> {
    try {
      console.log('Received purchase policy request:', body);

      // 1. แปลงประเภทข้อมูลให้ถูกต้อง
      const age = Number(body.age);
      const sumAssured = Number(body.sumAssured);
      const premium = Number(body.premium);

      // 2. ตรวจสอบความถูกต้องของข้อมูล
      if (!body.userId || typeof body.userId !== 'string') {
        return { message: 'Invalid user ID' };
      }

      if (!body.fullName || typeof body.fullName !== 'string') {
        return { message: 'Invalid full name' };
      }

      if (isNaN(age) || age <= 0) {
        return { message: 'Invalid age value' };
      }

      if (!body.gender || typeof body.gender !== 'string') {
        return { message: 'Invalid gender value' };
      }

      if (!body.occupation || typeof body.occupation !== 'string') {
        return { message: 'Invalid occupation value' };
      }

      if (!body.contactInfo || typeof body.contactInfo !== 'string') {
        return { message: 'Invalid contact information' };
      }

      if (isNaN(sumAssured) || sumAssured <= 0) {
        return { message: 'Invalid sum assured value' };
      }

      if (isNaN(premium) || premium <= 0) {
        return { message: 'Invalid premium value' };
      }

      if (!body.signature || typeof body.signature !== 'string') {
        return { message: 'Invalid signature' };
      }

      console.log('Parameters sent to service:', {
        userId: body.userId,
        fullName: body.fullName,
        age,
        gender: body.gender,
        occupation: body.occupation,
        contactInfo: body.contactInfo,
        sumAssured,
        premium,
        signature: body.signature,
      });

      const policy = await this.lifeCareLiteService.purchasePolicy(
        body.userId,
        body.fullName,
        age,
        body.gender,
        body.occupation,
        body.contactInfo,
        sumAssured,
        premium,
        body.signature,
      );

      return { policy };
    } catch (error) {
      console.error('Purchase policy error:', error);
      return {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
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
  ): Promise<{ refund: number } | { message: string }> {
    const { policyId, refundAmount, signature } = body;
    try {
      const refund = await this.lifeCareLiteService.cancelPolicy(
        policyId,
        refundAmount,
        signature,
      );
      return { refund };
    } catch (error: any) {
      return { message: error.message };
    }
  }

  @Post('file-claim')
  async fileClaim(
    @Body()
    body: {
      policyId: string;
      userId: string;
      amount: number;
      documentHash: string;
      signature: string;
    },
  ): Promise<{ claim: ClaimRequest } | { message: string }> {
    const { policyId, userId, amount, documentHash, signature } = body;
    try {
      const claim = await this.lifeCareLiteService.fileClaim(
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

  @Post('approve-claim')
  async approveClaim(
    @Body()
    body: {
      policyId: string;
      signature: string;
    },
  ): Promise<{ payout: number } | { message: string }> {
    const { policyId, signature } = body;
    try {
      const payout = await this.lifeCareLiteService.approveClaim(
        policyId,
        signature,
      );
      return { payout };
    } catch (error) {
      return { message: error.message };
    }
  }
}
