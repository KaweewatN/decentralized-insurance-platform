import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ContractsService } from '../../contracts/contracts.service';
import { HealthCarePolicy, ClaimRequest, UserProfile } from '../policy.types';
// Import the SignatureService instead of utils
import { SignatureService } from '../../signature/signature.service';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class HealthCareLiteService {
  private mockFile = path.resolve(__dirname, 'health-care-lite.mock.json');
  private logger = new Logger(HealthCareLiteService.name);
  private claimsFile = path.resolve(__dirname, 'claims.mock.json');
  private profilesFile = path.resolve(__dirname, 'user-profiles.mock.json');

  private readonly policyHashSecret: string;
  private readonly claimHashSecret: string;

  constructor(
    private readonly contractsService: ContractsService,
    private readonly configService: ConfigService,
    // Inject the SignatureService
    private readonly signatureService: SignatureService,
  ) {
    this.policyHashSecret =
      this.configService.get<string>('POLICY_HASH_SECRET') || '';
    this.claimHashSecret =
      this.configService.get<string>('CLAIM_HASH_SECRET') || '';

    if (!this.policyHashSecret || !this.claimHashSecret) {
      this.logger.error('Missing hash secrets in environment variables');
      throw new Error('Hash secrets must be provided in environment');
    }
  }

  // Create secure policy ID using the policy hash secret
  private generatePolicyId(userId: string, timestamp: number): string {
    const data = `${userId}-${timestamp}`;
    const hash = crypto
      .createHmac('sha256', this.policyHashSecret)
      .update(data)
      .digest('hex');

    return `POLICY-${hash}`;
  }

  // Create secure document hash using the claim hash secret
  private hashDocument(documentData: string): string {
    return crypto
      .createHmac('sha256', this.claimHashSecret)
      .update(documentData)
      .digest('hex');
  }

  // Enhanced message hash with secrets
  private getMessageHash(
    param1: number | string,
    param2: string | number,
    param3: string,
    param4: number,
    param5: number,
    isClaimRelated: boolean = false,
  ): string {
    // Convert all parameters to strings for consistency
    const p1 = String(param1);
    const p2 = String(param2);
    const p3 = String(param3);
    const p4 = String(param4);
    const p5 = String(param5);

    // Create the message
    const message = `${p1},${p2},${p3},${p4},${p5}`;

    // Use the appropriate secret based on the context
    const secret = isClaimRelated
      ? this.claimHashSecret
      : this.policyHashSecret;

    // Create an HMAC hash with the appropriate secret
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
  }

  private async getEthToThbRateFromCache(): Promise<number> {
    const { rate, expiresIn } = this.contractsService.getCurrentCachedRate();

    if (rate > 0) {
      this.logger.log(
        `Using cached ETH to THB rate: ${rate} (expires in ${expiresIn} seconds)`,
      );
      return rate;
    }

    this.logger.log('No cached rate available, attempting to fetch fresh rate');

    try {
      // Fetch fresh rate if no valid cache is available
      const freshRate = await this.contractsService.getEthToThbRate();

      // If the fetched rate is valid, return it
      if (typeof freshRate === 'number' && freshRate > 0) {
        this.logger.log(`Using freshly fetched ETH to THB rate: ${freshRate}`);
        return freshRate;
      }

      // If we reach this point, the fresh rate was not valid
      throw new Error('Failed to fetch valid ETH to THB rate');
    } catch (error) {
      this.logger.error(
        `Failed to fetch fresh ETH to THB rate: ${error.message}`,
      );
      throw error;
    }
  }

  async purchasePolicy(
    userId: string,
    age: number,
    gender: string,
    occupation: string,
    sumAssured: number,
    fullName: string,
    contactInfo: string,
    premium: number,
    signature: string,
  ): Promise<HealthCarePolicy> {
    const messageHash = this.getMessageHash(
      age,
      gender,
      occupation,
      sumAssured,
      premium,
    );

    // Verify the admin signature using SignatureService
    const isValid = this.signatureService.verifySignature(
      messageHash,
      signature,
    );
    if (!isValid) throw new Error('Invalid admin signature');

    const timestamp = Date.now();
    // Generate a secure policy ID
    const policyId = this.generatePolicyId(userId, timestamp);

    // Make sure to generate the policy data hash
    const policyDataHash = this.hashPolicyData(
      userId,
      fullName,
      age,
      gender,
      occupation,
    );

    try {
      // Now use the generated hash
      const txHash = await this.contractsService.purchaseHealthPolicy(
        userId, // user
        policyDataHash, // policy data hash - now properly defined
        sumAssured, // sum assured
        premium, // premium
        signature, // signature
      );

      // Create the policy object
      const policy: HealthCarePolicy = {
        policyId,
        userId,
        premium,
        sumAssured,
        expiry: timestamp + 365 * 24 * 60 * 60 * 1000,
        isActive: true,
        claimAmount: 0,
        transactionHash: txHash,
      };

      // Save the policy to the mock file
      this.savePolicy(policy);
      this.logger.log(`Policy purchased: ${JSON.stringify(policy)}`);
      return policy;
    } catch (error: any) {
      this.logger.error(`Failed to purchase policy: ${error.message}`);
      throw new Error(`Policy purchase failed: ${error.message}`);
    }
  }

  // Hash the policy data before sending to smart contract
  private hashPolicyData(
    userId: string,
    fullName: string,
    age: number,
    gender: string,
    occupation: string,
  ): string {
    const policyData = `${userId},${fullName},${age},${gender},${occupation}`;
    return crypto
      .createHmac('sha256', this.policyHashSecret)
      .update(policyData)
      .digest('hex');
  }

  private savePolicy(policy: HealthCarePolicy) {
    const policies = this.findAll();
    policies.push(policy);
    fs.writeFileSync(this.mockFile, JSON.stringify(policies, null, 2));
  }

  findAll(): HealthCarePolicy[] {
    if (!fs.existsSync(this.mockFile)) {
      fs.writeFileSync(this.mockFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(this.mockFile, 'utf-8');
    return JSON.parse(data) as HealthCarePolicy[];
  }

  findByPolicyId(policyId: string): HealthCarePolicy | undefined {
    const policies = this.findAll();
    return policies.find((policy) => policy.policyId === policyId);
  }

  async calculatePremiumInEth(
    age: number,
    gender: string,
    occupation: string,
    sumAssured: number,
    signature: string,
  ): Promise<number> {
    const ethToThb = await this.getEthToThbRateFromCache();
    const premiumInThb = this.calculatePremium(
      age,
      gender,
      occupation,
      sumAssured,
    );

    const messageHash = this.getMessageHash(
      age,
      gender,
      occupation,
      sumAssured,
      premiumInThb,
    );
    // Use SignatureService for verification
    const isValid = this.signatureService.verifySignature(
      messageHash,
      signature,
    );
    if (!isValid) throw new Error('Invalid admin signature');

    return premiumInThb / ethToThb;
  }

  calculatePremium(
    age: number,
    gender: string,
    occupation: string,
    sumAssured: number,
  ): number {
    let baseThbPremium = 1200;

    if (age < 18) baseThbPremium += 200;
    else if (age > 60) baseThbPremium += 400;

    if (gender.toLowerCase() === 'female') baseThbPremium -= 100;

    if (occupation.toLowerCase() === 'construction') baseThbPremium += 300;

    return (baseThbPremium * sumAssured) / 100000;
  }

  calculateRefund(policy: HealthCarePolicy, signature: string): number {
    const remainingTime = Math.max(policy.expiry - Date.now(), 0);
    const refundAmount =
      (policy.premium * remainingTime) / (365 * 24 * 60 * 60 * 1000);

    const messageHash = this.getMessageHash(
      policy.expiry,
      policy.premium,
      'refund',
      refundAmount,
      policy.claimAmount,
    );
    // Use SignatureService for verification
    const isValid = this.signatureService.verifySignature(
      messageHash,
      signature,
    );
    if (!isValid) throw new Error('Invalid admin signature');

    return refundAmount;
  }

  fileClaim(
    policyId: string,
    userId: string,
    amount: number,
    documentData: string,
    signature: string,
  ): ClaimRequest {
    const policy = this.findByPolicyId(policyId);
    if (!policy || !policy.isActive || Date.now() > policy.expiry)
      throw new Error('Policy not active or expired');
    if (amount <= 0 || amount > policy.sumAssured - policy.claimAmount)
      throw new Error('Invalid claim amount');

    // Generate document hash using the claim hash secret
    const documentHash = this.hashDocument(documentData);

    const messageHash = this.getMessageHash(
      policyId,
      amount,
      documentHash,
      policy.sumAssured,
      policy.claimAmount,
      true, // Use claim-related secret
    );
    // Use SignatureService for verification
    const isValid = this.signatureService.verifySignature(
      messageHash,
      signature,
    );
    if (!isValid) throw new Error('Invalid admin signature');

    // สร้าง claim object - ตรวจสอบว่า ClaimRequest interface มีฟิลด์ timestamp
    const claim: ClaimRequest = {
      policyId,
      userId,
      amount,
      documentHash,
      isPending: true,
      timestamp: Date.now(),
    };
    this.saveClaim(claim);
    this.logger.log(`Claim filed: ${JSON.stringify(claim)}`);

    try {
      this.submitClaimToBlockchain(policyId, amount, documentHash, signature);
    } catch (err: any) {
      this.logger.error(`Failed to submit claim to blockchain: ${err.message}`);
    }

    return claim;
  }

  // Mock function to simulate submitting claim to blockchain
  private async submitClaimToBlockchain(
    policyId: string,
    amount: number,
    documentHash: string,
    signature: string,
  ): Promise<void> {
    try {
      // เรียกใช้ contractsService จริงแทนที่จะใช้ mock
      const txHash = await this.contractsService.submitClaim(
        policyId,
        amount,
        documentHash,
        signature,
      );
      this.logger.log(`Claim submitted to blockchain with TX: ${txHash}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to submit claim to blockchain: ${error.message}`,
      );
      throw error; // โยน error ต่อไปให้ผู้เรียก
    }
  }

  async approveClaim(
    policyId: string,
    claimId: string,
    adminSignature: string,
  ): Promise<boolean> {
    const claims = this.getAllClaims();
    const claimIndex = claims.findIndex(
      (c) =>
        c.policyId === policyId &&
        c.documentHash.includes(claimId) &&
        c.isPending,
    );

    if (claimIndex === -1) throw new Error('Pending claim not found');

    const claim = claims[claimIndex];
    const policy = this.findByPolicyId(policyId);

    if (!policy) throw new Error('Policy not found');

    // Verify admin signature for claim approval
    const messageHash = this.getMessageHash(
      policyId,
      claim.amount,
      claim.documentHash,
      policy.sumAssured,
      policy.claimAmount,
      true, // Use claim-related secret
    );

    // Use SignatureService for verification
    const isValid = this.signatureService.verifySignature(
      messageHash,
      adminSignature,
    );
    if (!isValid) throw new Error('Invalid admin signature for claim approval');

    // Update claim status
    claims[claimIndex].isPending = false;
    claims[claimIndex].approvedAt = Date.now();

    // Update policy claim amount
    policy.claimAmount += claim.amount;

    // Check if policy should be terminated (fully claimed)
    if (policy.claimAmount >= policy.sumAssured) {
      policy.isActive = false;
    }

    // Update files
    fs.writeFileSync(this.claimsFile, JSON.stringify(claims, null, 2));

    // Update policy file
    const policies = this.findAll();
    const policyIndex = policies.findIndex((p) => p.policyId === policyId);
    if (policyIndex !== -1) {
      policies[policyIndex] = policy;
      fs.writeFileSync(this.mockFile, JSON.stringify(policies, null, 2));
    }

    try {
      // เรียกใช้ contractService เพื่ออนุมัติ claim บนบล็อกเชน
      const txHash = await this.contractsService.approveClaim(policyId);
      this.logger.log(`Claim approved on blockchain with TX: ${txHash}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to approve claim on blockchain: ${error.message}`,
      );
      throw new Error('Blockchain claim approval failed');
    }
  }

  async cancelPolicy(
    policyId: string,
    refundAmount: number,
    signature: string,
  ): Promise<number> {
    const policy = this.findByPolicyId(policyId);
    if (!policy) throw new Error('Policy not found');
    if (!policy.isActive) throw new Error('Policy already inactive');

    try {
      // คำนวณจำนวนเงินคืนจาก ETH เป็น Wei
      const ethToThbRate = await this.getEthToThbRateFromCache();
      const refundAmountInEth = refundAmount / ethToThbRate;
      const refundAmountInWei = BigInt(Math.floor(refundAmountInEth * 1e18));

      // สร้าง message hash สำหรับตรวจสอบ signature
      const messageHash = this.getMessageHash(
        policyId,
        refundAmount,
        'cancel',
        policy.sumAssured,
        policy.claimAmount,
      );

      // ตรวจสอบ signature using SignatureService
      const isValid = this.signatureService.verifySignature(
        messageHash,
        signature,
      );
      if (!isValid) throw new Error('Invalid admin signature');

      // เรียกใช้ contract เพื่อยกเลิกกรมธรรม์
      const txHash = await this.contractsService.cancelPolicy(
        policyId,
        refundAmountInWei,
        signature,
      );

      // อัปเดตสถานะกรมธรรม์
      policy.isActive = false;

      // อัปเดตข้อมูลในไฟล์
      const policies = this.findAll();
      const policyIndex = policies.findIndex((p) => p.policyId === policyId);
      if (policyIndex !== -1) {
        policies[policyIndex] = policy;
        fs.writeFileSync(this.mockFile, JSON.stringify(policies, null, 2));
      }

      this.logger.log(`Policy canceled: ${policyId} with TX: ${txHash}`);
      return refundAmount;
    } catch (error: any) {
      this.logger.error(`Failed to cancel policy: ${error.message}`);
      throw new Error(`Policy cancellation failed: ${error.message}`);
    }
  }

  private saveClaim(claim: ClaimRequest) {
    const claims = this.getAllClaims();
    claims.push(claim);
    fs.writeFileSync(this.claimsFile, JSON.stringify(claims, null, 2));
  }

  private getAllClaims(): ClaimRequest[] {
    if (!fs.existsSync(this.claimsFile)) {
      fs.writeFileSync(this.claimsFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(this.claimsFile, 'utf-8');
    return JSON.parse(data) as ClaimRequest[];
  }
}
