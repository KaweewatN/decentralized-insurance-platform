const { ethers } = require('ethers');
require('dotenv').config();

async function purchasePolicy() {
  const rpcUrl = process.env.SEPOLIA_RPC?.trim() || "https://ethereum-sepolia.publicnode.com";
  const privateKey = process.env.ADMIN_PRIVATE_KEY || "daee72147f7914d7337682fc9c7fc305ebe92d6bae467d5f07de4765d830e8d6";
  const contractAddress = "0x23eD7C8A0536Ab28A257e2258B009E3B64032D29";  // เปลี่ยนเป็น address ที่ต้องการ

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // ข้อมูลพื้นฐาน
  const owner = "0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953";
  const fullName = "John Doe";
  const age = 30;
  const gender = "male";
  const occupation = "engineer";
  const contactInfo = "johndoe@example.com";
  const sumAssured = 1000;
  const premium = 0.00005;  // 0.00005 ETH

  // สร้าง policyData
  const policyData = ethers.toUtf8Bytes(`${fullName},${age},${gender},${occupation},${contactInfo}`);
  
  // อ่าน ABI จากไฟล์
  const abiPath = '../abis/LifeCareLite.json'; // ปรับเปลี่ยนตามที่อยู่จริง
  const abi = require(abiPath).abi;
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("🔄 Sending ETH to contract...");
    
    // สร้าง messageHash และ signature
    const premiumWei = ethers.parseEther(premium.toString());
    const duration = 80 * 365 * 24 * 60 * 60; // 80 ปีในวินาที
    const chainId = (await provider.getNetwork()).chainId;

    const messageHash = ethers.keccak256(
      ethers.concat([
        ethers.zeroPadValue(owner.toLowerCase(), 20),
        policyData,
        ethers.zeroPadValue(ethers.toBeHex(premiumWei), 32),
        ethers.zeroPadValue(ethers.toBeHex(BigInt(sumAssured)), 32),
        ethers.zeroPadValue(ethers.toBeHex(BigInt(duration)), 32),
        ethers.zeroPadValue(ethers.toBeHex(BigInt(chainId)), 32)
      ])
    );

    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    // ส่ง transaction
    const tx = await contract.purchasePolicy(
      owner,
      policyData,
      premiumWei,
      sumAssured,
      duration,
      signature,
      {
        value: premiumWei, // 👈 ส่ง ETH ไปด้วย
      }
    );
    
    console.log("🚀 Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block", receipt.blockNumber);
  } catch (error) {
    console.error("❌ Error sending ETH to contract:", error);
  }
}

purchasePolicy();