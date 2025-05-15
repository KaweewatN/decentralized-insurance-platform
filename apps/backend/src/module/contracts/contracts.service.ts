import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ContractsService {
  private logger = new Logger(ContractsService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private healthCareLiteContract: ethers.Contract;
  private lifeCareLiteContract: ethers.Contract;
  private vaultContract: ethers.Contract; // เพิ่ม vault contract

  private readonly MAX_DURATION = 80 * 365 * 24 * 60 * 60;

  constructor() {
    this.initializeBlockchainConnection();
  }

  private initializeBlockchainConnection() {
    try {
      const rpcUrl = process.env.SEPOLIA_RPC?.trim();
      const privateKey = process.env.PRIVATE_KEY?.trim();
      const healthCareLiteAddress = process.env.HEALTHCARE_LITE_ADDRESS?.trim();
      const lifeCareLiteAddress = process.env.LIFECARE_LITE_ADDRESS?.trim();
      const vaultAddress = process.env.VAULT_ADDRESS?.trim(); // เพิ่มตัวแปรสำหรับ vault address

      if (!rpcUrl || !privateKey) {
        throw new Error(
          'SEPOLIA_RPC or PRIVATE_KEY environment variable is missing',
        );
      }

      if (!healthCareLiteAddress || !lifeCareLiteAddress) {
        throw new Error(
          'HEALTHCARE_LITE_ADDRESS or LIFECARE_LITE_ADDRESS environment variable is missing',
        );
      }

      if (!vaultAddress) {
        this.logger.warn(
          'VAULT_ADDRESS environment variable is missing. Some functionalities may not work properly.',
        );
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.logger.log(
        `✅ Wallet initialized with address: ${this.wallet.address}`,
      );

      // Initialize HealthCareLite contract
      const healthCareLiteABI =
        require('../../../abis/contracts/plans/HealthCareLite.sol/HealthCareLite.json').abi;
      this.healthCareLiteContract = new ethers.Contract(
        healthCareLiteAddress,
        healthCareLiteABI,
        this.wallet,
      );
      this.logger.log(
        `✅ HealthCareLite contract initialized at: ${healthCareLiteAddress}`,
      );

      // Initialize LifeCareLite contract
      const lifeCareLiteABI =
        require('../../../abis/contracts/plans/LifeCareLite.sol/LifeCareLite.json').abi;
      this.lifeCareLiteContract = new ethers.Contract(
        lifeCareLiteAddress,
        lifeCareLiteABI,
        this.wallet,
      );
      this.logger.log(
        `✅ LifeCareLite contract initialized at: ${lifeCareLiteAddress}`,
      );

      // Initialize Vault contract if address is provided
      if (vaultAddress) {
        try {
          const vaultABI =
            require('../../../abis/contracts/utils/InsuranceVault.sol/InsuranceVault.json').abi;
          this.vaultContract = new ethers.Contract(
            vaultAddress,
            vaultABI,
            this.wallet,
          );
          this.logger.log(
            `✅ InsuranceVault contract initialized at: ${vaultAddress}`,
          );
        } catch (error) {
          this.logger.error(`❌ Failed to initialize vault contract`, error);
        }
      }
    } catch (error) {
      this.logger.error('❌ Failed to initialize blockchain connection', error);
      throw error;
    }
  }

  async deployContract(
    contractName: string,
    trustedSigner: string,
    vaultAddress: string,
  ): Promise<string> {
    try {
      const cleanName = contractName.trim();

      // Special case for deploying InsuranceVault
      if (cleanName === 'InsuranceVault') {
        return this.deployVault();
      }

      const artifactPath = path.resolve(
        __dirname,
        '../../artifacts/contracts/plans',
        `${cleanName}.sol`,
        `${cleanName}.json`,
      );

      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Contract artifact not found: ${artifactPath}`);
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));

      if (!artifact.abi || !artifact.bytecode) {
        throw new Error(`Invalid ABI format in: ${artifactPath}`);
      }

      const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        this.wallet,
      );

      // 📌 Both contracts now require trustedSigner and vaultAddress
      const contract = await factory.deploy(trustedSigner, vaultAddress);
      await contract.waitForDeployment();
      const address = await contract.getAddress();

      this.logger.log(`✅ ${cleanName} deployed at: ${address}`);
      return address;
    } catch (error) {
      this.logger.error(`❌ Failed to deploy contract: ${error.message}`);
      throw error;
    }
  }

  // ใน ContractsService
  async deployVault(ownerAddress?: string): Promise<string> {
    try {
      const artifactPath = path.resolve(
        __dirname,
        '../../artifacts/contracts/utils',
        'InsuranceVault.sol',
        'InsuranceVault.json',
      );

      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Vault artifact not found: ${artifactPath}`);
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));

      if (!artifact.abi || !artifact.bytecode) {
        throw new Error(`Invalid ABI format in: ${artifactPath}`);
      }

      const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        this.wallet,
      );

      // ใช้ address ที่กำหนดหรือ wallet address หากไม่ได้ระบุ
      const owner = ownerAddress || this.wallet.address;
      this.logger.log(`Deploying InsuranceVault with owner: ${owner}`);

      // Deploy vault with specified owner address
      const deployedContract = await factory.deploy(owner);
      await deployedContract.waitForDeployment();
      const address = await deployedContract.getAddress();

      // สร้าง Contract instance ใหม่
      this.vaultContract = new ethers.Contract(
        address,
        artifact.abi,
        this.wallet,
      );

      this.logger.log(
        `✅ InsuranceVault deployed at: ${address} with owner: ${owner}`,
      );
      return address;
    } catch (error) {
      this.logger.error(`❌ Failed to deploy vault: ${error.message}`);
      throw error;
    }
  }
  async getNetworkInfo() {
    const network = await this.provider.getNetwork();
    return network;
  }

  // ✅ ใช้ solidityPackedKeccak256 เพื่อให้ตรงกับ smart contract
  async createPolicySignature(
    owner: string,
    premium: bigint,
    sumAssured: bigint,
    duration: number,
  ): Promise<string> {
    // ดึง chain ID จาก provider
    const network = await this.provider.getNetwork();
    const chainId = network.chainId;

    // สร้าง message hash ในรูปแบบเดียวกับที่สมาร์ทคอนแทรคต์ใช้
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [owner, premium, sumAssured, BigInt(duration), BigInt(chainId)],
      ),
    );

    // ลงลายมือชื่อด้วยรูปแบบที่ถูกต้อง
    const signature = await this.wallet.signMessage(
      ethers.getBytes(messageHash),
    );

    this.logger.log(`✅ สร้าง signature สำเร็จ: ${signature}`);
    return signature;
  }

  // Add these cache variables as class properties
  private ethToThbRateCache: number = 0;
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  async getEthToThbRate(): Promise<number> {
    const now = Date.now();

    // If we have a cached value that's less than cache duration, use it
    if (
      this.ethToThbRateCache > 0 &&
      now - this.lastUpdateTime < this.CACHE_DURATION
    ) {
      const remainingSeconds = Math.floor(
        (this.CACHE_DURATION - (now - this.lastUpdateTime)) / 1000,
      );
      this.logger.log(
        `💰 [Cache] Using cached ETH/THB rate: ${this.ethToThbRateCache.toFixed(2)} THB (valid for ${remainingSeconds} seconds)`,
      );
      return this.ethToThbRateCache;
    }

    // Otherwise, fetch a new rate
    // 1) Coinbase
    try {
      const cb = await axios.get(
        'https://api.coinbase.com/v2/prices/ETH-THB/spot',
      );
      const cbRate = parseFloat(cb.data.data.amount);

      // Store in cache
      this.ethToThbRateCache = cbRate;
      this.lastUpdateTime = now;

      this.logger.log(
        `💰 [Coinbase] 1 ETH = ${cbRate.toFixed(2)} THB (cached for ${this.CACHE_DURATION / 60000} minutes)`,
      );
      return cbRate;
    } catch (e1) {
      this.logger.warn('⚠️ Coinbase ETH→THB failed, trying Bitkub...', e1);
    }

    // 2) Bitkub
    try {
      const bk = await axios.get('https://api.bitkub.com/api/market/ticker');
      const bkRate = parseFloat(bk.data.ETH_THB.last);

      // Store in cache
      this.ethToThbRateCache = bkRate;
      this.lastUpdateTime = now;

      this.logger.log(
        `💰 [Bitkub] 1 ETH = ${bkRate.toFixed(2)} THB (cached for ${this.CACHE_DURATION / 60000} minutes)`,
      );
      return bkRate;
    } catch (e2) {
      this.logger.warn(
        '⚠️ Bitkub ETH→THB failed, falling back to Binance+FX...',
        e2,
      );
    }

    // 3) Binance + FX
    try {
      const [ethUsdRes, fxRes] = await Promise.all([
        axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
        axios.get('https://open.er-api.com/v6/latest/USD'),
      ]);
      const ethUsd = parseFloat(ethUsdRes.data.price);
      const usdToThb = fxRes.data.rates.THB;
      const fallbackRate = ethUsd * usdToThb;

      // Store in cache
      this.ethToThbRateCache = fallbackRate;
      this.lastUpdateTime = now;

      this.logger.log(
        `💰 [Binance+FX] 1 ETH = ${fallbackRate.toFixed(2)} THB (cached for ${this.CACHE_DURATION / 60000} minutes)`,
      );
      return fallbackRate;
    } catch (e3) {
      this.logger.error('❌ All ETH→THB fetch methods failed', e3);
      throw new Error('Failed to fetch ETH to THB conversion rate');
    }
  }

  getCurrentCachedRate(): { rate: number; expiresIn: number } {
    const now = Date.now();
    if (
      this.ethToThbRateCache > 0 &&
      now - this.lastUpdateTime < this.CACHE_DURATION
    ) {
      const expiresIn = Math.floor(
        (this.CACHE_DURATION - (now - this.lastUpdateTime)) / 1000,
      );
      return {
        rate: this.ethToThbRateCache,
        expiresIn, // seconds remaining
      };
    }
    return { rate: 0, expiresIn: 0 };
  }

  // Improved implementation for purchaseLifePolicy to better align with the contract
  async purchaseLifePolicy(
    user: string,
    premiumWei: bigint,
    sumAssuredWei: bigint,
    duration: number,
    signature: string,
  ): Promise<string> {
    try {
      // Validate duration doesn't exceed maximum
      if (duration > this.MAX_DURATION) {
        throw new Error(
          `Duration exceeds maximum allowed (${this.MAX_DURATION} seconds)`,
        );
      }

      this.logger.log(
        `Calling LifeCareLite.purchasePolicy with:
       - user: ${user}
       - premiumWei: ${premiumWei}
       - sumAssuredWei: ${sumAssuredWei}
       - duration: ${duration}`,
      );

      // Call the contract method with the exact same order of parameters
      const tx = await this.lifeCareLiteContract.purchasePolicy(
        user,
        premiumWei,
        sumAssuredWei,
        duration,
        signature,
        {
          value: premiumWei, // Send the premium amount as ETH with the transaction
        },
      );

      const receipt = await tx.wait();
      this.logger.log(
        `✅ LifeCareLite policy purchased with TX: ${receipt.hash}`,
      );
      return receipt.hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to purchase LifeCareLite policy: ${error.message}`,
      );
      throw error;
    }
  }

  // Improved implementation for purchaseHealthPolicy to better align with contract expectations
  async purchaseHealthPolicy(
    user: string,
    policyDataHash: string,
    sumAssured: number,
    premium: number, // This is already in ETH
    signature: string,
  ): Promise<string> {
    try {
      const policyData = ethers.toUtf8Bytes(policyDataHash);

      // Convert premium from ETH float to wei string with proper precision
      const formattedPremium = Number(premium.toFixed(6)).toString();
      const premiumWei = ethers.parseEther(formattedPremium);

      // Log the transaction details for debugging
      this.logger.log(
        `Calling HealthCareLite.purchaseHealthPolicy with:
       - user: ${user}
       - policyData: ${policyDataHash}
       - premiumWei: ${premiumWei}
       - sumAssured: ${sumAssured}
       - signature: ${signature.substring(0, 10)}...`,
      );

      const tx = await this.healthCareLiteContract.purchaseHealthPolicy(
        user,
        policyData,
        premiumWei,
        sumAssured,
        0, // This parameter appears to be unused or has a default value
        signature,
        {
          value: premiumWei, // Send the premium amount as ETH with the transaction
        },
      );

      const receipt = await tx.wait();
      this.logger.log(
        `✅ HealthCareLite policy purchased with TX: ${receipt.hash}`,
      );
      return receipt.hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to purchase HealthCareLite policy: ${error.message}`,
      );
      throw error;
    }
  }

  async calculateRefund(policyId: string): Promise<number> {
    try {
      const refundWei =
        await this.healthCareLiteContract.calculateRefund(policyId);
      return parseFloat(ethers.formatEther(refundWei));
    } catch (error) {
      this.logger.error(`❌ Failed to calculate refund: ${error.message}`);
      throw error;
    }
  }

  async submitClaim(
    policyId: string,
    amount: number,
    documentHash: string,
    signature: string,
  ): Promise<string> {
    try {
      const tx = await this.healthCareLiteContract.fileClaim(
        policyId,
        amount,
        documentHash,
        signature,
      );
      const receipt = await tx.wait();
      this.logger.log(`✅ Claim submitted with TX: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      this.logger.error(`❌ Failed to submit claim: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calls the on-chain cancelPolicy(bytes32,uint256,bytes) method
   * This no longer needs to send ETH with the transaction since vault handles payments
   */
  async cancelPolicy(
    policyId: string, // 0x-prefixed 32-byte hex string
    refundWei: bigint, // Wei amount to refund
    signature: string, // 0x-prefixed signature
  ): Promise<string> {
    try {
      this.logger.log(`⏳ Cancelling policy on-chain:
      • policyId: ${policyId}
      • refundWei: ${refundWei}
    `);

      // No need to send ETH with the transaction anymore - vault handles the refund
      const tx = await this.lifeCareLiteContract.cancelPolicy(
        policyId,
        refundWei,
        signature,
      );

      const receipt = await tx.wait();
      this.logger.log(
        `✅ cancelPolicy succeeded, txHash=${receipt.transactionHash}`,
      );
      return receipt.transactionHash;
    } catch (err: any) {
      this.logger.error(`❌ cancelLifePolicy failed: ${err.message}`);
      throw err;
    }
  }

  async approveClaim(policyId: string): Promise<string> {
    try {
      // Use lifeCareLiteContract and only pass policyId
      const tx = await this.lifeCareLiteContract.approveClaim(policyId);
      const receipt = await tx.wait();
      this.logger.log(`✅ Claim approved with TX: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      this.logger.error(`❌ Failed to approve claim: ${error.message}`);
      throw error;
    }
  }

  // Helper functions
  private getPolicyStatusString(statusCode: number): string {
    const statusMap: Record<number, string> = {
      0: 'Inactive',
      1: 'Active',
      2: 'Claimed',
      3: 'Cancelled',
      4: 'Expired',
    };
    return statusMap[statusCode] || 'Unknown';
  }

  private getClaimStatusString(statusCode: number): string {
    const statusMap: Record<number, string> = {
      0: 'None',
      1: 'Pending',
      2: 'Approved',
      3: 'Rejected',
      4: 'Expired',
    };
    return statusMap[statusCode] || 'Unknown';
  }

  // Vault-specific methods

  /**
   * Get the current balance of the vault
   */
  async getVaultBalance(): Promise<string> {
    try {
      this.ensureVaultInitialized();
      const balance = await this.vaultContract.getVaultBalance();
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`❌ Failed to get vault balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send funds from vault to a specific address
   */
  async sendFundsFromVault(
    toAddress: string,
    amountEth: number,
  ): Promise<string> {
    try {
      this.ensureVaultInitialized();
      const amountWei = ethers.parseEther(amountEth.toString());
      const tx = await this.vaultContract.withdrawFunds(toAddress, amountWei);
      const receipt = await tx.wait();
      this.logger.log(`✅ Funds sent from vault with TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`❌ Failed to send funds from vault: ${error.message}`);
      throw error;
    }
  }

  // Helper to ensure vault is initialized
  private ensureVaultInitialized() {
    if (!this.vaultContract) {
      throw new Error(
        'Vault contract is not initialized. Make sure VAULT_ADDRESS is set in .env',
      );
    }
  }

  // Additional methods from original code (no changes needed)

  async getLifePolicy(policyId: string): Promise<any> {
    try {
      // Implement fetching policy details from the blockchain
      const policy = await this.lifeCareLiteContract.policies(policyId);

      // Format the policy data for the response
      return {
        policyId: policyId,
        owner: policy.owner,
        premium: ethers.formatEther(policy.premium),
        sumAssured: ethers.formatEther(policy.sumAssured),
        startTime: new Date(Number(policy.startTime) * 1000),
        endTime: new Date(Number(policy.endTime) * 1000),
        status: this.getPolicyStatusString(Number(policy.status)),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch life policy: ${error.message}`);
      throw error;
    }
  }

  async getLifeClaim(policyId: string): Promise<any> {
    try {
      // Implement fetching claim details from the blockchain
      const claim = await this.lifeCareLiteContract.claims(policyId);

      // Format the claim data for the response
      return {
        policyId: policyId,
        amount: ethers.formatEther(claim.amount),
        documentHash: claim.documentHash,
        timestamp: new Date(Number(claim.timestamp) * 1000),
        status: this.getClaimStatusString(Number(claim.status)),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch life claim: ${error.message}`);
      throw error;
    }
  }

  async renewLifePolicy(
    policyId: string,
    premium: number,
    duration: number,
    signature: string,
  ): Promise<string> {
    try {
      // Convert premium to wei
      const premiumWei = ethers.parseEther(premium.toString());

      const tx = await this.lifeCareLiteContract.renewPolicy(
        policyId,
        premiumWei,
        duration,
        signature,
        {
          value: premiumWei, // Send the premium amount with the transaction
        },
      );

      const receipt = await tx.wait();
      this.logger.log(`✅ Life policy renewed with TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`❌ Failed to renew life policy: ${error.message}`);
      throw error;
    }
  }

  async markLifePolicyExpired(policyId: string): Promise<string> {
    try {
      const tx = await this.lifeCareLiteContract.markPolicyAsExpired(policyId);
      const receipt = await tx.wait();
      this.logger.log(
        `✅ Life policy marked as expired with TX: ${receipt.hash}`,
      );
      return receipt.hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to mark life policy as expired: ${error.message}`,
      );
      throw error;
    }
  }

  async emergencyFundsWithdraw(amount: number): Promise<string> {
    try {
      // Convert amount to wei
      const amountWei = ethers.parseEther(amount.toString());

      const tx = await this.lifeCareLiteContract.emergencyWithdraw(amountWei);
      const receipt = await tx.wait();
      this.logger.log(
        `✅ Emergency withdrawal completed with TX: ${receipt.hash}`,
      );
      return receipt.hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to perform emergency withdrawal: ${error.message}`,
      );
      throw error;
    }
  }

  async updateTrustedSigner(newSigner: string): Promise<string> {
    try {
      const tx = await this.lifeCareLiteContract.setTrustedSigner(newSigner);
      const receipt = await tx.wait();
      this.logger.log(`✅ Trusted signer updated with TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`❌ Failed to update trusted signer: ${error.message}`);
      throw error;
    }
  }

  async updateClaimExpiryPeriod(periodInDays: number): Promise<string> {
    try {
      // Convert days to seconds
      const periodInSeconds = periodInDays * 24 * 60 * 60;

      const tx =
        await this.lifeCareLiteContract.setClaimExpiryPeriod(periodInSeconds);
      const receipt = await tx.wait();
      this.logger.log(
        `✅ Claim expiry period updated with TX: ${receipt.hash}`,
      );
      return receipt.hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to update claim expiry period: ${error.message}`,
      );
      throw error;
    }
  }

  async addAdminRole(newAdmin: string): Promise<string> {
    try {
      // Assuming there's an ADMIN_ROLE constant in the contract
      const ADMIN_ROLE = await this.lifeCareLiteContract.ADMIN_ROLE();

      const tx = await this.lifeCareLiteContract.grantRole(
        ADMIN_ROLE,
        newAdmin,
      );
      const receipt = await tx.wait();
      this.logger.log(`✅ Admin role granted with TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`❌ Failed to grant admin role: ${error.message}`);
      throw error;
    }
  }

  async removeAdminRole(admin: string): Promise<string> {
    try {
      // Assuming there's an ADMIN_ROLE constant in the contract
      const ADMIN_ROLE = await this.lifeCareLiteContract.ADMIN_ROLE();

      const tx = await this.lifeCareLiteContract.revokeRole(ADMIN_ROLE, admin);
      const receipt = await tx.wait();
      this.logger.log(`✅ Admin role revoked with TX: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`❌ Failed to revoke admin role: ${error.message}`);
      throw error;
    }
  }
}
