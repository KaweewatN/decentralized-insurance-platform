import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ContractsService } from '../../contracts/contracts.service';
// Import the SignatureService instead of utility functions
import { SignatureService } from '../../signature/signature.service';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { ConfigService } from '@nestjs/config';
import {
  generatePolicyHash,
  generateClaimHash,
  generateCancelHash,
} from '../../utils/hash.utils';
import { toNumberSafe } from '../../utils/bigint.utils';
import { ethers } from 'ethers';

interface LifeCarePolicy {
  policyId: string;
  userId: string;
  fullName: string;
  age: number;
  gender: string;
  occupation: string;
  contactInfo: string;
  premium: number;
  sumAssured: number;
  expiry: number;
  maturityDate: number;
  isActive: boolean;
  claimAmount: number;
  transactionHash?: string; // Added for tracking blockchain transaction
}

interface ClaimRequest {
  policyId: string;
  userId: string;
  amount: number;
  documentHash: string;
  isPending: boolean;
  timestamp?: number; // Added for tracking when claim was filed
  approvedAt?: number; // Added for tracking when claim was approved
}

@Injectable()
export class LifeCareLiteService {
  private mockFile = path.resolve(__dirname, 'life-care-lite.mock.json');
  private claimsFile = path.resolve(__dirname, 'claims.mock.json');
  private logger = new Logger(LifeCareLiteService.name);

  // Add hash secrets for security
  private readonly policyHashSecret: string;
  private readonly claimHashSecret: string;

  constructor(
    private readonly contractsService: ContractsService,
    private readonly configService: ConfigService,
    // Inject the SignatureService
    private readonly signatureService: SignatureService,
  ) {
    // Initialize hash secrets from environment variables
    this.policyHashSecret =
      this.configService.get<string>('POLICY_HASH_SECRET') || '';
    this.claimHashSecret =
      this.configService.get<string>('CLAIM_HASH_SECRET') || '';

    if (!this.policyHashSecret || !this.claimHashSecret) {
      this.logger.error('Missing hash secrets in environment variables');
      throw new Error('Hash secrets must be provided in environment');
    }
  }

  // Generate a secure policy ID using keccak256
  private generatePolicyId(userId: string, timestamp: number): string {
    const data = `${userId}-${timestamp}`;
    // Use keccak256 instead of HMAC
    const hash = keccak256(toUtf8Bytes(data));

    return `POLICY-${hash}`;
  }

