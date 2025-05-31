import { Injectable, Logger } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { RateService } from './rate.service';
import { DataService, Policy } from './data.service';

@Injectable()
export class LifeService {
  private readonly logger = new Logger(LifeService.name);

  constructor(
    private web3: Web3Service,
    private rateService: RateService,
    private dataService: DataService,
  ) {}

  calculatePremium(
    age: number,
    gender: string,
    occupation: string,
    sumAssured: number,
  ): number {
    let base = 100;

    if (age < 25) base -= 20;
    else if (age < 40) base += 30;
    else if (age < 60) base += 70;
    else base += 120;

    if (gender.toLowerCase() === 'female') base -= 10;

    const highRisk = ['soldier', 'firefighter', 'police'];
    const moderateRisk = ['construction', 'miner', 'pilot'];

    if (highRisk.includes(occupation.toLowerCase())) base += 100;
    else if (moderateRisk.includes(occupation.toLowerCase())) base += 80;
    else base += 40;

    const premium = Math.round((base * sumAssured) / 100000);
    this.logger.log(`🧮 Life premium calculated: ${premium} THB`);
    return premium;
  }

  async purchasePolicy(data: {
    userId: string;
    age: number;
    gender: string;
    occupation: string;
    sumAssured: number;
  }) {
    try {
      if (data.age < 18)
        throw new Error('Life insurance requires minimum age of 18');
      if (data.age > 75) throw new Error('Life insurance maximum age is 75');
      if (data.sumAssured > 10000000)
        throw new Error('Life insurance maximum sum assured is 10,000,000 THB');

      const premiumThb = this.calculatePremium(
        data.age,
        data.gender,
        data.occupation,
        data.sumAssured,
      );

      const exchangeRate = await this.rateService.getEthToThbRate();
      const premiumEth = await this.rateService.convertThbToEth(premiumThb);
      const sumAssuredEth = await this.rateService.convertThbToEth(
        data.sumAssured,
      );
      const duration = 80 * 365 * 24 * 60 * 60; // 80 years

      this.logger.log(`🛒 Purchasing life policy for ${data.userId}`);
      this.logger.log(
        `💰 Premium: ${premiumThb} THB (${premiumEth.toFixed(6)} ETH) at rate ${exchangeRate.toFixed(2)}`,
      );
      this.logger.log(
        `💰 SumAssured: ${data.sumAssured} THB (${sumAssuredEth.toFixed(6)} ETH)`,
      );

      const sumAssuredWei = this.web3.toWei(sumAssuredEth);
      const premiumWei = this.web3.toWei(premiumEth);

      this.logger.log(
        `💰 SumAssuredWei: ${sumAssuredWei}, PremiumWei: ${premiumWei}`,
      );

      const { policyId: blockchainPolicyId, txHash } =
        await this.web3.purchaseLifePolicy(
          data.userId,
          premiumWei,
          sumAssuredWei,
          duration,
        );

      // สร้าง policy object สำหรับเก็บ local claim history
      const policy: Policy = {
        id: blockchainPolicyId,
        userId: data.userId,
        type: 'life',
        premium: premiumThb,
        sumAssured: data.sumAssured,
        premiumEth,
        sumAssuredEth,
        exchangeRate,
        expiry: Date.now() + 80 * 365 * 24 * 60 * 60 * 1000,
        isActive: true,
        isClaimed: false,
        txHash,
        createdAt: Date.now(),
      };

      this.dataService.savePolicy(policy);
      this.logger.log(`✅ Life policy created: ${policy.id}`);

      return {
        success: true,
        policy,
        premiumThb,
        premiumEth: premiumEth.toFixed(6),
        exchangeRate: exchangeRate.toFixed(2),
        txHash,
      };
    } catch (error) {
      this.logger.error(`❌ Life policy purchase failed: ${error.message}`);
      throw error;
    }
  }

