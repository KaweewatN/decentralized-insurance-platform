// signature.controller.ts
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger,
  Get,
} from '@nestjs/common';
import { SignatureService } from './signature.service';

@Controller('signatures')
export class SignatureController {
  private readonly logger = new Logger(SignatureController.name);

  constructor(private readonly signatureService: SignatureService) {}

  @Post('policy-purchase')
  async signPolicyPurchase(
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
        throw new BadRequestException('Missing required parameters');
      }

      // Convert string values to BigInt
      const premiumWei = BigInt(premium);
      const sumAssuredWei = BigInt(sumAssured);
      const durationSec = BigInt(duration);

      const signature = await this.signatureService.signPolicyPurchase(
        owner,
        premiumWei,
        sumAssuredWei,
        durationSec,
      );

      return {
        success: true,
        signature,
        details: {
          owner,
          premium: premiumWei.toString(),
          sumAssured: sumAssuredWei.toString(),
          duration: durationSec.toString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sign policy purchase: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('claim')
  async signClaim(
    @Body()
    body: {
      policyId: string;
      amount: string;
      documentHash: string;
    },
  ) {
    try {
      const { policyId, amount, documentHash } = body;

      if (!policyId || !amount || !documentHash) {
        throw new BadRequestException('Missing required parameters');
      }

      // Convert string value to BigInt
      const amountWei = BigInt(amount);

      const signature = await this.signatureService.signClaim(
        policyId,
        amountWei,
        documentHash,
      );

      return {
        success: true,
        signature,
        details: {
          policyId,
          amount: amountWei.toString(),
          documentHash,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sign claim: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('policy-cancel')
  async signPolicyCancel(
    @Body()
    body: {
      policyId: string;
      owner: string;
      refundAmount: string;
    },
  ) {
    try {
      const { policyId, owner, refundAmount } = body;

      if (!policyId || !owner || !refundAmount) {
        throw new BadRequestException('Missing required parameters');
      }

      // Convert string value to BigInt
      const refundAmountWei = BigInt(refundAmount);

      const signature = await this.signatureService.signPolicyCancel(
        policyId,
        owner,
        refundAmountWei,
      );

      return {
        success: true,
        signature,
        details: {
          policyId,
          owner,
          refundAmount: refundAmountWei.toString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sign policy cancellation: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('message')
  async signMessage(@Body() body: { message: string }) {
    try {
      const { message } = body;

      if (!message) {
        throw new BadRequestException('Message is required');
      }

      const signature = await this.signatureService.signMessage(message);

      return {
        success: true,
        signature,
        details: {
          message,
          messageHash: this.signatureService.hashMessage(message),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sign message: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('hash')
  async signHash(@Body() body: { hash: string }) {
    try {
      const { hash } = body;

      if (!hash) {
        throw new BadRequestException('Hash is required');
      }

      const signature = await this.signatureService.signHash(hash);

      return {
        success: true,
        signature,
        details: {
          hash,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sign hash: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('verify')
  verifySignature(@Body() body: { messageHash: string; signature: string }) {
    try {
      const { messageHash, signature } = body;

      if (!messageHash || !signature) {
        throw new BadRequestException(
          'Message hash and signature are required',
        );
      }

      const isValid = this.signatureService.verifySignature(
        messageHash,
        signature,
      );

      return {
        success: true,
        isValid,
        details: {
          messageHash,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to verify signature: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('verify-policy')
  verifyPolicySignature(
    @Body()
    body: {
      owner: string;
      premium: string;
      sumAssured: string;
      duration: string;
      chainId: string;
      signature: string;
    },
  ) {
    try {
      const { owner, premium, sumAssured, duration, chainId, signature } = body;

      if (
        !owner ||
        !premium ||
        !sumAssured ||
        !duration ||
        !chainId ||
        !signature
      ) {
        throw new BadRequestException('Missing required parameters');
      }

      // Convert string values to BigInt
      const premiumWei = BigInt(premium);
      const sumAssuredWei = BigInt(sumAssured);
      const durationSec = BigInt(duration);
      const chainIdBigInt = BigInt(chainId);

      const isValid = this.signatureService.verifyPolicySignature(
        owner,
        premiumWei,
        sumAssuredWei,
        durationSec,
        chainIdBigInt,
        signature,
      );

      return {
        success: true,
        isValid,
        details: {
          owner,
          premium: premiumWei.toString(),
          sumAssured: sumAssuredWei.toString(),
          duration: durationSec.toString(),
          chainId: chainIdBigInt.toString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to verify policy signature: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('admin-address')
  getAdminAddress() {
    return {
      success: true,
      adminAddress: this.signatureService.getAdminAddress(),
    };
  }
}