  // Hash document data for claims using keccak256
  private hashDocument(documentData: string): string {
    // Use keccak256 instead of HMAC
    return keccak256(toUtf8Bytes(documentData));
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

  async cancelPolicy(
    policyId: string,
    refundAmount: number,
    signature: string,
  ): Promise<number> {
    const policy = this.findByPolicyId(policyId);
    if (!policy) throw new Error('Policy not found');
    if (!policy.isActive) throw new Error('Policy already inactive');

    try {
      // Get chain ID for the signature
      const { chainId } = await this.contractsService.getNetworkInfo();

      // Convert refund from THB to ETH
      const ethToThbRate = await this.getEthToThbRateFromCache();
      const refundAmountInEth = refundAmount / ethToThbRate;
      const refundAmountInWei = BigInt(Math.floor(refundAmountInEth * 1e18));

      // Generate the message hash - must match contract's expectation
      const messageHash = this.getCancellationHash(
        policyId,
        policy.userId,
        refundAmountInWei,
        toNumberSafe(chainId),
      );

      // Verify admin signature with SignatureService
      const isValid = this.signatureService.verifySignature(
        messageHash,
        signature,
      );
      if (!isValid) throw new Error('Invalid admin signature');

      // Call contract to cancel policy
      const txHash = await this.contractsService.cancelPolicy(
        policyId,
        refundAmountInWei,
        signature,
      );

      // Update policy status locally
      policy.isActive = false;
      this.savePolicy(policy);

      this.logger.log(`Policy canceled: ${policyId} with TX: ${txHash}`);
      return refundAmount;
    } catch (error: any) {
      this.logger.error(`Failed to cancel policy: ${error.message}`);
      throw new Error(`Policy cancellation failed: ${error.message}`);
    }
  }

  // Add this method to your LifeCareLiteService class
  private getMessageHash(
    ageOrPolicyId: number | string,
    genderOrPremiumOrAmount: string | number,
    occupationOrDocumentHash?: string,
    sumAssured?: number,
    premiumInThb?: number,
  ): string {
    // Case 1: Premium calculation - all 5 arguments provided
    if (
      typeof ageOrPolicyId === 'number' &&
      typeof genderOrPremiumOrAmount === 'string' &&
      occupationOrDocumentHash &&
      sumAssured !== undefined &&
      premiumInThb !== undefined
    ) {
      const message = `${ageOrPolicyId},${genderOrPremiumOrAmount},${occupationOrDocumentHash},${sumAssured},${premiumInThb}`;
      return keccak256(toUtf8Bytes(message));
    }

    // Case 2: Policy cancellation or claim approval - policyId and premium/amount
    if (
      typeof ageOrPolicyId === 'string' &&
      typeof genderOrPremiumOrAmount === 'number' &&
      occupationOrDocumentHash === undefined
    ) {
      const message = `${ageOrPolicyId},${genderOrPremiumOrAmount}`;
      return keccak256(toUtf8Bytes(message));
    }

    // Case 3: Claim filing - policyId, amount, and documentHash
    if (
      typeof ageOrPolicyId === 'string' &&
      typeof genderOrPremiumOrAmount === 'number' &&
      occupationOrDocumentHash
    ) {
      const message = `${ageOrPolicyId},${genderOrPremiumOrAmount},${occupationOrDocumentHash}`;
      return keccak256(toUtf8Bytes(message));
    }

    throw new Error('Invalid message hash parameters');
  }

  // Save policy data to a local file
  private savePolicy(policy: LifeCarePolicy) {
    const policies = this.findAll();
    const index = policies.findIndex((p) => p.policyId === policy.policyId);
    if (index !== -1) policies[index] = policy;
    else policies.push(policy);

    fs.writeFileSync(this.mockFile, JSON.stringify(policies, null, 2));
  }

  // Hash policy data for the blockchain using keccak256
  private hashPolicyData(
    userId: string,
    fullName: string,
    age: number,
    gender: string,
    occupation: string,
    contactInfo: string,
  ): string {
    const policyData = `${userId},${fullName},${age},${gender},${occupation},${contactInfo}`;
    // Use keccak256 instead of HMAC
    return keccak256(toUtf8Bytes(policyData));
  }

  findAll(): LifeCarePolicy[] {
    if (!fs.existsSync(this.mockFile)) return [];
    const data = fs.readFileSync(this.mockFile, 'utf-8');
    return JSON.parse(data) as LifeCarePolicy[];
  }

  findByPolicyId(policyId: string): LifeCarePolicy | undefined {
    const policies = this.findAll();
    return policies.find((policy) => policy.policyId === policyId);
  }

  calculatePremium(
    age: number,
    gender: string,
    occupation: string,
    sumAssured: number,
  ): number {
    // Base premium factors
    let baseThbPremium = 100; // Start at 100 THB per 100,000 THB of coverage

    // Age factor (risk increases with age)
    if (age < 25)
      baseThbPremium -= 20; // Younger, generally healthier
    else if (age < 40)
      baseThbPremium += 30; // Working age, moderate risk
    else if (age < 60)
      baseThbPremium += 70; // Middle-aged, higher risk
    else baseThbPremium += 120; // Elderly, highest risk

    // Gender factor (statistical life expectancy difference)
    if (gender.toLowerCase() === 'female') baseThbPremium -= 10; // Women generally live longer

    // Occupation factor (risk level by profession)
    switch (occupation.toLowerCase()) {
      case 'soldier':
      case 'firefighter':
      case 'police':
        baseThbPremium += 100; // High-risk professions
        break;
      case 'construction worker':
      case 'miner':
      case 'pilot':
        baseThbPremium += 80; // Moderate to high-risk professions
        break;
      case 'teacher':
      case 'office worker':
      case 'software engineer':
        baseThbPremium += 20; // Low-risk professions
        break;
      default:
        baseThbPremium += 40; // General occupations
    }

    // Calculate total premium
    const totalThb = (baseThbPremium * sumAssured) / 100000;

    return totalThb;
  }

  // Modified to accept optional premiumInThb parameter for signature verification
  // Modify the calculatePremiumInEth method to ensure exact message format consistency
  async calculatePremiumInEth(
    age: number,
    gender: string,
    occupation: string,
    sumAssured: number,
    signature: string,
    premiumInThb?: number, // Optional parameter for signature verification
  ): Promise<number> {
    const ethToThb = await this.getEthToThbRateFromCache();
    const calculatedPremiumInThb = this.calculatePremium(
      age,
      gender,
      occupation,
      sumAssured,
    );

    // If premiumInThb was provided, use it for signature verification
    // Otherwise use the calculated value
    const verificationPremium =
      premiumInThb !== undefined ? premiumInThb : calculatedPremiumInThb;

    // Format the premium consistently to 6 decimal places - FOR SIGNATURE ONLY
    const formattedPremium = Number(verificationPremium).toFixed(6);

    // Create message with properly formatted premium
    const message = `${age},${gender},${occupation},${sumAssured},${formattedPremium}`;
    this.logger.debug(`Message for verification: ${message}`);

    // Hash the message
    const messageHash = keccak256(toUtf8Bytes(message));
    this.logger.debug(`Message hash for verification: ${messageHash}`);

    // Verify signature using SignatureService
    const isValid = this.signatureService.verifySignature(
      messageHash,
      signature,
    );
    if (!isValid) {
      this.logger.error('Invalid signature during premium calculation');
      this.logger.debug(
        `Parameters: age=${age}, gender=${gender}, occupation=${occupation}, sumAssured=${sumAssured}, premium=${formattedPremium}`,
      );
      throw new Error('Invalid admin signature');
    }

    return calculatedPremiumInThb / ethToThb;
  }

  // Allocate reserve for future claims (20% of sum assured)
  private allocateReserve(sumAssured: number): number {
    const reserveAmount = sumAssured * 0.2;
    this.logger.log(
      `Allocated reserve: ${reserveAmount} THB for sum assured: ${sumAssured} THB`,
    );
    return reserveAmount;
  }

  // Replace the overloaded getMessageHash methods with specific purpose methods:
  private getPolicyPurchaseHash(
    userAddress: string,
    premiumWei: bigint,
    sumAssuredWei: bigint,
    duration: bigint,
    chainId: number,
  ): string {
    return ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [userAddress, premiumWei, sumAssuredWei, duration, BigInt(chainId)],
    );
  }

