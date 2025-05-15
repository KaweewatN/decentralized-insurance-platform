// test-signature.js
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function testSignature() {
  console.log('=== Signature Testing Tool ===');
  
  // Test data from your example
  const testData = {
    age: 30,
    gender: "male",
    occupation: "engineer",
    sumAssured: 10000,
    premiumInThb: 17.0,
    signature: "0x124ef5098d9034bbb54f4ae01027043019fe9e26b38ca0f65127c6d3751d1b6646c869db46edce0434fcb1ac34c2860aee21981598e1341477c543d5a23ac3531b"
  };
  
  console.log('Test data:', testData);
  
  // Get the admin private key
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!adminPrivateKey) {
    console.error('❌ ADMIN_PRIVATE_KEY is not set in .env file');
    process.exit(1);
  }

  // Create a wallet instance
  const wallet = new ethers.Wallet(adminPrivateKey);
  console.log('Admin address:', wallet.address);
  
  // Create the message string exactly as in generate-signature.js
  const message = `${testData.age},${testData.gender},${testData.occupation},${testData.sumAssured},${testData.premiumInThb.toFixed(6)}`;
  console.log('Message to verify:', message);
  
  // Hash the message using keccak256
  const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
  console.log('Message hash:', messageHash);
  
  try {
    // Verify the provided signature
    const messageBytes = ethers.getBytes(messageHash);
    const recoveredAddress = ethers.verifyMessage(messageBytes, testData.signature);
    console.log('Recovered address from signature:', recoveredAddress);
    console.log('Admin address:', wallet.address);
    console.log('Signature valid:', recoveredAddress.toLowerCase() === wallet.address.toLowerCase());
    
    // Generate a new signature for testing
    console.log('\n=== Generating new signature for testing ===');
    const newSignature = await wallet.signMessage(messageBytes);
    console.log('New signature:', newSignature);
  } catch (error) {
    console.error('❌ Error verifying signature:', error.message);
  }
}

testSignature().catch(console.error);