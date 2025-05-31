import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';

@Injectable()
export class Web3Service implements OnModuleInit {
  private readonly logger = new Logger(Web3Service.name);
  private web3: Web3;
  private adminAccount: any;
  private healthContract: any;
  private lifeContract: any;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    try {
      // Initialize Web3 with Sepolia
      const rpcUrl = this.config.get('SEPOLIA_RPC');
      this.web3 = new Web3(rpcUrl);

      // Admin account setup
      const privateKey = this.config.get('ADMIN_PRIVATE_KEY');
      this.adminAccount = this.web3.eth.accounts.privateKeyToAccount(
        `0x${privateKey.replace('0x', '')}`,
      );
      this.web3.eth.accounts.wallet.add(this.adminAccount);
      this.web3.eth.defaultAccount = this.adminAccount.address;

      // Load contracts
      await this.loadContracts();

      // Test connection
      const blockNumber = await this.web3.eth.getBlockNumber();
      this.logger.log(`✅ Web3 connected to Sepolia. Block: ${blockNumber}`);
      this.logger.log(`👤 Admin address: ${this.adminAccount.address}`);
    } catch (error) {
      this.logger.error(`❌ Web3 initialization failed: ${error.message}`);
    }
  }

  private async loadContracts() {
    const contractAbi = [
      // Purchase Policy - NO SIGNATURE
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'premium', type: 'uint256' },
          { name: 'sumAssured', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
        ],
        name: 'purchasePolicy',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'payable',
        type: 'function',
      },

      {
        inputs: [
          { name: 'policyId', type: 'bytes32' },
          { name: 'premium', type: 'uint256' },
        ],
        name: 'renewPolicy',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      // Health-specific purchase - NO SIGNATURE
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'premium', type: 'uint256' },
          { name: 'sumAssured', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
        ],
        name: 'purchaseHealthPolicy',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'payable',
        type: 'function',
      },
      // File and Approve Claim - NO SIGNATURE
      {
        inputs: [
          { name: 'policyId', type: 'bytes32' },
          { name: 'amount', type: 'uint256' },
        ],
        name: 'fileAndApproveClaim',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      // Cancel Policy - NO SIGNATURE
      {
        inputs: [
          { name: 'policyId', type: 'bytes32' },
          { name: 'refundAmount', type: 'uint256' },
        ],
        name: 'cancelPolicy',
        stateMutability: 'nonpayable',
        type: 'function',
      },

      {
        inputs: [],
        name: 'ADMIN_ROLE',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { name: 'role', type: 'bytes32' },
          { name: 'account', type: 'address' },
        ],
        name: 'hasRole',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { name: 'role', type: 'bytes32' },
          { name: 'account', type: 'address' },
        ],
        name: 'grantRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      // Vault method
      {
        inputs: [],
        name: 'vault',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
      // View functions
      {
        inputs: [{ name: 'policyId', type: 'bytes32' }],
        name: 'getPolicy',
        outputs: [
          {
            components: [
              { name: 'policyId', type: 'bytes32' },
              { name: 'owner', type: 'address' },
              { name: 'premium', type: 'uint256' },
              { name: 'sumAssured', type: 'uint256' },
              { name: 'expiry', type: 'uint256' },
              { name: 'isActive', type: 'bool' },
              { name: 'isClaimed', type: 'bool' },
              { name: 'createdAt', type: 'uint256' },
            ],
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ name: 'policyId', type: 'bytes32' }],
        name: 'getClaim',
        outputs: [
          {
            components: [
              { name: 'amount', type: 'uint256' },
              { name: 'isPending', type: 'bool' },
            ],
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      // Health-specific functions
      {
        inputs: [{ name: 'policyId', type: 'bytes32' }],
        name: 'getRemainingCoverage',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      // Events
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: 'policyId', type: 'bytes32' },
          { indexed: true, name: 'owner', type: 'address' },
          { indexed: false, name: 'premium', type: 'uint256' },
          { indexed: false, name: 'sumAssured', type: 'uint256' },
          { indexed: false, name: 'expiry', type: 'uint256' },
        ],
        name: 'PolicyPurchased',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: 'policyId', type: 'bytes32' },
          { indexed: true, name: 'owner', type: 'address' },
          { indexed: false, name: 'amount', type: 'uint256' },
        ],
        name: 'ClaimFiled',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: 'policyId', type: 'bytes32' },
          { indexed: true, name: 'owner', type: 'address' },
          { indexed: false, name: 'amount', type: 'uint256' },
        ],
        name: 'ClaimApproved',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: 'policyId', type: 'bytes32' },
          { indexed: true, name: 'owner', type: 'address' },
          { indexed: false, name: 'refundAmount', type: 'uint256' },
        ],
        name: 'PolicyCancelled',
        type: 'event',
      },
    ];

    // Health Contract
    const healthAddress = this.config.get('HEALTHCARE_LITE_ADDRESS');
    this.healthContract = new this.web3.eth.Contract(
      contractAbi as any,
      healthAddress,
    );
    this.logger.log(`🏥 Health contract: ${healthAddress}`);

    // Life Contract
    const lifeAddress = this.config.get('LIFECARE_LITE_ADDRESS');
    this.lifeContract = new this.web3.eth.Contract(
      contractAbi as any,
      lifeAddress,
    );
    this.logger.log(`❤️ Life contract: ${lifeAddress}`);

    const adminRole = await this.lifeContract.methods.ADMIN_ROLE().call();
    const hasRole = await this.lifeContract.methods
      .hasRole(adminRole, this.adminAccount.address)
      .call();
    this.logger.log(`🛡️ Admin Role Check: ${hasRole}`);
  }

  async ensureAdminRole(type: 'health' | 'life'): Promise<string> {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      const adminRole = await contract.methods.ADMIN_ROLE().call();
      const hasRole = await contract.methods
        .hasRole(adminRole, this.adminAccount.address)
        .call();

      if (hasRole) {
        return 'Already has admin role';
      }

      this.logger.log(`🔑 Granting ADMIN_ROLE for ${type}...`);

      const gasPrice = await this.web3.eth.getGasPrice();
      const tx = await contract.methods
        .grantRole(adminRole, this.adminAccount.address)
        .send({
          from: this.adminAccount.address,
          gas: 200000,
          gasPrice: gasPrice,
        });

      this.logger.log(`✅ ADMIN_ROLE granted: ${tx.transactionHash}`);
      return tx.transactionHash;
    } catch (error) {
      this.logger.error(`❌ Grant admin role failed: ${error.message}`);
      throw error;
    }
  }
  async purchaseHealthPolicy(
    owner: string,
    premiumWei: string,
    sumAssuredWei: string,
    duration: number,
  ) {
    try {
      this.logger.log(`🛒 Purchasing health policy:`);

      const gasPrice = await this.web3.eth.getGasPrice();

      const tx = await this.healthContract.methods
        .purchasePolicy(owner, premiumWei, sumAssuredWei, duration) // NO signature
        .send({
          from: this.adminAccount.address,
          value: premiumWei,
          gas: 500000,
          gasPrice: gasPrice,
        });

      this.logger.log(`✅ Health policy: ${tx.transactionHash}`);

      let policyId = null;
      if (tx.events && tx.events.PolicyPurchased) {
        policyId = tx.events.PolicyPurchased.returnValues.policyId;
      }

      return { policyId, txHash: tx.transactionHash };
    } catch (error) {
      this.logger.error(`❌ Health policy failed: ${error.message}`);
      throw error;
    }
  }

  // 🔧 FIX: purchaseLifePolicy - NO signature
  async purchaseLifePolicy(
    owner: string,
    premiumWei: string,
    sumAssuredWei: string,
    duration: number,
  ) {
    try {
      this.logger.log(`🛒 Purchasing life policy:`);

      const gasPrice = await this.web3.eth.getGasPrice();

      const tx = await this.lifeContract.methods
        .purchasePolicy(owner, premiumWei, sumAssuredWei, duration) // NO signature
        .send({
          from: this.adminAccount.address,
          value: premiumWei,
          gas: 500000,
          gasPrice: gasPrice,
        });

      this.logger.log(`✅ Life policy: ${tx.transactionHash}`);

      let policyId = null;
      if (tx.events && tx.events.PolicyPurchased) {
        policyId = tx.events.PolicyPurchased.returnValues.policyId;
      }

      return { policyId, txHash: tx.transactionHash };
    } catch (error) {
      this.logger.error(`❌ Life policy failed: ${error.message}`);
      throw error;
    }
  }

  async cancelPolicy(
    type: 'health' | 'life',
    policyId: string,
    refundAmount: string,
  ) {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      const refundNum = parseFloat(refundAmount);
      const refundWei = this.toWei(refundNum);

      this.logger.log(`🚫 Cancelling ${type} policy:`);
      this.logger.log(`  Policy ID: ${policyId}`);
      this.logger.log(`  Refund: ${refundAmount} ETH`);

      const gasPrice = await this.web3.eth.getGasPrice();

      const tx = await contract.methods
        .cancelPolicy(policyId, refundWei) // NO signature
        .send({
          from: this.adminAccount.address,
          gas: 200000,
          gasPrice: gasPrice,
        });

      this.logger.log(`✅ Policy cancelled: ${tx.transactionHash}`);
      return tx.transactionHash;
    } catch (error) {
      this.logger.error(`❌ Cancellation failed: ${error.message}`);
      throw error;
    }
  }

  // 🔥 เพิ่ม method นี้ใน Web3Service (ก่อน fileAndApproveClaim)

  async checkVaultBalance(
    claimAmountWei: string,
    type: 'health' | 'life' = 'life',
  ) {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      this.logger.log(`💰 Checking vault balance for ${type} claim...`);
      this.logger.log(`  Required amount: ${this.fromWei(claimAmountWei)} ETH`);

      // Get vault address from contract
      const vaultAddress = await contract.methods.vault().call();
      this.logger.log(`  Vault address: ${vaultAddress}`);

      // Get vault balance
      const vaultBalance = await this.web3.eth.getBalance(vaultAddress);
      this.logger.log(`  Vault balance: ${this.fromWei(vaultBalance)} ETH`);

      // Compare balances using BigInt
      if (BigInt(vaultBalance) < BigInt(claimAmountWei)) {
        const requiredEth = this.fromWei(claimAmountWei);
        const availableEth = this.fromWei(vaultBalance);
        const shortfallEth = requiredEth - availableEth;

        this.logger.error(`❌ Insufficient vault balance:`);
        this.logger.error(`  Required: ${requiredEth.toFixed(6)} ETH`);
        this.logger.error(`  Available: ${availableEth.toFixed(6)} ETH`);
        this.logger.error(`  Shortfall: ${shortfallEth.toFixed(6)} ETH`);

        throw new Error(
          `Insufficient vault balance. Required: ${requiredEth.toFixed(6)} ETH, Available: ${availableEth.toFixed(6)} ETH, Shortfall: ${shortfallEth.toFixed(6)} ETH`,
        );
      }

      const availableEth = this.fromWei(vaultBalance);
      const requiredEth = this.fromWei(claimAmountWei);

      this.logger.log(`✅ Vault balance sufficient:`);
      this.logger.log(`  Available: ${availableEth.toFixed(6)} ETH`);
      this.logger.log(`  Required: ${requiredEth.toFixed(6)} ETH`);
      this.logger.log(
        `  Remaining after claim: ${(availableEth - requiredEth).toFixed(6)} ETH`,
      );

      return {
        sufficient: true,
        vaultAddress,
        vaultBalance: availableEth,
        claimAmount: requiredEth,
        remaining: availableEth - requiredEth,
      };
    } catch (error) {
      this.logger.error(`❌ Vault balance check failed: ${error.message}`);
      throw error;
    }
  }
  async fileAndApproveClaim(
    type: 'health' | 'life',
    policyId: string,
    amountWei: string,
  ) {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      this.logger.log(`🚀 AUTO-APPROVING ${type.toUpperCase()} CLAIM:`);
      this.logger.log(`  Policy ID: ${policyId}`);
      this.logger.log(`  Amount: ${this.fromWei(amountWei)} ETH`);

      const gasPrice = await this.web3.eth.getGasPrice();

      const tx = await contract.methods
        .fileAndApproveClaim(policyId, amountWei) // NO signature
        .send({
          from: this.adminAccount.address,
          gas: 500000,
          gasPrice: gasPrice,
        });

      this.logger.log(`✅ CLAIM PROCESSED: ${tx.transactionHash}`);

      // 🔧 FIX: Return all properties that services expect
      return {
        success: true,
        transactionHash: tx.transactionHash,
        policyId,
        claimAmount: this.fromWei(amountWei), // Amount in ETH
        claimAmountWei: amountWei, // ✅ Add missing property
        gasUsed: tx.gasUsed || 0, // ✅ Add missing property
        blockNumber: tx.blockNumber || 0, // ✅ Add missing property
      };
    } catch (error) {
      this.logger.error(`❌ CLAIM FAILED: ${error.message}`);
      throw error;
    }
  }

  // 🔧 ADD: Missing checkVaultApprovalStatus method at the end of class
  async checkVaultApprovalStatus() {
    try {
      const vaultAbi: any = [
        {
          inputs: [{ name: 'contractAddress', type: 'address' }],
          name: 'isApprovedContract',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
      ];

      const vaultAddress = this.config.get('VAULT_ADDRESS');
      const vault = new this.web3.eth.Contract(vaultAbi, vaultAddress);

      const lifecareAddress = this.config.get('LIFECARE_LITE_ADDRESS');
      const healthcareAddress = this.config.get('HEALTHCARE_LITE_ADDRESS');

      const lifecareApproved = await vault.methods
        .isApprovedContract(lifecareAddress)
        .call();
      const healthcareApproved = await vault.methods
        .isApprovedContract(healthcareAddress)
        .call();

      return {
        vaultAddress,
        contracts: {
          lifecare: {
            address: lifecareAddress,
            approved: lifecareApproved,
          },
          healthcare: {
            address: healthcareAddress,
            approved: healthcareApproved,
          },
        },
        allApproved: lifecareApproved && healthcareApproved,
      };
    } catch (error) {
      this.logger.error(
        `❌ Vault approval status check failed: ${error.message}`,
      );
      throw error;
    }
  }

  // 2. Validate Policy ID exists on blockchain
  async validatePolicyId(
    policyId: string,
    type: 'health' | 'life',
  ): Promise<boolean> {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      const policy = await contract.methods.getPolicy(policyId).call();
      const exists =
        policy.policyId !==
        '0x0000000000000000000000000000000000000000000000000000000000000000';

      this.logger.log(`🔍 Policy ${policyId} exists on blockchain: ${exists}`);

      if (exists) {
        this.logger.log(`📋 Policy Details:`, {
          owner: policy.owner,
          premium: this.fromWei(policy.premium),
          sumAssured: this.fromWei(policy.sumAssured),
          isActive: policy.isActive,
          isClaimed: policy.isClaimed,
        });
      }

      return exists;
    } catch (error) {
      this.logger.error(`❌ Policy validation failed: ${error.message}`);
      return false;
    }
  }

  // 🔍 DEBUG: Check policy state on blockchain
  async debugPolicyState(type: 'health' | 'life', policyId: string) {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      this.logger.log(
        `🔍 DEBUG: Checking ${type} policy state for: ${policyId}`,
      );

      // Try to get policy details from blockchain
      try {
        const policy = await contract.methods.getPolicy(policyId).call();
        this.logger.log(`📋 Blockchain Policy Details:`, {
          policyId: policy.policyId,
          owner: policy.owner,
          premium: this.fromWei(policy.premium),
          sumAssured: this.fromWei(policy.sumAssured),
          expiry: new Date(Number(policy.expiry) * 1000).toISOString(),
          isActive: policy.isActive,
          isClaimed: policy.isClaimed,
          createdAt: new Date(Number(policy.createdAt) * 1000).toISOString(),
        });

        return policy;
      } catch (policyError) {
        this.logger.error(
          `❌ Policy not found on blockchain: ${policyError.message}`,
        );
        return null;
      }
    } catch (error) {
      this.logger.error(`❌ Debug policy state failed: ${error.message}`);
      throw error;
    }
  }

  // 🔍 DEBUG: Check claim state on blockchain
  async debugClaimState(type: 'health' | 'life', policyId: string) {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      this.logger.log(
        `🔍 DEBUG: Checking ${type} claim state for: ${policyId}`,
      );

      try {
        const claim = await contract.methods.getClaim(policyId).call();
        this.logger.log(`📋 Blockchain Claim Details:`, {
          amount: this.fromWei(claim.amount),
          isPending: claim.isPending,
        });

        return claim;
      } catch (claimError) {
        this.logger.error(
          `❌ Claim not found on blockchain: ${claimError.message}`,
        );
        return null;
      }
    } catch (error) {
      this.logger.error(`❌ Debug claim state failed: ${error.message}`);
      throw error;
    }
  }

  // 🔍 DEBUG: Try to simulate claim approval without sending transaction
  async debugApprovalSimulation(type: 'health' | 'life', policyId: string) {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      this.logger.log(
        `🔍 DEBUG: Simulating ${type} claim approval for: ${policyId}`,
      );

      try {
        // Use .call() instead of .send() to simulate without spending gas
        const result = await contract.methods.approveClaim(policyId).call({
          from: this.adminAccount.address,
        });

        this.logger.log(`✅ Simulation successful, would return: ${result}`);
        return { success: true, result };
      } catch (simulationError) {
        this.logger.error(`❌ Simulation failed: ${simulationError.message}`);
        return { success: false, error: simulationError.message };
      }
    } catch (error) {
      this.logger.error(
        `❌ Debug approval simulation failed: ${error.message}`,
      );
      throw error;
    }
  }

  toWei = (amount: number | string) => {
    try {
      // Handle both number and string inputs properly
      const amountStr = typeof amount === 'number' ? amount.toString() : amount;

      // Ensure it's a valid number
      const numValue = parseFloat(amountStr);
      if (isNaN(numValue)) {
        throw new Error(`Invalid amount: ${amountStr}`);
      }

      return this.web3.utils.toWei(numValue.toString(), 'ether');
    } catch (error) {
      this.logger.error(
        `❌ toWei conversion failed for amount: ${amount}, error: ${error.message}`,
      );
      throw new Error(`Failed to convert ${amount} to wei: ${error.message}`);
    }
  };

  async approveContractsInVault() {
    try {
      this.logger.log('🔧 Auto-approving contracts...');

      const vaultAddress = this.config.get<string>('VAULT_ADDRESS');
      const lifeCareAddress = this.config.get<string>('LIFECARE_LITE_ADDRESS');
      const healthCareAddress = this.config.get<string>(
        'HEALTHCARE_LITE_ADDRESS',
      );

      if (!vaultAddress || !lifeCareAddress || !healthCareAddress) {
        throw new Error('Missing contract addresses in config');
      }

      // 🚀 SUPER SIMPLE: Just use any for ABI
      const vaultAbi: any = [
        {
          inputs: [{ name: 'contractAddress', type: 'address' }],
          name: 'approveContract',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ];

      const vault = new this.web3.eth.Contract(vaultAbi, vaultAddress);
      const gasPrice = await this.web3.eth.getGasPrice();

      const results = [];

      // Approve LifeCare
      try {
        const tx1 = await vault.methods.approveContract(lifeCareAddress).send({
          from: this.adminAccount.address,
          gas: '100000',
          gasPrice: gasPrice.toString(),
        });
        results.push({
          contract: 'LifeCare',
          status: 'approved',
          hash: tx1.transactionHash,
        });
        this.logger.log(`✅ LifeCare approved: ${tx1.transactionHash}`);
      } catch (error: any) {
        results.push({
          contract: 'LifeCare',
          status: 'failed',
          error: error.message,
        });
      }

      // Approve HealthCare
      try {
        const tx2 = await vault.methods
          .approveContract(healthCareAddress)
          .send({
            from: this.adminAccount.address,
            gas: '100000',
            gasPrice: gasPrice.toString(),
          });
        results.push({
          contract: 'HealthCare',
          status: 'approved',
          hash: tx2.transactionHash,
        });
        this.logger.log(`✅ HealthCare approved: ${tx2.transactionHash}`);
      } catch (error: any) {
        results.push({
          contract: 'HealthCare',
          status: 'failed',
          error: error.message,
        });
      }

      return { success: true, results, vaultAddress };
    } catch (error: any) {
      this.logger.error(`❌ Vault approval failed: ${error.message}`);
      throw error;
    }
  }

  // 🔧 ADD: Health policy renewal method
  async renewHealthPolicy(policyId: string, premiumWei: string) {
    try {
      this.logger.log(`🔄 Renewing health policy: ${policyId}`);
      this.logger.log(`💰 Premium: ${this.fromWei(premiumWei)} ETH`);

      const gasPrice = await this.web3.eth.getGasPrice();

      const tx = await this.healthContract.methods
        .renewPolicy(policyId, premiumWei)
        .send({
          from: this.adminAccount.address,
          value: premiumWei,
          gas: 300000,
          gasPrice,
        });

      this.logger.log(`✅ Health policy renewed: ${tx.transactionHash}`);

      return {
        success: true,
        transactionHash: tx.transactionHash,
        policyId,
        newPremium: this.fromWei(premiumWei),
        gasUsed: tx.gasUsed || 0,
        blockNumber: tx.blockNumber || 0,
      };
    } catch (error: any) {
      this.logger.error(`❌ Health policy renewal failed: ${error.message}`);
      throw error;
    }
  }

  // 🔥 ADD THIS METHOD HERE - this is the missing fromWei method
  fromWei = (amount: string | bigint) =>
    parseFloat(this.web3.utils.fromWei(amount.toString(), 'ether'));

  getAdminAddress = () => this.adminAccount.address;

  // STATUS METHOD
  async getStatus() {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      const balance = await this.web3.eth.getBalance(this.adminAccount.address);
      const balanceEth = this.fromWei(balance);

      // ดึง vault address จาก contract
      const vaultAddress = await this.healthContract.methods.vault().call();
      const vaultBalance = await this.web3.eth.getBalance(vaultAddress);

      return {
        connected: true,
        network: 'Sepolia',
        blockNumber: Number(blockNumber),
        adminAddress: this.adminAccount.address,
        adminBalance: `${balanceEth.toFixed(4)} ETH`,
        healthContract: this.config.get('HEALTHCARE_LITE_ADDRESS'),
        lifeContract: this.config.get('LIFECARE_LITE_ADDRESS'),
        vault: {
          address: vaultAddress,
          balance: this.web3.utils.fromWei(vaultBalance, 'ether') + ' ETH',
        },
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async debugPolicy(policyId: string, contractType: 'life' | 'health') {
    const contract =
      contractType === 'life' ? this.lifeContract : this.healthContract;

    try {
      // Get policy data from blockchain
      const policy = await contract.methods.getPolicy(policyId).call();
      const claim = await contract.methods.getClaim(policyId).call();

      return {
        blockchain: {
          policy: {
            exists:
              policy.policyId !==
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            owner: policy.owner,
            isActive: policy.isActive,
            isClaimed: policy.isClaimed,
            premium: policy.premium,
            sumAssured: policy.sumAssured,
            expiry: new Date(parseInt(policy.expiry) * 1000).toISOString(),
          },
          claim: {
            amount: claim.amount,
            isPending: claim.isPending,
          },
        },
      };
    } catch (error) {
      throw new Error(`Blockchain debug failed: ${error.message}`);
    }
  }
  async performAuthorizationDiagnosis() {
    try {
      this.logger.log('🔍 PERFORMING COMPREHENSIVE CONTRACT DIAGNOSIS');

      // Diagnose Life contract
      this.logger.log('📋 Diagnosing Life Contract...');
      const lifeResult = await this.diagnoseAuthorizationIssue(
        this.lifeContract,
        'Life',
      );

      // Diagnose Health contract
      this.logger.log('📋 Diagnosing Health Contract...');
      const healthResult = await this.diagnoseAuthorizationIssue(
        this.healthContract,
        'Health',
      );

      // Overall summary
      const overallStatus =
        lifeResult.hasAdminRole && healthResult.hasAdminRole;

      this.logger.log(`✅ DIAGNOSIS SUMMARY:`);
      this.logger.log(
        `   Life Contract Admin Role: ${lifeResult.hasAdminRole ? '✅' : '❌'}`,
      );
      this.logger.log(
        `   Health Contract Admin Role: ${healthResult.hasAdminRole ? '✅' : '❌'}`,
      );
      this.logger.log(
        `   Overall Status: ${overallStatus ? '✅ READY' : '⚠️ NEEDS ATTENTION'}`,
      );

      return {
        life: lifeResult,
        health: healthResult,
        summary: {
          allContractsReady: overallStatus,
          lifeReady: lifeResult.hasAdminRole,
          healthReady: healthResult.hasAdminRole,
          recommendedActions: overallStatus
            ? ['All contracts are properly configured']
            : [
                ...(lifeResult.hasAdminRole
                  ? []
                  : ['Grant admin role to Life contract']),
                ...(healthResult.hasAdminRole
                  ? []
                  : ['Grant admin role to Health contract']),
              ],
        },
      };
    } catch (error) {
      this.logger.error(`❌ Authorization diagnosis failed: ${error.message}`);
      throw error;
    }
  }

  // Updated diagnoseAuthorizationIssue method (role-based version):
  private async diagnoseAuthorizationIssue(
    contract: any,
    contractName: string,
  ) {
    try {
      this.logger.log(
        `🔍 DIAGNOSING ${contractName.toUpperCase()} CONTRACT AUTHORIZATION:`,
      );
      this.logger.log(`📋 Contract: ${contract.options.address}`);

      // Get admin role
      const adminRole = await contract.methods.ADMIN_ROLE().call();
      this.logger.log(`🔑 ADMIN_ROLE: ${adminRole}`);

      // Check if current admin account has admin role
      const hasAdminRole = await contract.methods
        .hasRole(adminRole, this.adminAccount.address)
        .call();
      this.logger.log(
        `👑 Admin Account (${this.adminAccount.address}) has ADMIN_ROLE: ${hasAdminRole}`,
      );

      // Check DEFAULT_ADMIN_ROLE if it exists (optional)
      try {
        const defaultAdminRole =
          '0x0000000000000000000000000000000000000000000000000000000000000000';
        const hasDefaultAdminRole = await contract.methods
          .hasRole(defaultAdminRole, this.adminAccount.address)
          .call();
        this.logger.log(
          `👑 Admin Account has DEFAULT_ADMIN_ROLE: ${hasDefaultAdminRole}`,
        );
      } catch (error) {
        this.logger.log(`ℹ️ DEFAULT_ADMIN_ROLE check not available`);
      }

      // Check vault address if available
      try {
        const vaultAddress = await contract.methods.vault().call();
        this.logger.log(`🏦 Vault Address: ${vaultAddress}`);

        // Check if vault has admin role
        const vaultHasAdminRole = await contract.methods
          .hasRole(adminRole, vaultAddress)
          .call();
        this.logger.log(`🏦 Vault has ADMIN_ROLE: ${vaultHasAdminRole}`);
      } catch (error) {
        this.logger.log(`ℹ️ Vault address check not available`);
      }

      // Summary
      this.logger.log(`✅ AUTHORIZATION DIAGNOSIS COMPLETE:`);
      this.logger.log(
        `   - Contract: ${contractName} (${contract.options.address})`,
      );
      this.logger.log(`   - Admin Account: ${this.adminAccount.address}`);
      this.logger.log(`   - Has Admin Role: ${hasAdminRole}`);

      if (!hasAdminRole) {
        this.logger.warn(
          `⚠️ WARNING: Admin account does not have ADMIN_ROLE on ${contractName} contract`,
        );
        this.logger.warn(
          `   You may need to grant admin role to: ${this.adminAccount.address}`,
        );
      }

      return {
        contractName,
        contractAddress: contract.options.address,
        adminAccount: this.adminAccount.address,
        hasAdminRole,
        adminRole,
      };
    } catch (error) {
      this.logger.error(
        `❌ Authorization diagnosis failed for ${contractName}: ${error.message}`,
      );
      throw error;
    }
  }

  async getAllPoliciesByEvents(type: 'health' | 'life') {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      this.logger.log(
        `🔍 Fetching all ${type} policies from blockchain events...`,
      );

      // ดึง PolicyPurchased events ทั้งหมด
      const events = await contract.getPastEvents('PolicyPurchased', {
        fromBlock: 0,
        toBlock: 'latest',
      });

      this.logger.log(`📋 Found ${events.length} ${type} policy events`);

      const policies = [];

      for (const event of events) {
        const { policyId, owner, premium, sumAssured, expiry } =
          event.returnValues;

        try {
          // ดึงข้อมูล policy ปัจจุบันจาก blockchain
          const currentPolicy = await contract.methods
            .getPolicy(policyId)
            .call();

          policies.push({
            id: policyId,
            owner: owner,
            premium: this.fromWei(premium),
            sumAssured: this.fromWei(sumAssured),
            expiry: new Date(Number(expiry) * 1000).toISOString(),
            isActive: currentPolicy.isActive,
            isClaimed: currentPolicy.isClaimed,
            createdAt: new Date(
              Number(currentPolicy.createdAt) * 1000,
            ).toISOString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        } catch (error) {
          this.logger.warn(
            `⚠️ Could not fetch current state for policy ${policyId}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `✅ Successfully fetched ${policies.length} ${type} policies`,
      );
      return policies;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch ${type} policies: ${error.message}`,
      );
      throw error;
    }
  }

  async getAllClaimsByEvents(type: 'health' | 'life') {
    try {
      const contract =
        type === 'health' ? this.healthContract : this.lifeContract;

      this.logger.log(
        `🔍 Fetching all ${type} claims from blockchain events...`,
      );

      // ดึง ClaimFiled และ ClaimApproved events
      const filedEvents = await contract.getPastEvents('ClaimFiled', {
        fromBlock: 0,
        toBlock: 'latest',
      });

      const approvedEvents = await contract.getPastEvents('ClaimApproved', {
        fromBlock: 0,
        toBlock: 'latest',
      });

      this.logger.log(
        `📋 Found ${filedEvents.length} filed and ${approvedEvents.length} approved ${type} claim events`,
      );

      const claims = [];

      // Merge filed and approved events
      const allClaimEvents = [...filedEvents, ...approvedEvents];

      // Group by policy ID
      const claimsByPolicy = new Map();

      for (const event of allClaimEvents) {
        const { policyId, owner, amount } = event.returnValues;
        const eventType = event.event; // 'ClaimFiled' or 'ClaimApproved'

        if (!claimsByPolicy.has(policyId)) {
          claimsByPolicy.set(policyId, {
            policyId,
            owner,
            amount: this.fromWei(amount),
            status: 'pending',
            filedAt: null,
            approvedAt: null,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        }

        const claim = claimsByPolicy.get(policyId);

        if (eventType === 'ClaimFiled') {
          claim.filedAt = new Date(
            await this.getBlockTimestamp(event.blockNumber),
          ).toISOString();
        } else if (eventType === 'ClaimApproved') {
          claim.status = 'approved';
          claim.approvedAt = new Date(
            await this.getBlockTimestamp(event.blockNumber),
          ).toISOString();
        }
      }

      const result = Array.from(claimsByPolicy.values());
      this.logger.log(
        `✅ Successfully fetched ${result.length} ${type} claims`,
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch ${type} claims: ${error.message}`);
      throw error;
    }
  }

  // Helper method to get block timestamp
  async getBlockTimestamp(blockNumber: number): Promise<number> {
    try {
      const block = await this.web3.eth.getBlock(blockNumber);
      return Number(block.timestamp) * 1000; // Convert to milliseconds
    } catch (error) {
      this.logger.warn(`⚠️ Could not get timestamp for block ${blockNumber}`);
      return Date.now(); // Fallback to current time
    }
  }
}
