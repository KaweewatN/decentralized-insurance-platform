const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function generateSignature() {
  const age = 30;
  const gender = "male";
  const occupation = "engineer";
  const sumAssured = 10000;
  const premiumInThb = 17.000000;

  try {
    // Load the admin private key
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminKey) {
      throw new Error("ADMIN_PRIVATE_KEY not set in the environment");
    }

    const wallet = new ethers.Wallet(adminKey);
    console.log("👤 Admin address:", wallet.address);

    // Format the premium consistently to 6 decimal places
    const formattedPremium = Number(premiumInThb).toFixed(6);
    
    // Exactly match the message format from LifeCareLiteService.getMessageHash
    const message = `${age},${gender},${occupation},${sumAssured},${formattedPremium}`;
    console.log("\n📝 Message string:", message);
    
    // Generate the message hash using keccak256
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
    console.log("🔑 Generated message hash:", messageHash);

    // Sign the message hash bytes
    const messageBytes = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageBytes);
    console.log("✅ Generated signature:", signature);

    // Log verification details for debugging
    console.log("\n🔍 Verification details:");
    console.log("Message:", message);
    console.log("Hash:", messageHash);
    console.log("Signature:", signature);
    
    // Verify the signature (optional check)
    const recoveredAddress = ethers.verifyMessage(messageBytes, signature);
    console.log("Recovered address:", recoveredAddress);
    console.log("Admin address:", wallet.address);
    console.log("Valid signature:", recoveredAddress.toLowerCase() === wallet.address.toLowerCase());

    // Prepare the JSON payload for Postman - ensure exact format
    const postmanPayload = {
      age,
      gender,
      occupation,
      sumAssured,
      premiumInThb: Number(formattedPremium),
      signature
    };

    console.log("\n📦 Ready-to-use JSON for Postman:\n");
    console.log(JSON.stringify(postmanPayload, null, 2));
  } catch (error) {
    console.error("❌ Error generating signature:", error.message);
  }
}

generateSignature().catch(console.error);