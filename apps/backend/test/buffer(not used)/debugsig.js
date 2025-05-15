// Debug utility to compare signatures
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function debugSignatures() {
  // Input parameters exactly as in your request
  const age = 30;
  const gender = "male";
  const occupation = "engineer";
  const sumAssured = 10000;
  const premiumInThb = 17; // Note this is the exact value you're sending

  // Signature from your request
  const providedSignature = "0x124ef5098d9034bbb54f4ae01027043019fe9e26b38ca0f65127c6d3751d1b6646c869db46edce0434fcb1ac34c2860aee21981598e1341477c543d5a23ac3531b";
  
  try {
    // Load the admin private key
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminKey) {
      throw new Error("ADMIN_PRIVATE_KEY not set in the environment");
    }

    const wallet = new ethers.Wallet(adminKey);
    console.log("👤 Admin address:", wallet.address);

    // Test different formats to find the exact matching one
    const formats = [
      // Format 1: Using Number(x).toFixed(6)
      Number(premiumInThb).toFixed(6),
      // Format 2: Using exact value 17.000000
      "17.000000",
      // Format 3: Plain number
      String(premiumInThb),
      // Format 4: premiumInThb.toFixed(6) directly
      premiumInThb.toFixed(6)
    ];

    // Test each format
    for (let i = 0; i < formats.length; i++) {
      const formattedPremium = formats[i];
      console.log(`\n🧪 Testing Format ${i+1}: "${formattedPremium}"`);
      
      const message = `${age},${gender},${occupation},${sumAssured},${formattedPremium}`;
      console.log("Message:", message);
      
      const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
      console.log("Hash:", messageHash);
      
      const messageBytes = ethers.getBytes(messageHash);
      const signature = await wallet.signMessage(messageBytes);
      
      console.log("Generated signature:", signature);
      console.log("Matches provided?", signature === providedSignature);
      
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(messageBytes, signature);
      console.log("Recovered address:", recoveredAddress);
      console.log("Valid signature:", recoveredAddress.toLowerCase() === wallet.address.toLowerCase());
      
      // Also check if our provided signature would verify with this message format
      try {
        const recoveredFromProvided = ethers.verifyMessage(messageBytes, providedSignature);
        console.log("Provided signature recovers address:", recoveredFromProvided);
        console.log("Provided signature valid for this format:", 
          recoveredFromProvided.toLowerCase() === wallet.address.toLowerCase());
      } catch (e) {
        console.log("❌ Cannot verify provided signature with this format:", e.message);
      }
    }
  } catch (error) {
    console.error("❌ Error during debug:", error.message);
  }
}

debugSignatures().catch(console.error);