// checkWallets.js
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function checkWallets() {
  try {
    console.log("=== CHECKING WALLET ADDRESSES ===");
    
    // ดึงค่า private key จาก .env
    const privateKey = process.env.PRIVATE_KEY || '';
    const adminKey = process.env.ADMIN_PRIVATE_KEY || '';
    const expectedAdminAddress = process.env.ADMIN_PUBLIC_KEY || '';
    
    console.log(`PRIVATE_KEY present: ${privateKey.length > 0 ? 'Yes' : 'No'}`);
    console.log(`ADMIN_PRIVATE_KEY present: ${adminKey.length > 0 ? 'Yes' : 'No'}`);
    console.log(`ADMIN_PUBLIC_KEY present: ${expectedAdminAddress.length > 0 ? 'Yes' : 'No'}`);
    
    // ตรวจสอบว่าค่าเหมือนกันหรือไม่
    console.log(`\nPRIVATE_KEY and ADMIN_PRIVATE_KEY are identical: ${privateKey === adminKey}`);
    
    if (!privateKey || !adminKey) {
      throw new Error("Missing private keys in environment variables");
    }
    
    // สร้าง wallet จาก private key
    const serviceWallet = new ethers.Wallet(privateKey);
    const adminWallet = new ethers.Wallet(adminKey);
    
    console.log(`\nService wallet address (from PRIVATE_KEY): ${serviceWallet.address}`);
    console.log(`Admin wallet address (from ADMIN_PRIVATE_KEY): ${adminWallet.address}`);
    console.log(`Expected admin address (from ADMIN_PUBLIC_KEY): ${expectedAdminAddress}`);
    
    // ตรวจสอบว่า wallet address ตรงกับที่คาดหวังหรือไม่
    console.log(`\nService wallet matches admin wallet: ${serviceWallet.address.toLowerCase() === adminWallet.address.toLowerCase()}`);
    console.log(`Admin wallet matches expected admin: ${adminWallet.address.toLowerCase() === expectedAdminAddress.toLowerCase()}`);
    console.log(`Service wallet matches expected admin: ${serviceWallet.address.toLowerCase() === expectedAdminAddress.toLowerCase()}`);
    
    // ถ้า wallet address ไม่ตรงกับที่คาดหวัง
    if (adminWallet.address.toLowerCase() !== expectedAdminAddress.toLowerCase()) {
      console.log("\n⚠️ WARNING: Admin wallet address does not match ADMIN_PUBLIC_KEY!");
      console.log("This is likely why signature verification is failing.");
      
      // สร้าง wallet ใหม่เพื่อดูว่า private key ถูกต้องหรือไม่
      console.log("\n=== GENERATING CORRECT PRIVATE KEY ===");
      
      // สร้าง wallet ใหม่
      const newWallet = ethers.Wallet.createRandom();
      console.log(`New random wallet address: ${newWallet.address}`);
      console.log(`New random private key: ${newWallet.privateKey}`);
      
      // แนะนำวิธีแก้ไข
      console.log("\nTo fix this issue, update your .env file with matching private and public keys.");
    }
    
    return {
      serviceWallet: serviceWallet.address,
      adminWallet: adminWallet.address,
      expectedAdmin: expectedAdminAddress,
      keysMatch: privateKey === adminKey,
      addressesMatch: serviceWallet.address.toLowerCase() === adminWallet.address.toLowerCase()
    };
  } catch (error) {
    console.error("Error:", error.message);
    return { error: error.message };
  }
}

checkWallets().catch(console.error);