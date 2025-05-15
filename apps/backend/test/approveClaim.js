// approveClaim.js
const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function approveClaim() {
  try {
    // 1. กำหนดข้อมูลที่จำเป็น
    const policyId = "YPOLICY-0xa9a446ebd7cd4ae85c05a288d7d4189a24d2163d951a4070c9df99c35e5aa2f7"; // ระบุ policy ID ที่ต้องการอนุมัติเคลม
    
    console.log(`Policy ID: ${policyId}`);
    
    // 2. สร้าง signature
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    const wallet = new ethers.Wallet(adminKey);
    
    // สร้าง message hash
    const messageHash = ethers.solidityPackedKeccak256(
      ['bytes32'],
      [policyId]
    );
    
    const messageBytes = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageBytes);
    
    console.log(`\nSignature: ${signature}`);
    console.log(`Signer Address: ${wallet.address}`);
    
    // 3. ส่ง request ไปยัง endpoint
    const payload = {
      policyId,
      signature
    };
    
    console.log("\nAPI Payload:");
    console.log(JSON.stringify(payload, null, 2));
    
    console.log("\ncURL command:");
    console.log(`curl -X POST http://localhost:3000/api/life-care-lite/approve-claim \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`);
    
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

approveClaim().catch(console.error);