// deployVaultWithOwner.js
const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

async function deployVaultWithOwner() {
  try {
    // กำหนด owner address ที่ต้องการ
    const ownerAddress = "0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953";

    console.log(`Deploying InsuranceVault with owner: ${ownerAddress}`);

    // เรียก API เพื่อ deploy vault
    const response = await axios.post(
      "http://localhost:3000/api/contracts/deploy-vault",
      {
        owner: ownerAddress,
      }
    );

    // แสดงผล address ของ vault ที่ deploy แล้ว
    const vaultAddress = response.data.address;
    console.log(`✅ InsuranceVault deployed at: ${vaultAddress}`);
    console.log(`🔑 Owner: ${ownerAddress}`);

    // บันทึก address ลงในไฟล์เพื่อใช้ในภายหลัง
    console.log("\nCopy this line to your .env file:");
    console.log(`VAULT_ADDRESS=${vaultAddress}`);

    return vaultAddress;
  } catch (error) {
    console.error("❌ Error deploying vault:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

deployVaultWithOwner().catch(console.error);