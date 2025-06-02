import { Injectable, Logger } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { RateService } from './rate.service';
import { DataService, Policy } from './data.service';
import { PrismaService } from 'service/prisma/prisma.service';
import { SupabaseHealthService } from 'module/file-upload/supabase.health.service';
import { ethers, uuidV4 } from 'ethers';
import { randomBytes } from 'crypto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private web3: Web3Service,
    private rateService: RateService,
    private dataService: DataService,
    private prisma: PrismaService,
    private supabaseService: SupabaseHealthService,
  ) {}

  async calculatePremium(
    walletAddress: string,
    sumAssured: number,
  ): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
      select: {
        age: true,
        occupation: true,
        gender: true,
      },
    });
    if (!user) {
      this.logger.error(`User not found for wallet: ${walletAddress}`);
      throw new Error('User not found');
    }
    let base = 1200;

    if (user.age < 18) base += 200;
    else if (user.age > 60) base += 400;

    if (user.gender.toLowerCase() === 'female') base -= 100;
    if (user.occupation.toLowerCase().includes('construction')) base += 300;
    if (user.occupation.toLowerCase().includes('pilot')) base += 500;

    const premium = Math.round((base * sumAssured) / 100000);
    this.logger.log(`🧮 Health premium calculated: ${premium} THB`);
    return premium;
  }

  async userHealthPurchase(input: {
    user_address: string;
    sumAssured: number;
    premium: number;
    coverageAmount: number;
    preExistingConditions: string;
    bmi: number;
    smokingStatus: string;
    exerciseFrequency: string;
    expectedNumber: number;
    fileUpload?: string;
    purchaseTransactionHash: string;
    premiumEth?: number;
    sumAssuredEth?: number;
  }) {
    const documentUrl = input.fileUpload
      ? await this.supabaseService.uploadDocumentBase64(
          input.fileUpload,
          `health-policy-${input.user_address}-${Date.now()}`,
          input.user_address,
        )
      : null;

    // Validate and sanitize BMI value
    const sanitizedBMI = Math.min(
      Math.max(parseFloat(input.bmi.toString()), 10),
      99.99,
    );

    // Validate other numeric fields
    const sanitizedPremium = Math.max(0, parseFloat(input.premium.toString()));
    const sanitizedCoverageAmount = Math.max(
      0,
      parseFloat(input.sumAssured.toString()), // Use sumAssured from input
    );

    const sanitizedExpectedNumber = Math.max(
      1,
      parseInt(input.expectedNumber.toString()),
    );

    this.logger.log(`📊 Health Policy Data Validation:
    - BMI: ${input.bmi} → ${sanitizedBMI}
    - Premium: ${input.premium} → ${sanitizedPremium}
    - Coverage Amount: ${input.sumAssured} → ${sanitizedCoverageAmount}
    - Expected Number: ${input.expectedNumber} → ${sanitizedExpectedNumber}`);

    try {
      // 1. Create Policy - Use coverageAmount instead of sumAssured
      const policy = await this.prisma.policy.create({
        data: {
          id: uuidV4(randomBytes(16)),
          walletAddress: input.user_address,
          premium: sanitizedPremium,
          totalPremium: sanitizedPremium,
          coverageAmount: sanitizedCoverageAmount, // This is the correct field name
          status: 'PendingPayment',
          coverageStartDate: new Date(),
          coverageEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          contractAddress:
            process.env.HEALTH_CONTRACT_ADDRESS ||
            '0x07c11f8CB34df0f29f91A2eE2be00708f3ab2480',
          planTypeId: 1,
          documentUrl: documentUrl || null,
          purchaseTransactionHash: input.purchaseTransactionHash,
        },
      });

      // 2. Create HealthPolicy linked to Policy with sanitized data
      await this.prisma.healthPolicy.create({
        data: {
          policyId: policy.id,
          preExistingConditions: input.preExistingConditions || 'None',
          medicalCoverage: sanitizedCoverageAmount,
          bmi: sanitizedBMI, // Use sanitized BMI value
          smokingStatus: input.smokingStatus as any,
          exerciseFrequency: input.exerciseFrequency as any,
          expectedNumber: sanitizedExpectedNumber,
        },
      });

      this.logger.log(`✅ Health policy created successfully:
      - Policy ID: ${policy.id}
      - User: ${input.user_address}
      - Coverage Amount: ${sanitizedCoverageAmount}
      - BMI: ${sanitizedBMI}
      - Transaction: ${input.purchaseTransactionHash}`);

      return {
        success: true,
        policyId: policy.id,
        message: 'Health policy purchased successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Health policy creation failed: ${error.message}`);

      // Provide more specific error information
      if (error.message.includes('numeric field overflow')) {
        throw new Error(
          `Data validation error: One of the numeric values is too large for the database. Please check BMI (${sanitizedBMI}), Premium (${sanitizedPremium}), or Coverage Amount (${sanitizedCoverageAmount}) values.`,
        );
      }

      throw error;
    }
  }

  // ซื้อ policy
  async purchasePolicy(data: {
    userId: string;
    sumAssured: number;
    policyId?: string;
  }) {
    try {
      // validation logic ตามเดิม
      const validation = this.dataService.validatePolicyLimits(
        data.userId,
        'health',
      );
      if (!validation.canPurchase) {
        this.logger.warn(
          `Health policy validation failed for ${data.userId}: ${validation.reason}`,
        );
        throw new Error(validation.reason);
      }

      const premiumThb = await this.calculatePremium(
        data.userId,
        data.sumAssured,
      );

      const exchangeRate = await this.rateService.getEthToThbRate();
      const premiumEth = await this.rateService.convertThbToEth(premiumThb);
      const sumAssuredEth = await this.rateService.convertThbToEth(
        data.sumAssured,
      );
      const duration = 365 * 24 * 60 * 60; // 1 year

      this.logger.log(`🛒 Purchasing health policy for ${data.userId}`);
      this.logger.log(
        `💰 Premium: ${premiumThb} THB (${premiumEth.toFixed(6)} ETH) at rate ${exchangeRate.toFixed(2)}`,
      );

      const sumAssuredWei = this.web3.toWei(sumAssuredEth);
      const premiumWei = this.web3.toWei(premiumEth);

      const { txHash, policyId } = await this.web3.purchaseHealthPolicy(
        data.userId,
        premiumWei,
        sumAssuredWei,
        duration,
      );

      let formattedPolicyId = policyId;
      if (!policyId.startsWith('0x') || policyId.length !== 66) {
        formattedPolicyId = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ['address', 'uint256'],
            [data.userId, Date.now()],
          ),
        );
        this.logger.warn(
          `⚠️ Generated fallback policy ID: ${formattedPolicyId}`,
        );
      }

      const policy: Policy = {
        id: formattedPolicyId,
        userId: data.userId,
        type: 'health',
        premium: premiumThb,
        sumAssured: data.sumAssured,
        premiumEth,
        sumAssuredEth,
        exchangeRate,
        expiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
        isActive: true,
        txHash,
        createdAt: Date.now(),
      };

      // Save policy to DataService (blockchain data)
      this.dataService.savePolicy(policy);

      // Update specific policy in Prisma database - only if policyId is provided
      let offchainPolicyId: string | null = null;

      try {
        if (data.policyId) {
          // Update specific policy by provided ID only
          const updatedPolicy = await this.prisma.policy.update({
            where: {
              id: data.policyId,
            },
            data: {
              status: 'Active',
              contractCreationHash: txHash,
              updatedAt: new Date(),
            },
          });

          offchainPolicyId = updatedPolicy.id;
          this.logger.log(
            `✅ Prisma policy updated to Active - Policy ID: ${offchainPolicyId}, TxHash: ${txHash}`,
          );
        } else {
          this.logger.warn(
            `⚠️ No policyId provided - skipping Prisma policy update`,
          );
        }
      } catch (prismaError) {
        this.logger.warn(
          `⚠️ Failed to update Prisma policy status: ${prismaError.message}`,
        );
        // Don't throw error here as blockchain transaction was successful
      }

      this.logger.log(
        `✅ Health policy created with blockchain ID: ${policy.id}`,
      );

      return {
        success: true,
        policy,
        offchainPolicyId, // Include the off-chain policy ID for reference
        blockchainPolicyId: policy.id, // Separate blockchain policy ID
        premiumThb,
        premiumEth: premiumEth.toFixed(6),
        exchangeRate: exchangeRate.toFixed(2),
        txHash,
      };
    } catch (error) {
      this.logger.error(`❌ Health policy purchase failed: ${error.message}`);
      throw error;
    }
  }

  // ดึง policy จาก blockchain จริง
  async getPolicyOnChain(policyId: string) {
    try {
      const contract = this.web3['healthContract'];
      const policy = await contract.methods.getPolicy(policyId).call();

      if (
        !policy ||
        policy.policyId ===
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        throw new Error('Policy not found on blockchain');
      }

      return {
        id: policy.policyId,
        userId: policy.owner,
        premium: this.web3.fromWei(policy.premium),
        sumAssured: Number(policy.sumAssured),
        expiry: Number(policy.expiry),
        isActive: policy.isActive,
        isClaimed: policy.isClaimed,
        createdAt: Number(policy.createdAt),
      };
    } catch (error) {
      this.logger.error(`❌ getPolicyOnChain failed: ${error.message}`);
      throw error;
    }
  }

  // ดึง policy เดี่ยวจาก blockchain
  async getPolicy(id: string) {
    try {
      return await this.getPolicyOnChain(id);
    } catch {
      return null;
    }
  }

  // Replace the fileClaim method around line 241

  async fileClaim(policyId: string, amountThb: number) {
    try {
      this.logger.log(`👨‍💼 Admin filing health claim for policy: ${policyId}`);

      // ดึง policy จาก blockchain
      const policy = await this.getPolicyOnChain(policyId);

      if (
        !policy ||
        policy.id ===
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        throw new Error(`Health policy not found: ${policyId}`);
      }

      if (!policy.isActive) {
        throw new Error('Policy is not active');
      }

      if (policy.isClaimed) {
        this.logger.warn(`⚠️ Policy ${policyId} may have previous claims`);
      }

      if (amountThb > policy.sumAssured) {
        throw new Error(
          `Claim amount (${amountThb.toLocaleString()} THB) exceeds policy sum assured (${policy.sumAssured.toLocaleString()} THB)`,
        );
      }

      const exchangeRate = await this.rateService.getEthToThbRate();
      const amountEth = await this.rateService.convertThbToEth(amountThb);

      this.logger.log(
        `💰 Admin processing claim: ${amountThb} THB (${amountEth.toFixed(6)} ETH) for policy owner ${policy.userId}`,
      );

      try {
        const amountWei = this.web3.toWei(amountEth);
        await this.web3.checkVaultBalance(amountWei, 'health');
        this.logger.log(
          `✅ Vault balance check passed for ${amountEth.toFixed(6)} ETH`,
        );
      } catch (vaultError) {
        this.logger.error(
          `❌ Vault balance check failed: ${vaultError.message}`,
        );
        throw new Error(`Cannot process claim: ${vaultError.message}`);
      }

      const amountWei = this.web3.toWei(amountEth);

      // 🔧 FIX: Handle the new return object from fileAndApproveClaim
      const claimResult = await this.web3.fileAndApproveClaim(
        'health',
        policy.id,
        amountWei,
      );

      this.logger.log(
        `✅ Blockchain transaction successful: ${claimResult.transactionHash}`,
      );

      // Save claim history (local) - FIX: Use transactionHash from the result object
      const claim = {
        id: `claim_${Date.now()}`,
        policyId: policy.id,
        amount: amountThb,
        amountEth,
        exchangeRate,
        status: 'approved' as const,
        createdAt: Date.now(),
        txHash: claimResult.transactionHash, // 🔧 FIX: Extract transactionHash from result object
        processedBy: 'admin',
        beneficiary: policy.userId,
      };

      this.dataService.saveClaim(claim);
      this.logger.log(
        `✅ Admin successfully processed health claim: ${claim.id} for user ${policy.userId}`,
      );

      return {
        success: true,
        claimId: claim.id,
        txHash: claimResult.transactionHash, // 🔧 FIX: Extract transactionHash
        policyOwner: policy.userId,
        message: `Health claim approved and payment initiated for ${policy.userId}`,
        // 🔥 NEW: Include additional information from the auto-approve result
        claimDetails: {
          amountThb,
          amountEth: claimResult.claimAmount,
          amountWei: claimResult.claimAmountWei,
          gasUsed: claimResult.gasUsed,
          blockNumber: claimResult.blockNumber,
          autoApproved: claimResult.success,
        },
      };
    } catch (error) {
      this.logger.error(
        `❌ Admin health claim processing failed: ${error.message}`,
      );
      throw error;
    }
  }

  async cancelPolicy(policyId: string, refundAmount: number) {
    try {
      // ดึง policy จาก blockchain
      const policy = await this.getPolicyOnChain(policyId);
      if (!policy) {
        throw new Error('Health policy not found');
      }
      if (!policy.isActive) {
        throw new Error('Policy is not active');
      }

      const exchangeRate = await this.rateService.getEthToThbRate();
      const refundEth = await this.rateService.convertThbToEth(refundAmount);

      this.logger.log(`🚫 Admin cancelling health policy: ${policyId}`);
      this.logger.log(
        `💰 Refund amount: ${refundAmount} THB (${refundEth.toFixed(6)} ETH)`,
      );

      const txHash = await this.web3.cancelPolicy(
        'health',
        policyId,
        refundEth.toString(),
      );

      this.logger.log(`✅ Health policy cancelled: ${policyId}`);

      return {
        success: true,
        policyId,
        refundAmount,
        refundEth: refundEth.toFixed(6),
        exchangeRate: exchangeRate.toFixed(2),
        txHash,
        message: 'Health policy cancelled and refund processed',
      };
    } catch (error) {
      this.logger.error(
        `❌ Health policy cancellation failed: ${error.message}`,
      );
      throw error;
    }
  }

  async calculateRefund(policyId: string): Promise<{
    refundAmount: number;
    reason: string;
    success: boolean;
    policyDetails?: any;
  }> {
    try {
      this.logger.log(`🔍 Starting refund calculation for policy: ${policyId}`);

      // Get policy from blockchain with better error handling
      let policy;
      try {
        policy = await this.getPolicyOnChain(policyId);
      } catch (blockchainError) {
        this.logger.error(`❌ Blockchain error: ${blockchainError.message}`);
        return {
          refundAmount: 0,
          reason: `Policy not found on blockchain: ${blockchainError.message}`,
          success: false,
        };
      }

      if (!policy) {
        this.logger.log(`❌ Policy not found: ${policyId}`);
        return {
          refundAmount: 0,
          reason: 'Policy does not exist',
          success: false,
        };
      }

      if (!policy.isActive) {
        this.logger.log(
          `❌ Policy inactive: ${policyId} (isActive: ${policy.isActive})`,
        );
        return {
          refundAmount: 0,
          reason: 'Policy is not active (may have been cancelled or claimed)',
          success: false,
          policyDetails: {
            isActive: policy.isActive,
            isClaimed: policy.isClaimed,
            userId: policy.userId,
          },
        };
      }

      // 🔧 FIX: Convert timestamps from seconds to milliseconds
      const now = Date.now();
      const createdAt = Number(policy.createdAt) * 1000;
      const expiry = Number(policy.expiry) * 1000;

      // 🆕 ADD: Debug logging
      this.logger.log(`🔍 Policy Debug Info:
      - Policy ID: ${policyId}
      - Created: ${new Date(createdAt).toISOString()}
      - Expires: ${new Date(expiry).toISOString()}
      - Now: ${new Date(now).toISOString()}
      - Is Claimed: ${policy.isClaimed}
      - Is Active: ${policy.isActive}
      - Premium (ETH): ${policy.premium}
      - User ID: ${policy.userId}`);

      // No refund if policy has expired
      if (now >= expiry) {
        this.logger.log(`❌ Policy expired - no refund available`);
        return {
          refundAmount: 0,
          reason: `Policy expired on ${new Date(expiry).toISOString()}`,
          success: false,
          policyDetails: {
            expiry: new Date(expiry).toISOString(),
            daysOverdue: Math.floor((now - expiry) / (24 * 60 * 60 * 1000)),
          },
        };
      }

      // No refund if already claimed (protect company)
      if (policy.isClaimed) {
        this.logger.log(`❌ Policy ${policyId} already claimed - no refund`);
        return {
          refundAmount: 0,
          reason:
            'Policy has been claimed, no refund available according to company policy',
          success: false,
          policyDetails: {
            isClaimed: policy.isClaimed,
            claimDate: 'Check claims history for details',
          },
        };
      }

      // 🔧 FIX: Convert ETH premium to THB
      const premiumEth = Number(policy.premium);
      let exchangeRate: number;
      let premiumThb: number;

      try {
        exchangeRate = await this.rateService.getEthToThbRate();
        premiumThb = Math.round(premiumEth * exchangeRate);
      } catch (rateError) {
        this.logger.error(`❌ Exchange rate error: ${rateError.message}`);
        return {
          refundAmount: 0,
          reason: `Cannot get exchange rate: ${rateError.message}`,
          success: false,
        };
      }

      // Calculate days since purchase
      const daysSincePurchase = Math.floor(
        (now - createdAt) / (24 * 60 * 60 * 1000),
      );
      const totalDays = Math.floor(
        (expiry - createdAt) / (24 * 60 * 60 * 1000),
      );
      const remainingDays = totalDays - daysSincePurchase;

      // 📋 Business Rules for Financial Institution

      // 1. Free Look Period (7 days) - Full refund
      if (daysSincePurchase <= 7) {
        this.logger.log(`🆓 Free look period: Full refund ${premiumThb} THB`);
        return {
          refundAmount: premiumThb,
          reason: 'Free look period - Full refund (within 7 days)',
          success: true,
          policyDetails: {
            daysSincePurchase,
            refundType: 'FREE_LOOK_PERIOD',
          },
        };
      }

      // 2. Early cancellation (8-30 days) - 25% admin fee
      if (daysSincePurchase <= 30) {
        const refundAmount = Math.round(premiumThb * 0.75); // Deduct 25%
        this.logger.log(
          `🔸 Early cancellation: ${refundAmount} THB (75% of premium)`,
        );
        return {
          refundAmount,
          reason: 'Early cancellation - 25% administrative fee applied',
          success: true,
          policyDetails: {
            daysSincePurchase,
            refundType: 'EARLY_CANCELLATION',
            adminFeePercentage: 25,
          },
        };
      }

      // 3. Standard cancellation - Calculate based on remaining time with 20% admin fee
      const unusedRatio = remainingDays / totalDays;
      const refundBeforeFee = Math.round(premiumThb * unusedRatio);
      const adminFee = Math.round(refundBeforeFee * 0.2); // 20% admin fee
      const refundAmount = refundBeforeFee - adminFee;

      // 4. Minimum refund policy - At least 50 THB or 0
      const finalRefund = refundAmount >= 50 ? refundAmount : 0;

      // 5. Maximum refund limit - Not exceeding 90% of premium
      const maxRefund = Math.round(premiumThb * 0.9);
      const safeRefund = Math.min(finalRefund, maxRefund);

      this.logger.log(
        `💰 Health refund calculation:
        - Original Premium: ${premiumThb} THB
        - Days used: ${daysSincePurchase}/${totalDays}
        - Unused ratio: ${(unusedRatio * 100).toFixed(1)}%
        - Before admin fee: ${refundBeforeFee} THB
        - Admin fee (20%): ${adminFee} THB
        - Final refund: ${safeRefund} THB`,
      );

      if (safeRefund === 0) {
        return {
          refundAmount: 0,
          reason: `Calculated refund (${refundAmount} THB) is below minimum threshold (50 THB)`,
          success: false,
          policyDetails: {
            daysSincePurchase,
            calculatedRefund: refundAmount,
            minimumThreshold: 50,
            refundType: 'BELOW_MINIMUM',
          },
        };
      }

      return {
        refundAmount: safeRefund,
        reason: 'Standard cancellation refund calculated successfully',
        success: true,
        policyDetails: {
          daysSincePurchase,
          totalDays,
          unusedRatio: (unusedRatio * 100).toFixed(1) + '%',
          adminFeePercentage: 20,
          refundType: 'STANDARD_CANCELLATION',
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ calculateRefund error: ${error.message}`);
      return {
        refundAmount: 0,
        reason: `Calculation error: ${error.message}`,
        success: false,
      };
    }
  }

  async renewPolicy(policyId: string, premiumThb: number) {
    try {
      this.logger.log(`🔄 Starting renewal process for policy: ${policyId}`);

      // Validate policy exists and is active with better error handling
      let policy;
      try {
        policy = await this.getPolicyOnChain(policyId);
      } catch (blockchainError) {
        this.logger.error(
          `❌ Blockchain error during renewal: ${blockchainError.message}`,
        );
        throw new Error(
          `Cannot access policy on blockchain: ${blockchainError.message}`,
        );
      }

      if (!policy) {
        throw new Error(`Policy not found: ${policyId}`);
      }

      if (!policy.isActive) {
        throw new Error(
          `Policy is not active: ${policyId} (Status: ${policy.isActive ? 'Active' : 'Inactive'})`,
        );
      }

      // Check if policy is expired
      const now = Date.now();
      const expiry = Number(policy.expiry) * 1000;

      if (now > expiry) {
        const daysOverdue = Math.floor((now - expiry) / (24 * 60 * 60 * 1000));
        throw new Error(
          `Policy expired ${daysOverdue} days ago on ${new Date(expiry).toISOString()}`,
        );
      }

      // Convert premium to ETH and Wei
      let exchangeRate: number;
      let premiumEth: number;

      try {
        exchangeRate = await this.rateService.getEthToThbRate();
        premiumEth = await this.rateService.convertThbToEth(premiumThb);
      } catch (rateError) {
        this.logger.error(`❌ Exchange rate error: ${rateError.message}`);
        throw new Error(`Cannot get exchange rate: ${rateError.message}`);
      }

      const premiumWei = this.web3.toWei(premiumEth);

      this.logger.log(`🔄 Renewing health policy: ${policyId}`);
      this.logger.log(
        `💰 Premium: ${premiumThb} THB = ${premiumEth.toFixed(6)} ETH (Rate: ${exchangeRate.toFixed(2)})`,
      );

      // Call Web3Service to renew on blockchain
      let renewalResult;
      try {
        renewalResult = await this.web3.renewHealthPolicy(policyId, premiumWei);
      } catch (web3Error) {
        this.logger.error(`❌ Web3 renewal error: ${web3Error.message}`);
        throw new Error(`Blockchain renewal failed: ${web3Error.message}`);
      }

      this.logger.log(`✅ Health policy renewed successfully: ${policyId}`);

      return {
        success: true,
        policyId,
        premiumThb,
        premiumEth: premiumEth.toFixed(6),
        exchangeRate: exchangeRate.toFixed(2),
        txHash: renewalResult.transactionHash,
        message: 'Health policy renewed successfully',
        renewalDetails: {
          gasUsed: renewalResult.gasUsed,
          blockNumber: renewalResult.blockNumber,
          newPremium: renewalResult.newPremium,
          previousExpiry: new Date(expiry).toISOString(),
          newExpiry: new Date(expiry + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Health policy renewal failed: ${error.message}`);
      throw error;
    }
  }
}
