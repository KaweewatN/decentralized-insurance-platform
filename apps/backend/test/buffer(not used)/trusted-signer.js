const { ethers } = require('ethers');
require('dotenv').config();

async function checkTrustedSigner() {
  // ตั้งค่าการเชื่อมต่อกับบล็อกเชน
  const rpcUrl = process.env.SEPOLIA_RPC?.trim() || "https://ethereum-sepolia.publicnode.com";
  
  // กำหนดแอดเดรสของสัญญาโดยตรงหากไม่มีใน .env
  const lifeCareLiteAddress = process.env.LIFECARE_LITE_ADDRESS?.trim() || "0x93e9669e8B0ac891d233F43b81F8693FDAd2f307";
  
  console.log("Using RPC URL:", rpcUrl);
  console.log("Contract address:", lifeCareLiteAddress);
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // ใช้ ABI เฉพาะส่วนที่ต้องการ
  const abi = [
    "function trustedSigner() view returns (address)"
  ];
  
  const contract = new ethers.Contract(lifeCareLiteAddress, abi, provider);
  
  try {
    // ดึงค่า trustedSigner จากสัญญา
    const signer = await contract.trustedSigner();
    console.log("Trusted signer in contract:", signer);
    
    // เทียบกับแอดเดรสที่เราใช้
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || "daee72147f7914d7337682fc9c7fc305ebe92d6bae467d5f07de4765d830e8d6";
    const wallet = new ethers.Wallet(adminPrivateKey);
    console.log("Your admin address:", wallet.address);
    
    if (signer.toLowerCase() === wallet.address.toLowerCase()) {
      console.log("✅ Addresses match!");
    } else {
      console.log("❌ Addresses don't match! You need the private key for:", signer);
    }
  } catch (error) {
    console.error("Error calling trustedSigner():", error);
    
    // ถ้ามีข้อผิดพลาด ให้ลองดูว่าสัญญามีอยู่จริงหรือไม่
    try {
      const code = await provider.getCode(lifeCareLiteAddress);
      if (code === "0x") {
        console.error("No contract deployed at this address!");
      } else {
        console.log("Contract exists at this address, but trustedSigner function may not exist or has different signature");
      }
    } catch (err) {
      console.error("Error checking contract code:", err);
    }
  }
}

checkTrustedSigner().catch(console.error);