  // ดึง policy จาก blockchain จริง
  async getPolicyOnChain(policyId: string) {
    try {
      const contract = this.web3['lifeContract'];
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

  // Fix the fileClaim method around line 266

  async fileClaim(policyId: string, amountThb: number) {
    try {
      this.logger.log(`👨‍💼 Admin filing life claim for policy: ${policyId}`);
      this.logger.log(
        `💰 Received amount: ${amountThb} THB (type: ${typeof amountThb})`,
      );

      // ดึง policy จาก blockchain
      const policy = await this.getPolicyOnChain(policyId);

      if (
        !policy ||
        policy.id ===
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        throw new Error(`Life policy not found: ${policyId}`);
      }

      this.logger.log(
        `✅ Found policy: ${policy.id} for user ${policy.userId}`,
      );
      this.logger.log(
        `📋 Policy details: Premium=${policy.premium} THB, SumAssured=${policy.sumAssured} THB, Active=${policy.isActive}`,
      );

      if (!policy.isActive) {
        throw new Error('Policy is not active');
      }
      if (policy.isClaimed) {
        throw new Error('Life policy has already been claimed');
      }
      if (!amountThb || typeof amountThb !== 'number' || amountThb <= 0) {
        throw new Error(
          `Invalid claim amount: ${amountThb} (type: ${typeof amountThb})`,
        );
      }
      if (amountThb > policy.sumAssured) {
        throw new Error(
          `Claim amount ${amountThb} THB exceeds policy sum assured ${policy.sumAssured} THB`,
        );
      }

      // 🔥 เพิ่มการเช็คหน่วย ETH ก่อนส่งไป contract
      const exchangeRate = await this.rateService.getEthToThbRate();
      const amountEth = await this.rateService.convertThbToEth(amountThb);
      const sumAssuredEth = await this.rateService.convertThbToEth(
        policy.sumAssured,
      );

      if (amountEth > sumAssuredEth) {
        throw new Error(
          `Claim amount (${amountEth} ETH) exceeds policy sum assured (${sumAssuredEth} ETH)`,
        );
      }

      this.logger.log(
        `💰 Admin processing life claim: ${amountThb} THB (${amountEth.toFixed(6)} ETH) for policy owner ${policy.userId}`,
      );

      try {
        const amountWei = this.web3.toWei(amountEth);
        const vaultCheck = await this.web3.checkVaultBalance(amountWei);
        this.logger.log(`✅ Vault balance check passed:`);
        this.logger.log(
          `  Available: ${vaultCheck.vaultBalance.toFixed(6)} ETH`,
        );
        this.logger.log(`  Required: ${vaultCheck.claimAmount.toFixed(6)} ETH`);
        this.logger.log(`  Remaining: ${vaultCheck.remaining.toFixed(6)} ETH`);
      } catch (vaultError) {
        this.logger.error(
          `❌ Vault balance check failed: ${vaultError.message}`,
        );
        throw new Error(`Cannot process life claim: ${vaultError.message}`);
      }

      this.logger.log(`🔗 Processing claim on blockchain...`);

      const amountWei = this.web3.toWei(amountEth);

      // 🔧 FIX: Handle the new return object from fileAndApproveClaim
      const claimResult = await this.web3.fileAndApproveClaim(
        'life',
        policy.id,
        amountWei, // ✅ ส่งเป็น wei (string)
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
        `✅ Admin processed life claim successfully: ${claim.id} for user ${policy.userId}`,
      );

      return {
        success: true,
        claimId: claim.id,
        txHash: claimResult.transactionHash, // 🔧 FIX: Extract transactionHash
        policyOwner: policy.userId,
        policyTerminated: true,
        message: `Life claim filed and approved with sufficient vault balance for ${policy.userId}`,
        vaultInfo: {
          sufficientBalance: true,
          claimAmount: `${amountEth.toFixed(6)} ETH`,
        },
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
        `❌ Admin life claim processing failed: ${error.message}`,
      );
      throw error;
    }
  }

  async cancelPolicy(policyId: string, refundAmount: number) {
    try {
      // ดึง policy จาก blockchain
      const policy = await this.getPolicyOnChain(policyId);
      if (!policy) {
        throw new Error('Life policy not found');
      }
      if (!policy.isActive) {
        throw new Error('Policy is not active');
      }
      if (policy.isClaimed) {
        throw new Error('Policy already claimed - cannot cancel');
      }

      const exchangeRate = await this.rateService.getEthToThbRate();
      const refundEth = await this.rateService.convertThbToEth(refundAmount);
      const refundWei = this.web3.toWei(refundEth.toFixed(6));

      this.logger.log(`🚫 Admin cancelling life policy: ${policyId}`);
      this.logger.log(
        `💰 Refund: ${refundAmount} THB → ${refundEth.toFixed(6)} ETH → ${refundWei} wei`,
      );

      const txHash = await this.web3.cancelPolicy('life', policyId, refundWei);

      this.logger.log(`✅ Life policy cancelled: ${policyId}`);

      return {
        success: true,
        policyId,
        refundAmount,
        refundEth: refundEth.toFixed(6),
        exchangeRate: exchangeRate.toFixed(2),
        txHash,
        message: 'Life policy cancelled and refund processed',
      };
    } catch (error) {
      this.logger.error(`❌ Life policy cancellation failed: ${error.message}`);
      throw error;
    }
  }
  async calculateRefund(policyId: string): Promise<{
    refundAmount: number;
    reason: string;
    policyStatus: any;
  }> {
    // Get policy from blockchain
    const policy = await this.getPolicyOnChain(policyId);
    if (!policy) {
      return {
        refundAmount: 0,
        reason: 'Policy not found',
        policyStatus: { exists: false },
      };
    }

    // Check if already claimed
    if (policy.isClaimed) {
      return {
        refundAmount: 0,
        reason: 'Policy already claimed - no refund allowed',
        policyStatus: {
          exists: true,
          isActive: false,
          isClaimed: true,
        },
      };
    }

    // Check if active
    if (!policy.isActive) {
      return {
        refundAmount: 0,
        reason: 'Policy is not active',
        policyStatus: {
          exists: true,
          isActive: false,
          isClaimed: false,
        },
      };
    }

    // Calculate basic info
    const now = Date.now();
    const createdAt = Number(policy.createdAt) * 1000;
    const expiry = Number(policy.expiry) * 1000;
    const daysSincePurchase = Math.floor(
      (now - createdAt) / (24 * 60 * 60 * 1000),
    );

    // Check if expired
    if (now >= expiry) {
      return {
        refundAmount: 0,
        reason: 'Policy has expired',
        policyStatus: {
          exists: true,
          isActive: false,
          expired: true,
        },
      };
    }

    // Get premium in THB
    const exchangeRate = await this.rateService.getEthToThbRate();
    const premiumThb = Math.round(Number(policy.premium) * exchangeRate);

    let refundAmount = 0;
    let reason = '';

    // Simple refund rules
    if (daysSincePurchase <= 15) {
      // Free look period - full refund
      refundAmount = premiumThb;
      reason = `Free look period (${daysSincePurchase} days) - Full refund`;
    } else if (daysSincePurchase <= 90) {
      // Early cancellation - 60% refund
      refundAmount = Math.round(premiumThb * 0.6);
      reason = `Early cancellation (${daysSincePurchase} days) - 60% refund`;
    } else {
      // Standard cancellation - calculate proportional
      const totalDays = Math.floor(
        (expiry - createdAt) / (24 * 60 * 60 * 1000),
      );
      const remainingDays = totalDays - daysSincePurchase;
      const unusedRatio = remainingDays / totalDays;

      // Proportional amount minus 30% admin fee
      const proportional = Math.round(premiumThb * unusedRatio);
      const afterFee = Math.round(proportional * 0.7); // 70% after 30% fee

      // Minimum 100 THB, maximum 80% of premium
      const minRefund = 100;
      const maxRefund = Math.round(premiumThb * 0.8);

      refundAmount = Math.max(
        0,
        Math.min(afterFee >= minRefund ? afterFee : 0, maxRefund),
      );

      if (refundAmount === 0) {
        reason = `Refund below minimum (100 THB) - ${daysSincePurchase} days used`;
      } else {
        reason = `Standard refund - ${Math.round(unusedRatio * 100)}% unused minus fees`;
      }
    }

    return {
      refundAmount,
      reason,
      policyStatus: {
        exists: true,
        isActive: true,
        isClaimed: false,
        daysSincePurchase,
        originalPremium: premiumThb,
      },
    };
  }
}
