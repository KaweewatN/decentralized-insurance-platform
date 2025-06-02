import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { LifeService } from './life.service';
import { Web3Service } from './web3.service';
import { RateService } from './rate.service';
import { DataService } from './data.service';

@Controller()
export class InsuranceController {
  private readonly logger = new Logger(InsuranceController.name);

  constructor(
    private health: HealthService,
    private life: LifeService,
    private web3: Web3Service,
    private rateService: RateService,
    private dataService: DataService,
  ) {}

  @Post('grant-admin-role')
  async grantAdminRole() {
    try {
      const lifeTx = await this.web3.ensureAdminRole('life');
      const healthTx = await this.web3.ensureAdminRole('health');

      return {
        success: true,
        life: lifeTx,
        health: healthTx,
        message: 'Admin roles granted successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('exchange-rate')
  async getExchangeRate() {
    try {
      const rateInfo = await this.rateService.getRateInfo();
      return {
        ...rateInfo,
        success: true,
        message: 'Exchange rate retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('exchange-rate/refresh')
  async refreshExchangeRate() {
    try {
      const newRate = await this.rateService.getEthToThbRate();
      const rateInfo = await this.rateService.getRateInfo();

      return {
        success: true,
        newRate,
        ...rateInfo,
        message: 'Exchange rate refreshed successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('health/calculate-premium')
  async calculateHealthPremium(
    @Body()
    dto: {
      walletAddress: string;
      sumAssured: number;
    },
  ) {
    try {
      const premiumThb = await this.health.calculatePremium(
        dto.walletAddress,
        dto.sumAssured,
      );
      const exchangeRate = await this.rateService.getEthToThbRate();
      const premiumEth = await this.rateService.convertThbToEth(premiumThb);

      return {
        success: true,
        premiumThb,
        premiumEth: premiumEth.toFixed(6),
        exchangeRate: exchangeRate.toFixed(2),
        message: 'Health premium calculated successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('health/user/purchase')
  async userPurchaseHealthPolicy(@Body() body: any) {
    return this.health.userHealthPurchase(body);
  }

  @Post('health/purchase')
  async purchaseHealth(
    @Body()
    dto: {
      userId: string;
      sumAssured: number;
      policyId?: string;
    },
  ) {
    try {
      const result = await this.health.purchasePolicy({
        userId: dto.userId,
        sumAssured: dto.sumAssured,
        policyId: dto.policyId,
      });
      return {
        ...result,
        message: 'Health policy purchased successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Health policy purchase failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('health/claim')
  async fileHealthClaim(
    @Body()
    dto: {
      userId?: string;
      policyId: string;
      claimAmount: number; // เปลี่ยนจาก amount เป็น claimAmount
    },
  ) {
    try {
      this.logger.log(
        `👨‍💼 Admin filing health claim for policy: ${dto.policyId}`,
      );
      this.logger.log(`💰 Claim amount received: ${dto.claimAmount} THB`);

      // Validate input parameters
      if (!dto.policyId) {
        throw new Error('Policy ID is required');
      }

      if (
        !dto.claimAmount ||
        typeof dto.claimAmount !== 'number' ||
        dto.claimAmount <= 0
      ) {
        throw new Error('Valid claim amount is required');
      }

      const policy = await this.health.getPolicy(dto.policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }
      if (dto.claimAmount > policy.sumAssured) {
        throw new Error(
          `Claim amount (${dto.claimAmount}) exceeds sum assured (${policy.sumAssured})`,
        );
      }

      const claimResult = await this.health.fileClaim(
        dto.policyId,
        dto.claimAmount,
      );

      return {
        success: true,
        claim: claimResult,
        message: `Admin successfully processed health claim`,
      };
    } catch (error) {
      this.logger.error(`❌ Health claim filing failed: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('health/refund/:policyId')
  async getHealthRefund(@Param('policyId') policyId: string) {
    try {
      // 🔧 FIX: Missing await keyword
      const refundAmount = await this.health.calculateRefund(policyId);
      return {
        success: true,
        policyId,
        refundAmount,
        message: 'Health policy refund calculated',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('health/cancel')
  async cancelHealthPolicy(
    @Body()
    dto: {
      policyId: string;
      refundAmount: number;
      adminApproval?: boolean;
    },
  ) {
    try {
      if (dto.adminApproval === false) {
        throw new Error('Admin approval required for policy cancellation');
      }

      this.logger.log(`👤 Admin cancelling health policy: ${dto.policyId}`);

      const result = await this.health.cancelPolicy(
        dto.policyId,
        dto.refundAmount,
      );

      return {
        ...result,
        message: 'Health policy cancelled successfully by admin',
        note: 'Refund processed to policy holder',
      };
    } catch (error) {
      throw new HttpException(
        `Health policy cancellation failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health/policy/:id')
  async getHealthPolicy(@Param('id') id: string) {
    try {
      // Validate policy ID format
      if (!id || id === '0xinvalid' || !/^0x[a-fA-F0-9]{64}$/.test(id)) {
        throw new HttpException(
          'Invalid policy ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 🔧 FIX: Use getPolicyOnChain for consistency with life endpoint
      const policy = await this.health.getPolicyOnChain(id);
      if (
        !policy ||
        policy.id ===
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        throw new HttpException(
          'Health policy not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        policy,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('life/calculate-premium')
  async calculateLifePremium(
    @Body()
    dto: {
      age: number;
      gender: string;
      occupation: string;
      sumAssured: number;
    },
  ) {
    try {
      const premiumThb = this.life.calculatePremium(
        dto.age,
        dto.gender,
        dto.occupation,
        dto.sumAssured,
      );
      const exchangeRate = await this.rateService.getEthToThbRate();
      const premiumEth = await this.rateService.convertThbToEth(premiumThb);

      return {
        success: true,
        premiumThb,
        premiumEth: premiumEth.toFixed(6),
        exchangeRate: exchangeRate.toFixed(2),
        message: 'Life premium calculated successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('life/purchase')
  async purchaseLife(
    @Body()
    dto: {
      userId: string;
      age: number;
      gender: string;
      occupation: string;
      sumAssured: number;
    },
  ) {
    try {
      const result = await this.life.purchasePolicy(dto);
      return {
        ...result,
        message: 'Life policy purchased successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Life policy purchase failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('life/claim')
  async fileLifeClaim(
    @Body()
    dto: {
      userId?: string;
      policyId: string;
      claimAmount: number; // เปลี่ยนจาก amount เป็น claimAmount
    },
  ) {
    try {
      this.logger.log(`👨‍💼 Admin filing life claim for policy: ${dto.policyId}`);
      this.logger.log(`💰 Claim amount received: ${dto.claimAmount} THB`);

      // Validate input parameters
      if (!dto.policyId) {
        throw new Error('Policy ID is required');
      }

      if (
        !dto.claimAmount ||
        typeof dto.claimAmount !== 'number' ||
        dto.claimAmount <= 0
      ) {
        throw new Error('Valid claim amount is required');
      }

      const policy = await this.life.getPolicy(dto.policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }
      if (dto.claimAmount > policy.sumAssured) {
        throw new Error(
          `Claim amount (${dto.claimAmount}) exceeds sum assured (${policy.sumAssured})`,
        );
      }

      const claimResult = await this.life.fileClaim(
        dto.policyId,
        dto.claimAmount,
      );

      return {
        success: true,
        claim: claimResult,
        message: `Admin successfully processed life claim and terminated policy`,
      };
    } catch (error) {
      this.logger.error(`❌ Life claim filing failed: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Get('life/refund/:policyId')
  async getLifeRefund(@Param('policyId') policyId: string) {
    try {
      // 🔧 FIX: Get the full result object instead of just refundAmount
      const result = await this.life.calculateRefund(policyId);

      return {
        success: true,
        policyId,
        refundAmount: result.refundAmount,
        reason: result.reason,
        policyStatus: result.policyStatus,
        message: `Life policy refund calculated: ${result.refundAmount} THB - ${result.reason}`,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('life/cancel')
  async cancelLifePolicy(
    @Body()
    dto: {
      policyId: string;
      refundAmount: number;
      adminApproval?: boolean;
    },
  ) {
    try {
      if (dto.adminApproval === false) {
        throw new Error('Admin approval required for policy cancellation');
      }

      this.logger.log(`👤 Admin cancelling life policy: ${dto.policyId}`);

      const result = await this.life.cancelPolicy(
        dto.policyId,
        dto.refundAmount,
      );

      return {
        ...result,
        message: 'Life policy cancelled successfully by admin',
        note: 'Refund processed to policy holder',
      };
    } catch (error) {
      throw new HttpException(
        `Life policy cancellation failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('life/policy/:id')
  async getLifePolicy(@Param('id') id: string) {
    try {
      // Validate policy ID format
      if (!id || id === '0xinvalid' || !/^0x[a-fA-F0-9]{64}$/.test(id)) {
        throw new HttpException(
          'Invalid policy ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const policy = await this.life.getPolicyOnChain(id);
      if (
        !policy ||
        policy.id ===
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        throw new HttpException('Life policy not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        policy,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('status')
  async getSystemStatus() {
    try {
      const web3Status = await this.web3.getStatus();
      const rateInfo = await this.rateService.getRateInfo();
      const stats = this.dataService.getStats();

      return {
        success: true,
        timestamp: new Date().toISOString(),
        system: {
          status: 'operational',
          uptime: `${Math.floor(process.uptime())} seconds`,
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
        },
        blockchain: web3Status,
        exchangeRate: rateInfo,
        statistics: stats,
        endpoints: {
          health: [
            'POST /health/calculate-premium',
            'POST /health/purchase',
            'POST /health/claim',
            'POST /health/renew',
            'GET /health/refund/:policyId',
            'POST /health/cancel',
            'GET /health/policy/:id',
          ],
          life: [
            'POST /life/calculate-premium',
            'POST /life/purchase',
            'POST /life/claim',
            'GET /life/refund/:policyId',
            'POST /life/cancel',
            'GET /life/policy/:id',
          ],
          admin: [
            'POST /admin/approve-vault',
            'GET /admin/vault-status',
            'POST /grant-admin-role',
            'GET /diagnose',
          ],
        },
      };
    } catch (error) {
      throw new HttpException(
        `System status check failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health-check')
  healthCheck() {
    return {
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Insurance backend is running',
    };
  }
  @Get('stats')
  getStats() {
    try {
      const stats = this.dataService.getStats();
      return {
        success: true,
        ...stats,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vault-info')
  async getVaultInfo() {
    try {
      const status = await this.web3.getStatus();
      const vaultApprovalStatus = await this.web3.checkVaultApprovalStatus();

      return {
        success: true,
        vaultAddress: status.vault?.address || 'Unknown',
        balance: status.vault?.balance || '0',
        approvalStatus: vaultApprovalStatus,
        message: 'Vault information retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get vault information',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔧 ADD: Health policy renewal endpoint
  @Post('health/renew')
  async renewHealthPolicy(
    @Body()
    dto: {
      policyId: string;
      premiumThb: number;
    },
  ) {
    try {
      this.logger.log(`🔄 Admin renewing health policy: ${dto.policyId}`);
      this.logger.log(`💰 New premium: ${dto.premiumThb} THB`);

      const result = await this.health.renewPolicy(
        dto.policyId,
        dto.premiumThb,
      );

      return {
        success: true,
        renewal: result,
        message: 'Health policy renewed successfully',
      };
    } catch (error: any) {
      this.logger.error(`❌ Health policy renewal failed: ${error.message}`);
      throw new HttpException(
        `Health policy renewal failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('diagnose')
  async diagnose() {
    try {
      this.logger.log('🔍 Starting contract authorization diagnosis...');

      // Call the Web3Service to perform the diagnosis
      // The contracts are managed by Web3Service, not the controller
      const diagnosisResult = await this.web3.performAuthorizationDiagnosis();

      return {
        success: true,
        ...diagnosisResult,
        timestamp: new Date().toISOString(),
        message: 'Authorization diagnosis completed successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Diagnosis failed: ${error.message}`);
      throw new HttpException(
        `Diagnosis failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('admin/approve-vault')
  async approveVault() {
    try {
      this.logger.log('🔧 Admin requesting vault contract approval...');

      const result = await this.web3.approveContractsInVault();

      return {
        success: true,
        message: 'Vault contract approval completed',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`❌ Vault approval failed: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Vault approval failed',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔧 ADD: Check vault approval status
  @Get('admin/vault-status')
  async getVaultApprovalStatus() {
    try {
      const status = await this.web3.checkVaultApprovalStatus();

      return {
        success: true,
        message: 'Vault approval status retrieved',
        data: status,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to check vault status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // แทนที่ methods เหล่านี้ใน InsuranceController

  @Get('health/policies')
  async getHealthPolicies() {
    try {
      this.logger.log('🔍 Fetching health policies from blockchain...');

      const policies = await this.web3.getAllPoliciesByEvents('health');

      return {
        success: true,
        count: policies.length,
        policies,
        message: 'Health policies fetched from blockchain events',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch health policies: ${error.message}`);
      throw new HttpException(
        `Failed to fetch health policies: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('life/policies')
  async getLifePolicies() {
    try {
      this.logger.log('🔍 Fetching life policies from blockchain...');

      const policies = await this.web3.getAllPoliciesByEvents('life');

      return {
        success: true,
        count: policies.length,
        policies,
        message: 'Life policies fetched from blockchain events',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch life policies: ${error.message}`);
      throw new HttpException(
        `Failed to fetch life policies: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health/claims')
  async getHealthClaims() {
    try {
      this.logger.log('🔍 Fetching health claims from blockchain...');

      const claims = await this.web3.getAllClaimsByEvents('health');

      return {
        success: true,
        count: claims.length,
        claims,
        message: 'Health claims fetched from blockchain events',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch health claims: ${error.message}`);
      throw new HttpException(
        `Failed to fetch health claims: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('life/claims')
  async getLifeClaims() {
    try {
      this.logger.log('🔍 Fetching life claims from blockchain...');

      const claims = await this.web3.getAllClaimsByEvents('life');

      return {
        success: true,
        count: claims.length,
        claims,
        message: 'Life claims fetched from blockchain events',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch life claims: ${error.message}`);
      throw new HttpException(
        `Failed to fetch life claims: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