  private getClaimHash(
    policyId: string,
    amount: bigint, // Changed from number to bigint to match usage
    documentHash: string,
    chainId: number,
  ): string {
    return generateClaimHash(
      policyId,
      toNumberSafe(amount),
      documentHash,
      chainId,
    );
  }

  private getCancellationHash(
    policyId: string,
    owner: string,
    refundAmount: bigint, // Changed from number to bigint to match usage
    chainId: number,
  ): string {
    return generateCancelHash(
      policyId,
      owner,
      toNumberSafe(refundAmount),
      chainId,
    );
  }

  async purchasePolicy(
    userId: string,
    fullName: string,
    age: number,
    gender: string,
    occupation: string,
    contactInfo: string,
    sumAssured: number,
    premium: number, // This is in THB
    signature: string,
  ): Promise<LifeCarePolicy> {
    const timestamp = Date.now();
    const policyId = this.generatePolicyId(userId, timestamp);

    try {
      // 🔄 Convert premium and sum assured to Wei
      const ethToThbRate = await this.getEthToThbRateFromCache();
      const premiumInWei = BigInt(Math.floor((premium / ethToThbRate) * 1e18));
      const sumAssuredInWei = BigInt(
        Math.floor((sumAssured / ethToThbRate) * 1e18),
      );

      // Set the duration for 80 years in seconds
      const duration = BigInt(80 * 365 * 24 * 60 * 60);

      // Fetch the chain ID for signature verification
      const { chainId } = await this.contractsService.getNetworkInfo();

      this.logger.log(`
        === POLICY SIGNATURE VERIFICATION DETAILS ===
        Owner address: ${userId}
        Premium (Wei): ${premiumInWei}
        Sum Assured (Wei): ${sumAssuredInWei}
        Duration (seconds): ${duration}
        Chain ID: ${chainId}
        Signature: ${signature}
        `);

      // Generate the message hash exactly as it was created in the signature script
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [userId, premiumInWei, sumAssuredInWei, duration, BigInt(chainId)],
      );

      // แปลงเป็น Ethereum Signed Message Hash
      const ethSignedMessageHash = ethers.hashMessage(
        ethers.getBytes(messageHash),
      );

      console.log('Message Hash (Raw):', messageHash);
      console.log('Ethereum Signed Message Hash:', ethSignedMessageHash);

      // ใช้ SignatureService แทน ethers.recoverAddress โดยตรง
      const isValid = this.signatureService.verifySignature(
        messageHash,
        signature,
      );
      if (!isValid) {
        this.logger.error('Policy signature verification failed');
        throw new Error('Invalid admin signature');
      }

      // 📝 Save the policy locally
      const policy: LifeCarePolicy = {
        policyId,
        userId,
        fullName,
        age,
        gender,
        occupation,
        contactInfo,
        premium,
        sumAssured,
        expiry: timestamp + Number(duration) * 1000,
        maturityDate: timestamp + Number(duration) * 1000,
        isActive: true,
        claimAmount: 0,
      };

      this.savePolicy(policy);
      this.logger.log(`Policy saved locally: ${JSON.stringify(policy)}`);

      return policy;
    } catch (error: any) {
      this.logger.error(`Failed to purchase policy: ${error.message}`);
      throw new Error(`Policy purchase failed: ${error.message}`);
    }
  }

  // Updated to align with smart contract
  async fileClaim(
    policyId: string,
    userId: string,
    amount: number,
    documentData: string,
    signature: string,
  ): Promise<ClaimRequest> {
    const policy = this.findByPolicyId(policyId);
    if (!policy) throw new Error('Policy not found');
    if (!policy.isActive) throw new Error('Policy not active');
    if (amount > policy.sumAssured - policy.claimAmount) {
      throw new Error('Claim amount exceeds available coverage');
    }

    try {
      // Generate document hash using keccak256
      const documentHash = this.hashDocument(documentData);

      // Get chain ID for the signature
      const { chainId } = await this.contractsService.getNetworkInfo();

      // Convert claim amount from THB to ETH if needed
      const ethToThbRate = await this.getEthToThbRateFromCache();
      const claimAmountInEth = amount / ethToThbRate;
      const claimAmountInWei = BigInt(Math.floor(claimAmountInEth * 1e18));

      // Generate the message hash
      const messageHash = this.getClaimHash(
        policyId,
        claimAmountInWei, // Pass bigint directly to match parameter type
        documentHash,
        toNumberSafe(chainId),
      );

      // Verify admin signature using SignatureService
      const isValid = this.signatureService.verifySignature(
        messageHash,
        signature,
      );
      if (!isValid) throw new Error('Invalid admin signature');

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

      // Submit claim to blockchain
      const txHash = await this.contractsService.submitClaim(
        policyId,
        toNumberSafe(claimAmountInWei),
        documentHash,
        signature,
      );

      this.logger.log(`Claim submitted to blockchain with TX: ${txHash}`);
      return claim;
    } catch (error: any) {
      this.logger.error(`Failed to file claim: ${error.message}`);
      throw new Error(`Claim filing failed: ${error.message}`);
    }
  }

  private saveClaim(claim: ClaimRequest) {
    const claims = this.getAllClaims();
    claims.push(claim);
    fs.writeFileSync(this.claimsFile, JSON.stringify(claims, null, 2));
  }

  private getAllClaims(): ClaimRequest[] {
    if (!fs.existsSync(this.claimsFile)) return [];
    const data = fs.readFileSync(this.claimsFile, 'utf-8');
    return JSON.parse(data) as ClaimRequest[];
  }

  // Updated to align with smart contract
  async approveClaim(policyId: string, signature: string): Promise<number> {
    // Find the pending claim
    const claims = this.getAllClaims();
    const claimIndex = claims.findIndex(
      (c) => c.policyId === policyId && c.isPending,
    );

    if (claimIndex === -1)
      throw new Error('No pending claim found for this policy');

    const claim = claims[claimIndex];

    // Find the policy
    const policy = this.findByPolicyId(policyId);
    if (!policy) throw new Error('Policy not found');
    if (!policy.isActive) throw new Error('Policy not active');

    try {
      // Approve claim on blockchain - no need to verify signature again as we're using admin role
      const txHash = await this.contractsService.approveClaim(policyId);

      // Update claim status
      claims[claimIndex].isPending = false;
      claims[claimIndex].approvedAt = Date.now();
      fs.writeFileSync(this.claimsFile, JSON.stringify(claims, null, 2));

      // Update policy's claimed amount
      policy.claimAmount += claim.amount;
      if (policy.claimAmount >= policy.sumAssured) {
        policy.isActive = false;
      }
      this.savePolicy(policy);

      this.logger.log(`Claim approved on blockchain with TX: ${txHash}`);
      this.logger.log(
        `Claim approved for policy: ${policyId}, amount: ${claim.amount}`,
      );

      return claim.amount;
    } catch (error: any) {
      this.logger.error(
        `Failed to approve claim on blockchain: ${error.message}`,
      );
      throw new Error('Blockchain claim approval failed');
    }
  }

  // Added to calculate refund amount based on the smart contract method
  async calculateRefund(policyId: string): Promise<number> {
    try {
      // Call the smart contract method
      const refundAmountWei =
        await this.contractsService.calculateRefund(policyId);

      // Convert Wei to ETH
      const refundAmountEth = Number(refundAmountWei) / 1e18;

      // Convert ETH to THB
      const ethToThbRate = await this.getEthToThbRateFromCache();
      const refundAmountThb = refundAmountEth * ethToThbRate;

      return refundAmountThb;
    } catch (error: any) {
      this.logger.error(`Failed to calculate refund: ${error.message}`);
      throw new Error(`Refund calculation failed: ${error.message}`);
    }
  }
}
