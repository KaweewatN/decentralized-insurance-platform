// messageHashTest.ts
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function testMessageHash() {
  try {
    // Sample Data
    const owner = '0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953';
    const premiumWei = BigInt('199785420547274'); // Sample premium in Wei
    const sumAssuredWei = BigInt('117520835616043600'); // Sample sum assured in Wei
    const duration = BigInt(80 * 365 * 24 * 60 * 60); // 80 years in seconds

    // Get Chain ID
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const network = await provider.getNetwork();
    const chainId = BigInt(network.chainId);
    console.log('Chain ID:', chainId.toString());

    // Generate message hash (Backend)
    const backendMessageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [owner, premiumWei, sumAssuredWei, duration, chainId],
    );
    console.log('\nBackend Message Hash:', backendMessageHash);

    // Generate message hash (Smart Contract simulation)
    const encodedPacked = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [owner, premiumWei, sumAssuredWei, duration, chainId],
    );
    console.log('\nSmart Contract Message Hash:', encodedPacked);

    // Check if they match
    const isMatch = backendMessageHash === encodedPacked;
    console.log('\n🔍 Message Hash Match:', isMatch ? '✅ PASS' : '❌ FAIL');

    if (!isMatch) {
      console.error(
        '\n❌ Message hashes do not match. Please check your encoding.',
      );
    }

    // Generate Ethereum Signed Message Hash
    const ethSignedMessageHash = ethers.hashMessage(
      ethers.getBytes(backendMessageHash),
    );
    console.log('\nEthereum Signed Message Hash:', ethSignedMessageHash);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMessageHash();
