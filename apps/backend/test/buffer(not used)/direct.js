const { ethers } = require('ethers');
require('dotenv').config();

async function callContractDirectly() {
  const rpcUrl = process.env.SEPOLIA_RPC?.trim() || "https://ethereum-sepolia.publicnode.com";
  const privateKey = process.env.ADMIN_PRIVATE_KEY || "daee72147f7914d7337682fc9c7fc305ebe92d6bae467d5f07de4765d830e8d6";
  const contractAddress = process.env.LIFECARE_LITE_ADDRESS?.trim() || "0x454873572a1F997AABCB3B0d78AAB047bFbb5E7c";
  
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
  const premium = 5;
  const ethAmount = premium / 100000; // 0.00005 ETH
  
  // สร้าง policyData
  const policyData = ethers.toUtf8Bytes(`${fullName},${age},${gender},${occupation},${contactInfo}`);
  
  // อ่าน ABI จากไฟล์
  const abiPath = '../abis/LifeCareLite.json'; // ปรับเปลี่ยนตามที่อยู่จริง
  const abi = require(abiPath).abi;
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  // สร้าง messageHash และลายเซ็น
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
  
  try {
    console.log("Calling contract directly...");
    console.log("Owner:", owner);
    console.log("PolicyData:", ethers.hexlify(policyData));
    console.log("Premium Wei:", premiumWei.toString());
    console.log("Sum Assured:", sumAssured);
    console.log("Duration:", duration);
    console.log("Signature:", signature);
    console.log("ETH Amount:", ethAmount);
    
    const tx = await contract.purchasePolicy(
      owner,
      policyData,
      premiumWei,
      sumAssured,
      duration,
      signature,
      {
        value: ethers.parseEther(ethAmount.toString())
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block", receipt.blockNumber);
  } catch (error) {
    console.error("Error:", error);
  }
}

callContractDirectly().catch(console.error);