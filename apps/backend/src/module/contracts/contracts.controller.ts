import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Query,
  Logger,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  private logger = new Logger(ContractsController.name);

  constructor(private readonly contractsService: ContractsService) {}

  // เพิ่ม endpoint สำหรับ deploy vault
  @Post('deploy-vault')
  async deployVault(@Body() body: { owner?: string }) {
    try {
      const { owner } = body;
      const address = await this.contractsService.deployVault(owner);
      return { address };
    } catch (error) {
      this.logger.error(`Failed to deploy vault: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('deploy/:contractName')
  async deployContract(
    @Param('contractName') contractName: string,
    @Body() body: { trustedSigner: string; vault: string },
  ) {
    try {
      const { trustedSigner, vault } = body;

      // Validate required parameters
      if (!trustedSigner || !vault) {
        throw new HttpException(
          'trustedSigner and vault are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Deploy contract
      const address = await this.contractsService.deployContract(
        contractName,
        trustedSigner,
        vault,
      );

      return { address };
    } catch (error) {
      this.logger.error(`Failed to deploy contract: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // เพิ่ม endpoint สำหรับดูยอดเงินใน Vault
  @Get('vault-balance')
  async getVaultBalance() {
    try {
      const balance = await this.contractsService.getVaultBalance();
      return { balance };
    } catch (error) {
      this.logger.error(`Failed to get vault balance: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // เพิ่ม endpoint สำหรับส่งเงินจาก vault
  @Post('send-from-vault')
  async sendFromVault(@Body() body: { toAddress: string; amountEth: number }) {
    try {
      const { toAddress, amountEth } = body;

      if (!toAddress || !amountEth) {
        throw new HttpException(
          'toAddress and amountEth are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const txHash = await this.contractsService.sendFundsFromVault(
        toAddress,
        amountEth,
      );
      return { txHash };
    } catch (error) {
      this.logger.error(`Failed to send funds from vault: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('eth-to-thb')
  async getEthToThbRate() {
    try {
      const rate = await this.contractsService.getEthToThbRate();
      return { rate };
    } catch (error) {
      this.logger.error(`Failed to fetch ETH to THB rate: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('current-rate')
  getCurrentRate() {
    const { rate, expiresIn } = this.contractsService.getCurrentCachedRate();
    if (rate > 0) {
      return {
        success: true,
        ethToThbRate: rate,
        expiresIn: expiresIn,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: false,
      message: 'No cached rate available',
    };
  }

  @Get('network')
  async getNetworkInfo() {
    try {
      const networkInfo = await this.contractsService.getNetworkInfo();
      return networkInfo;
    } catch (error) {
      this.logger.error(`Failed to fetch network info: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('purchase-policy')
  async purchaseLifePolicy(
    @Body()
    body: {
      owner: string;
      premiumWei: string;
      sumAssuredWei: string;
      duration: string;
      signature: string;
    },
  ) {
    try {
      const { owner, premiumWei, sumAssuredWei, duration, signature } = body;

      // Validate required parameters
      if (!owner || !premiumWei || !sumAssuredWei || !duration || !signature) {
        throw new HttpException(
          'All parameters are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Convert string values to BigInt and Number
      const premiumWeiBigInt = BigInt(premiumWei);
      const sumAssuredWeiBigInt = BigInt(sumAssuredWei);
      const durationNum = Number(duration);

      const txHash = await this.contractsService.purchaseLifePolicy(
        owner,
        premiumWeiBigInt,
        sumAssuredWeiBigInt,
        durationNum,
        signature,
      );

      return { txHash };
    } catch (error) {
      this.logger.error(`Failed to purchase policy: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('purchase-health-policy')
  async purchaseHealthPolicy(
    @Body()
    body: {
      user: string;
      policyDataHash: string;
      sumAssured: number;
      premium: number;
      signature: string;
    },
  ) {
    try {
      const { user, policyDataHash, sumAssured, premium, signature } = body;

      // Validate required parameters
      if (!user || !policyDataHash || !sumAssured || !premium || !signature) {
        throw new HttpException(
          'All parameters are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const txHash = await this.contractsService.purchaseHealthPolicy(
        user,
        policyDataHash,
        sumAssured,
        premium,
        signature,
      );

      return { txHash };
    } catch (error) {
      this.logger.error(`Failed to purchase health policy: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('submit-claim')
  async submitClaim(
    @Body()
    body: {
      policyId: string;
      amount: string;
      documentHash: string;
      signature: string;
    },
  ) {
    try {
      const { policyId, amount, documentHash, signature } = body;

      // Validate required parameters
      if (!policyId || !amount || !documentHash || !signature) {
        throw new HttpException(
          'All parameters are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Convert amount to number
      const amountNum = Number(amount);

      const txHash = await this.contractsService.submitClaim(
        policyId,
        amountNum,
        documentHash,
        signature,
      );

      return { txHash };
    } catch (error) {
      this.logger.error(`Failed to submit claim: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('approve-claim')
  async approveClaim(@Body() body: { policyId: string; amount: string }) {
    try {
      const { policyId, amount } = body;

      // Validate required parameters
      if (!policyId) {
        throw new HttpException(
          'Policy ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Convert amount to number, default to 0 if not provided
      const amountNum = amount ? Number(amount) : 0;

      const txHash = await this.contractsService.approveClaim(policyId);

      return { txHash };
    } catch (error) {
      this.logger.error(`Failed to approve claim: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('cancel-policy')
  async cancelPolicy(
    @Body()
    body: {
      policyId: string;
      refundAmount: string;
      signature: string;
    },
  ) {
    try {
      const { policyId, refundAmount, signature } = body;

      // Validate required parameters
      if (!policyId || !refundAmount || !signature) {
        throw new HttpException(
          'All parameters are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Convert refundAmount to BigInt
      const refundAmountBigInt = BigInt(refundAmount);

      const txHash = await this.contractsService.cancelPolicy(
        policyId,
        refundAmountBigInt,
        signature,
      );

      return { txHash };
    } catch (error) {
      this.logger.error(`Failed to cancel policy: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('calculate-refund/:policyId')
  async calculateRefund(@Param('policyId') policyId: string) {
    try {
      // Validate required parameters
      if (!policyId) {
        throw new HttpException(
          'Policy ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const refundAmount =
        await this.contractsService.calculateRefund(policyId);

      return { refundAmount: refundAmount.toString() };
    } catch (error) {
      this.logger.error(`Failed to calculate refund: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('policy/:policyId')
  async getPolicy(@Param('policyId') policyId: string) {
    try {
      if (!policyId) {
        throw new HttpException(
          'Policy ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ getLifePolicy หากถูก implement แล้ว
      if (this.contractsService.getLifePolicy) {
        const policy = await this.contractsService.getLifePolicy(policyId);
        return policy;
      }

      this.logger.warn(`getPolicy method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to fetch policy: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('claim/:policyId')
  async getClaim(@Param('policyId') policyId: string) {
    try {
      if (!policyId) {
        throw new HttpException(
          'Policy ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ getLifeClaim หากถูก implement แล้ว
      if (this.contractsService.getLifeClaim) {
        const claim = await this.contractsService.getLifeClaim(policyId);
        return claim;
      }

      this.logger.warn(`getClaim method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to fetch claim: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('renew-policy')
  async renewPolicy(
    @Body()
    body: {
      policyId: string;
      premium: string;
      duration: string;
      signature: string;
    },
  ) {
    try {
      const { policyId, premium, duration, signature } = body;

      if (!policyId || !premium || !duration || !signature) {
        throw new HttpException(
          'All parameters are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ renewLifePolicy หากถูก implement แล้ว
      if (this.contractsService.renewLifePolicy) {
        const premiumNum = Number(premium);
        const durationNum = Number(duration);

        const txHash = await this.contractsService.renewLifePolicy(
          policyId,
          premiumNum,
          durationNum,
          signature,
        );

        return { txHash };
      }

      this.logger.warn(`renewPolicy method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to renew policy: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('mark-expired')
  async markExpiredPolicy(@Body() body: { policyId: string }) {
    try {
      const { policyId } = body;

      if (!policyId) {
        throw new HttpException(
          'Policy ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ markLifePolicyExpired หากถูก implement แล้ว
      if (this.contractsService.markLifePolicyExpired) {
        const txHash =
          await this.contractsService.markLifePolicyExpired(policyId);
        return { txHash };
      }

      this.logger.warn(`markExpiredPolicy method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to mark policy as expired: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('emergency-withdraw')
  async emergencyWithdraw(@Body() body: { amount: string }) {
    try {
      const { amount } = body;

      if (!amount) {
        throw new HttpException('Amount is required', HttpStatus.BAD_REQUEST);
      }

      // เรียกใช้ emergencyFundsWithdraw หากถูก implement แล้ว
      if (this.contractsService.emergencyFundsWithdraw) {
        const amountNum = Number(amount);
        const txHash =
          await this.contractsService.emergencyFundsWithdraw(amountNum);
        return { txHash };
      }

      this.logger.warn(`emergencyWithdraw method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(
        `Failed to perform emergency withdraw: ${error.message}`,
      );
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('set-trusted-signer')
  async setTrustedSigner(@Body() body: { newSigner: string }) {
    try {
      const { newSigner } = body;

      if (!newSigner) {
        throw new HttpException(
          'New signer address is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ updateTrustedSigner หากถูก implement แล้ว
      if (this.contractsService.updateTrustedSigner) {
        const txHash =
          await this.contractsService.updateTrustedSigner(newSigner);
        return { txHash };
      }

      this.logger.warn(`setTrustedSigner method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to set trusted signer: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('set-claim-expiry')
  async setClaimExpiryPeriod(@Body() body: { periodInDays: number }) {
    try {
      const { periodInDays } = body;

      if (!periodInDays || periodInDays <= 0) {
        throw new HttpException(
          'Valid period in days is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ updateClaimExpiryPeriod หากถูก implement แล้ว
      if (this.contractsService.updateClaimExpiryPeriod) {
        const txHash =
          await this.contractsService.updateClaimExpiryPeriod(periodInDays);
        return { txHash };
      }

      this.logger.warn(
        `setClaimExpiryPeriod method not implemented in service`,
      );
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to set claim expiry period: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('grant-admin')
  async grantAdminRole(@Body() body: { newAdmin: string }) {
    try {
      const { newAdmin } = body;

      if (!newAdmin) {
        throw new HttpException(
          'New admin address is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ addAdminRole หากถูก implement แล้ว
      if (this.contractsService.addAdminRole) {
        const txHash = await this.contractsService.addAdminRole(newAdmin);
        return { txHash };
      }

      this.logger.warn(`grantAdminRole method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to grant admin role: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('revoke-admin')
  async revokeAdminRole(@Body() body: { admin: string }) {
    try {
      const { admin } = body;

      if (!admin) {
        throw new HttpException(
          'Admin address is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // เรียกใช้ removeAdminRole หากถูก implement แล้ว
      if (this.contractsService.removeAdminRole) {
        const txHash = await this.contractsService.removeAdminRole(admin);
        return { txHash };
      }

      this.logger.warn(`revokeAdminRole method not implemented in service`);
      throw new HttpException(
        'This feature is not implemented yet',
        HttpStatus.NOT_IMPLEMENTED,
      );
    } catch (error) {
      this.logger.error(`Failed to revoke admin role: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Create signature helper method
  @Post('create-policy-signature')
  async createPolicySignature(
    @Body()
    body: {
      owner: string;
      premium: string;
      sumAssured: string;
      duration: string;
    },
  ) {
    try {
      const { owner, premium, sumAssured, duration } = body;

      if (!owner || !premium || !sumAssured || !duration) {
        throw new HttpException(
          'All parameters are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Convert string values to BigInt and Number
      const premiumBigInt = BigInt(premium);
      const sumAssuredBigInt = BigInt(sumAssured);
      const durationNum = Number(duration);

      // Check if createPolicySignature method exists in the service
      if (!this.contractsService.createPolicySignature) {
        throw new HttpException(
          'This feature is not implemented yet',
          HttpStatus.NOT_IMPLEMENTED,
        );
      }

      const signature = await this.contractsService.createPolicySignature(
        owner,
        premiumBigInt,
        sumAssuredBigInt,
        durationNum,
      );

      return { signature };
    } catch (error) {
      this.logger.error(`Failed to create policy signature: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
