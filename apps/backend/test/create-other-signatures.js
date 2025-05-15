
const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });

async function createOtherSignatures() {
  try {
    // อ่าน policyId จากไฟล์
    if (!fs.existsSync('policy-id.txt')) {
      console.error("Error: policy-id.txt not found. Please run test-purchase.js first to get a policy ID.");
      return;
    }
    
    const policyId = fs.readFileSync('policy-id.txt', 'utf8').trim();
    console.log(`Using policy ID: ${policyId}`);
    
    console.log("=== ENVIRONMENT CONFIGURATION ===");
    // Print important environment variables without showing full private key
    const adminKey = process.env.ADMIN_PRIVATE_KEY || '';
    console.log(`ADMIN_PRIVATE_KEY present: ${adminKey.length > 0 ? 'Yes' : 'No'}`);
    if (adminKey.length > 0) {
      const maskedKey = adminKey.substring(0, 6) + '...' + adminKey.substring(adminKey.length - 4);
      console.log(`ADMIN_PRIVATE_KEY (masked): ${maskedKey}`);
    }
    
    // Create wallet from the admin key to check address
    const wallet = new ethers.Wallet(adminKey);
    console.log(`\nDerived wallet address: ${wallet.address}`);
    
    // Get network info to confirm chain ID
    console.log("\n=== FETCHING NETWORK DATA ===");
    const networkInfo = await axios.get('http://localhost:3000/api/contracts/network');
    const chainId = BigInt(networkInfo.data.chainId);
    console.log(`Network chain ID: ${chainId}`);
    
    // Get current rate
    console.log("\n=== FETCHING RATE DATA ===");
    try {
      await axios.get('http://localhost:3000/api/contracts/eth-to-thb');
      console.log("Successfully refreshed ETH/THB rate");
    } catch (e) {
      console.warn("⚠️ Could not refresh rate:", e.message);
    }
    
    const rateResponse = await axios.get('http://localhost:3000/api/contracts/current-rate');
    if (!rateResponse.data.success) {
      throw new Error("No cached rate available");
    }
    const ethToThbRate = rateResponse.data.ethToThbRate;
    console.log(`Current ETH/THB rate: ${ethToThbRate}`);
    
    // Common variables
    const userId = "0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953";
    
    // For tracking all signatures
    const signatures = {};
    
    // 1. CREATE FILE CLAIM SIGNATURE
    console.log("\n=== FILE CLAIM SIGNATURE ===");
    const claimAmount = 5000; // THB
    const documentHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    // Convert claim amount to wei
    const claimAmountInEth = claimAmount / ethToThbRate;
    const claimAmountWei = ethers.parseEther(Number(claimAmountInEth.toFixed(18)).toString());
    
    const claimMessageHash = ethers.solidityPackedKeccak256(
      ['string', 'address', 'uint256', 'bytes32', 'uint256'],
      [policyId, userId, claimAmountWei, documentHash, chainId]
    );
    
    console.log(`Claim message hash: ${claimMessageHash}`);
    
    const claimMessageBytes = ethers.getBytes(claimMessageHash);
    const claimSignature = await wallet.signMessage(claimMessageBytes);
    
    // Verify signature
    const claimRecoveredAddress = ethers.verifyMessage(claimMessageBytes, claimSignature);
    console.log(`Claim signature: ${claimSignature}`);
    console.log(`Recovered address: ${claimRecoveredAddress}`);
    console.log(`Matches our wallet: ${claimRecoveredAddress.toLowerCase() === wallet.address.toLowerCase()}`);
    
    signatures.claim = {
      signature: claimSignature,
      payload: {
        policyId,
        userId,
        amount: claimAmount,
        documentHash,
        signature: claimSignature
      }
    };
    
    // 2. CREATE APPROVE CLAIM SIGNATURE
    console.log("\n=== APPROVE CLAIM SIGNATURE ===");
    
    const approveMessageHash = ethers.solidityPackedKeccak256(
      ['string', 'uint256'],
      [policyId, chainId]
    );
    
    console.log(`Approve message hash: ${approveMessageHash}`);
    
    const approveMessageBytes = ethers.getBytes(approveMessageHash);
    const approveSignature = await wallet.signMessage(approveMessageBytes);
    
    // Verify signature
    const approveRecoveredAddress = ethers.verifyMessage(approveMessageBytes, approveSignature);
    console.log(`Approve signature: ${approveSignature}`);
    console.log(`Recovered address: ${approveRecoveredAddress}`);
    console.log(`Matches our wallet: ${approveRecoveredAddress.toLowerCase() === wallet.address.toLowerCase()}`);
    
    signatures.approve = {
      signature: approveSignature,
      payload: {
        policyId,
        signature: approveSignature
      }
    };
    
    // 3. CREATE CANCEL POLICY SIGNATURE
    console.log("\n=== CANCEL POLICY SIGNATURE ===");
    const refundAmount = 10; // THB
    
    // Convert refund amount to wei
    const refundAmountInEth = refundAmount / ethToThbRate;
    const refundAmountWei = ethers.parseEther(Number(refundAmountInEth.toFixed(18)).toString());
    
    const cancelMessageHash = ethers.solidityPackedKeccak256(
      ['string', 'uint256', 'uint256'],
      [policyId, refundAmountWei, chainId]
    );
    
    console.log(`Cancel message hash: ${cancelMessageHash}`);
    
    const cancelMessageBytes = ethers.getBytes(cancelMessageHash);
    const cancelSignature = await wallet.signMessage(cancelMessageBytes);
    
    // Verify signature
    const cancelRecoveredAddress = ethers.verifyMessage(cancelMessageBytes, cancelSignature);
    console.log(`Cancel signature: ${cancelSignature}`);
    console.log(`Recovered address: ${cancelRecoveredAddress}`);
    console.log(`Matches our wallet: ${cancelRecoveredAddress.toLowerCase() === wallet.address.toLowerCase()}`);
    
    signatures.cancel = {
      signature: cancelSignature,
      payload: {
        policyId,
        refundAmount,
        signature: cancelSignature
      }
    };
    
    // Save all signatures and payloads to a file
    fs.writeFileSync('all-signatures.json', JSON.stringify(signatures, null, 2));
    console.log("\nAll signatures and payloads written to all-signatures.json");
    
    // สร้างสคริปต์ทดสอบสำหรับแต่ละ endpoint
    const testFileClaim = `
const axios = require('axios');
const fs = require('fs');

async function testFileClaim() {
  try {
    console.log("=== TESTING FILE CLAIM API ===");
    // อ่านข้อมูลลายเซ็นจากไฟล์
    const signatures = JSON.parse(fs.readFileSync('all-signatures.json', 'utf8'));
    
    // API Endpoint
    const url = 'http://localhost:3000/life-care-lite/file-claim';
    
    const payload = signatures.claim.payload;
    
    console.log("Request payload:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload);
    console.log('File Claim Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error filing claim:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

testFileClaim();
    `;
    
    const testApproveClaim = `
const axios = require('axios');
const fs = require('fs');

async function testApproveClaim() {
  try {
    console.log("=== TESTING APPROVE CLAIM API ===");
    // อ่านข้อมูลลายเซ็นจากไฟล์
    const signatures = JSON.parse(fs.readFileSync('all-signatures.json', 'utf8'));
    
    // API Endpoint
    const url = 'http://localhost:3000/life-care-lite/approve-claim';
    
    const payload = signatures.approve.payload;
    
    console.log("Request payload:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload);
    console.log('Approve Claim Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error approving claim:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

testApproveClaim();
    `;
    
    const testCancelPolicy = `
const axios = require('axios');
const fs = require('fs');

async function testCancelPolicy() {
  try {
    console.log("=== TESTING CANCEL POLICY API ===");
    // อ่านข้อมูลลายเซ็นจากไฟล์
    const signatures = JSON.parse(fs.readFileSync('all-signatures.json', 'utf8'));
    
    // API Endpoint
    const url = 'http://localhost:3000/life-care-lite/cancel-policy';
    
    const payload = signatures.cancel.payload;
    
    console.log("Request payload:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload);
    console.log('Cancel Policy Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling policy:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

testCancelPolicy();
    `;
    
    // บันทึกสคริปต์ทดสอบ
    fs.writeFileSync('test-file-claim.js', testFileClaim);
    fs.writeFileSync('test-approve-claim.js', testApproveClaim);
    fs.writeFileSync('test-cancel-policy.js', testCancelPolicy);
    
    console.log("\n=== TEST SCRIPTS CREATED ===");
    console.log("1. test-file-claim.js - to test filing a claim");
    console.log("2. test-approve-claim.js - to test approving a claim");
    console.log("3. test-cancel-policy.js - to test cancelling a policy");
    
    return signatures;
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

createOtherSignatures().catch(console.error);
    