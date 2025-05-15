// finalPolicySignature.js
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function generateFinalPolicySignature() {
  // Policy data
  const userId = "0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953";
  const fullName = "John Doe";
  const age = 30;
  const gender = "male";
  const occupation = "engineer";
  const contactInfo = "john@example.com";
  const sumAssured = 10000; // THB
  const premium = 17; // THB

  try {
    // Load admin key
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminKey) {
      throw new Error("ADMIN_PRIVATE_KEY not set in the environment");
    }

    const wallet = new ethers.Wallet(adminKey);
    console.log("Admin address:", wallet.address);
    console.log("ADMIN_PUBLIC_KEY env:", process.env.ADMIN_PUBLIC_KEY);
    console.log("Match:", wallet.address.toLowerCase() === process.env.ADMIN_PUBLIC_KEY.toLowerCase());

    // Get chain ID
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    console.log("Chain ID:", chainId.toString());

    // Convert THB values to Wei
    const ethToThbRate = 100000;
    const premiumInEth = premium / ethToThbRate;
    const sumAssuredInEth = sumAssured / ethToThbRate;
    
    const premiumInWei = ethers.parseEther(premiumInEth.toString());
    const sumAssuredInWei = ethers.parseEther(sumAssuredInEth.toString());
    
    console.log("\nPremium:", premium, "THB =", premiumInEth, "ETH =", premiumInWei.toString(), "Wei");
    console.log("Sum Assured:", sumAssured, "THB =", sumAssuredInEth, "ETH =", sumAssuredInWei.toString(), "Wei");

    // Set duration (80 years in seconds)
    const duration = BigInt(80 * 365 * 24 * 60 * 60);
    console.log("Duration:", duration.toString(), "seconds");

    // Create message hash like the smart contract
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [userId, premiumInWei, sumAssuredInWei, duration, chainId]
    );
    console.log("\nMessage hash:", messageHash);

    // Sign the message hash
    const messageBytes = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageBytes);
    console.log("Signature:", signature);

    // Verify the signature matches what the backend expects
    const recoveredAddress = ethers.verifyMessage(messageBytes, signature);
    console.log("\nRecovered address:", recoveredAddress);
    console.log("Match wallet:", recoveredAddress.toLowerCase() === wallet.address.toLowerCase());
    
    // Create final payload
    const payload = {
      userId,
      fullName,
      age,
      gender,
      occupation,
      contactInfo,
      sumAssured,
      premium,
      signature
    };
    
    console.log("\nFinal JSON Payload:");
    console.log(JSON.stringify(payload, null, 2));
    
    console.log("\ncURL Command:");
    console.log(`curl -X POST http://localhost:3000/api/life-care-lite/purchase-policy \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

generateFinalPolicySignature().catch(console.error);