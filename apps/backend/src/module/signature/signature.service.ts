// signature.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private adminPublicKey: string;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl =
      this.configService.get<string>('SEPOLIA_RPC') ||
      this.configService.get<string>('ETH_RPC_URL');
    const privateKey = this.configService.get<string>('ADMIN_PRIVATE_KEY');
    this.adminPublicKey =
      this.configService.get<string>('ADMIN_PUBLIC_KEY') ||
      '0xYourAdminAddressHere';

    if (!rpcUrl || !privateKey) {
      throw new Error(
        '❌ Missing environment variables: SEPOLIA_RPC/ETH_RPC_URL, ADMIN_PRIVATE_KEY',
      );
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    this.logger.log(
      `✅ SignatureService initialized with admin address: ${this.adminPublicKey.substring(0, 10)}...`,
    );
  }

  /**
   * Get the admin address used for signatures
   */
  public getAdminAddress(): string {
    return this.adminPublicKey;
  }

  /**
   * Hash a message using keccak256.
   * @param message - The message to hash
   * @returns The keccak256 hash
   */
  public hashMessage(message: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(message));
  }

  /**
   * Sign a plain text message.
   * @param message - The message to sign
   * @returns A promise that resolves to the digital signature
   */
  public async signMessage(message: string): Promise<string> {
    try {
      const signature = await this.wallet.signMessage(message);
      this.logger.log(`✅ Message signed successfully`);
      return signature;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`🚫 Failed to sign message: ${error.message}`);
      } else {
        this.logger.error(`🚫 Unknown error while signing message: ${error}`);
      }
      throw new Error('Unable to sign message');
    }
  }

  /**
   * Sign a hashed message.
   * @param messageHash - The hash to sign
   * @returns A promise that resolves to the digital signature
   */
  public async signHash(messageHash: string): Promise<string> {
    try {
      const messageBytes = ethers.getBytes(messageHash);
      const signature = await this.wallet.signMessage(messageBytes);
      this.logger.log(`✅ Hash signed successfully`);
      return signature;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`🚫 Failed to sign hash: ${error.message}`);
      } else {
        this.logger.error(`🚫 Unknown error while signing hash: ${error}`);
      }
      throw new Error('Unable to sign hash');
    }
  }

  /**
   * Generate a policy purchase signature.
   * @param owner - Owner address
   * @param premium - Premium amount in Wei
   * @param sumAssured - Sum assured amount in Wei
   * @param duration - Duration in seconds
   * @returns A promise that resolves to the digital signature
   */
  public async signPolicyPurchase(
    owner: string,
    premium: bigint,
    sumAssured: bigint,
    duration: bigint,
  ): Promise<string> {
    try {
      // Get chain ID
      const network = await this.provider.getNetwork();
      const chainId = network.chainId;

      // Create message hash exactly like the smart contract
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [owner, premium, sumAssured, duration, BigInt(chainId)],
      );

      // Sign the message hash
      const messageBytes = ethers.getBytes(messageHash);
      const signature = await this.wallet.signMessage(messageBytes);

      this.logger.log(`✅ Policy purchase signed for user: ${owner}`);
      this.logger.debug(`Message hash: ${messageHash}`);
      this.logger.debug(`Signature: ${signature}`);

      return signature;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `🚫 Failed to sign policy purchase: ${error.message}`,
        );
      } else {
        this.logger.error(
          `🚫 Unknown error while signing policy purchase: ${error}`,
        );
      }
      throw new Error('Unable to sign policy purchase');
    }
  }

  /**
   * Generate a claim signature.
   * @param policyId - Policy ID
   * @param amount - Claim amount in Wei
   * @param documentHash - Document hash
   * @returns A promise that resolves to the digital signature
   */
  public async signClaim(
    policyId: string,
    amount: bigint,
    documentHash: string,
  ): Promise<string> {
    try {
      // Get chain ID
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      // Create message hash exactly like the smart contract
      const messageHash = ethers.solidityPackedKeccak256(
        ['string', 'uint256', 'string', 'uint256'],
        [policyId, amount, documentHash, BigInt(chainId)],
      );

      // Sign the message hash
      const messageBytes = ethers.getBytes(messageHash);
      const signature = await this.wallet.signMessage(messageBytes);

      this.logger.log(`✅ Claim signed for policy: ${policyId}`);
      this.logger.debug(`Message hash: ${messageHash}`);
      this.logger.debug(`Signature: ${signature}`);

      return signature;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`🚫 Failed to sign claim: ${error.message}`);
      } else {
        this.logger.error(`🚫 Unknown error while signing claim: ${error}`);
      }
      throw new Error('Unable to sign claim');
    }
  }

  /**
   * Generate a policy cancellation signature.
   * @param policyId - Policy ID
   * @param owner - Owner address
   * @param refundAmount - Refund amount in Wei
   * @returns A promise that resolves to the digital signature
   */
  public async signPolicyCancel(
    policyId: string,
    owner: string,
    refundAmount: bigint,
  ): Promise<string> {
    try {
      // Get chain ID
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      // Create message hash exactly like the smart contract
      const messageHash = ethers.solidityPackedKeccak256(
        ['string', 'address', 'uint256', 'uint256'],
        [policyId, owner, refundAmount, BigInt(chainId)],
      );

      // Sign the message hash
      const messageBytes = ethers.getBytes(messageHash);
      const signature = await this.wallet.signMessage(messageBytes);

      this.logger.log(`✅ Policy cancellation signed for policy: ${policyId}`);
      this.logger.debug(`Message hash: ${messageHash}`);
      this.logger.debug(`Signature: ${signature}`);

      return signature;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `🚫 Failed to sign policy cancellation: ${error.message}`,
        );
      } else {
        this.logger.error(
          `🚫 Unknown error while signing policy cancellation: ${error}`,
        );
      }
      throw new Error('Unable to sign policy cancellation');
    }
  }

  /**
   * Verify a signature.
   * @param messageHash - The hashed message
   * @param signature - The signature to verify
   * @returns True if the signature is valid, false otherwise
   */
  public verifySignature(messageHash: string, signature: string): boolean {
    try {
      this.logger.debug(
        `Verifying signature with admin key: ${this.adminPublicKey}`,
      );

      const messageBytes = ethers.getBytes(messageHash);
      const recoveredAddress = ethers.verifyMessage(messageBytes, signature);

      this.logger.debug(`Recovered address: ${recoveredAddress}`);

      const isValid =
        recoveredAddress.toLowerCase() === this.adminPublicKey.toLowerCase();
      this.logger.log(
        `Signature verification: ${isValid ? 'Valid ✅' : 'Invalid ❌'}`,
      );

      return isValid;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`🚫 Signature verification failed: ${error.message}`);
      } else {
        this.logger.error(`🚫 Unknown error during verification: ${error}`);
      }
      return false;
    }
  }

  /**
   * Verify a policy purchase signature.
   * @param owner - Owner address
   * @param premium - Premium amount in Wei
   * @param sumAssured - Sum assured amount in Wei
   * @param duration - Duration in seconds
   * @param chainId - Chain ID
   * @param signature - The signature to verify
   * @returns True if the signature is valid, false otherwise
   */
  public verifyPolicySignature(
    owner: string,
    premium: bigint,
    sumAssured: bigint,
    duration: bigint,
    chainId: bigint,
    signature: string,
  ): boolean {
    try {
      this.logger.log(`=== POLICY SIGNATURE VERIFICATION DETAILS ===`);
      this.logger.debug(`Owner address: ${owner}`);
      this.logger.debug(`Premium (Wei): ${premium.toString()}`);
      this.logger.debug(`Sum Assured (Wei): ${sumAssured.toString()}`);
      this.logger.debug(`Duration (seconds): ${duration.toString()}`);
      this.logger.debug(`Chain ID: ${chainId.toString()}`);
      this.logger.debug(`Admin public key: ${this.adminPublicKey}`);

      // Create message hash using solidityPackedKeccak256
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [owner, premium, sumAssured, duration, chainId],
      );
      this.logger.debug(`Message hash: ${messageHash}`);

      return this.verifySignature(messageHash, signature);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `🚫 Policy signature verification error: ${error.message}`,
        );
      } else {
        this.logger.error(
          `🚫 Unknown error during policy verification: ${error}`,
        );
      }
      return false;
    }
  }
}
