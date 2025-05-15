import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  /**
   * Generates a new Ethereum wallet address.
   * @returns A Promise that resolves to the generated wallet address
   */
  async generateWalletAddress(): Promise<string> {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  }

  /**
   * Signs a message using the given private key.
   * @param message - The message to sign
   * @param privateKey - The private key to use for signing
   * @returns A Promise that resolves to the message signature
   */
  async signMessage(message: string, privateKey: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
  }

  /**
   * Verifies a message signature.
   * @param message - The original message
   * @param signature - The signature to verify
   * @param address - The expected signing address
   * @returns True if the signature is valid, false otherwise
   */
  verifySignature(
    message: string,
    signature: string,
    address: string,
  ): boolean {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress === address;
  }
}
