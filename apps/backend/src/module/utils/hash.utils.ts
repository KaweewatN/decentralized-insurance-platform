// src/utils/hash.utils.ts
import { ethers } from 'ethers';

/**
 * Generate a hash compatible with the smart contract's keccak256(abi.encodePacked(...))
 */
export function generateSolidityHash(types: string[], values: any[]): string {
  // Pack according to solidity rules
  const packed = ethers.solidityPacked(types, values);
  // Hash using keccak256
  return ethers.keccak256(packed);
}

/**
 * Generate a policy hash using the same format as the smart contract
 */
export function generatePolicyHash(
  userAddress: string,
  premiumWei: bigint,
  sumAssuredWei: bigint,
  duration: number,
  chainId: number,
): string {
  // Use ethers.solidityPackedKeccak256 instead of regular keccak256
  return ethers.solidityPackedKeccak256(
    ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
    [userAddress, premiumWei, sumAssuredWei, duration, chainId],
  );
}
/**
 * Generate a hash for claim verification
 */
export function generateClaimHash(
  policyId: string,
  amount: number,
  documentHash: string,
  chainId: number,
): string {
  return generateSolidityHash(
    ['bytes32', 'uint256', 'string', 'uint256'],
    [policyId, amount, documentHash, chainId],
  );
}

/**
 * Generate a hash for policy cancellation
 */
export function generateCancelHash(
  policyId: string,
  owner: string,
  refundAmount: number,
  chainId: number,
): string {
  return generateSolidityHash(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
    [policyId, owner, refundAmount, 0, chainId],
  );
}
