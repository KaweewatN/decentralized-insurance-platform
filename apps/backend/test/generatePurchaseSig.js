const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function createExactBackendSignature() {
  try {
    console.log("=== CREATING EXACT BACKEND SIGNATURE ===");
    
    // 1. Load private key and create wallet
    const adminKey = process.env.ADMIN_PRIVATE_KEY || '';
    if (!adminKey) {
      throw new Error("Admin private key not found in environment variables");
    }
    
    // Connect to provider
    const rpcUrl = process.env.SEPOLIA_RPC || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
    console.log(`Using RPC URL: ${rpcUrl.substring(0, 20)}...`);
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(adminKey, provider);
    
    console.log(`Admin address: ${wallet.address}`);
    console.log(`Expected admin address: ${process.env.ADMIN_PUBLIC_KEY || ''}`);
    
    // 2. Fetch chain ID directly from provider
    console.log("\n=== FETCHING NETWORK DATA ===");
    let chainId;
    try {
      const network = await provider.getNetwork();
      chainId = network.chainId;
      console.log(`Chain ID: ${chainId} (${network.name})`);
    } catch (error) {
      console.error(`Failed to fetch chain ID from provider: ${error.message}`);
      // Sepolia testnet chain ID as fallback
      chainId = 11155111n;
      console.log(`Using fallback Chain ID for Sepolia: ${chainId}`);
    }
    
    // 3. Fetch exchange rate or use a default value
    console.log("\n=== FETCHING EXCHANGE RATE ===");
    let ethToThbRate;
    try {
      const rateResponse = await axios.get('http://localhost:3000/api/contracts/current-rate');
      ethToThbRate = rateResponse.data.ethToThbRate;
      
      if (ethToThbRate === undefined || ethToThbRate === null || isNaN(ethToThbRate)) {
        throw new Error('Invalid exchange rate received from API');
      }
      
      console.log(`ETH to THB rate: ${ethToThbRate}`);
    } catch (error) {
      console.error(`Failed to fetch exchange rate: ${error.message}`);
      // Use a default ETH to THB rate as fallback
      ethToThbRate = 68000; // Approximate rate
      console.log(`Using fallback ETH to THB rate: ${ethToThbRate}`);
    }
    
    // 4. Policy information
    const userId = "0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953";
    const sumAssured = 10000; // THB
    const premium = 17; // THB
    
    // Duration - match the format in the backend exactly
    const duration = 80 * 365 * 24 * 60 * 60; // 80 years in seconds
    console.log(`Duration: ${duration} seconds`);
    
    // 5. Convert values using the EXACT same method as backend
    console.log("\n=== CALCULATING WEI VALUES ===");
    
    const premiumInEth = premium / ethToThbRate;
    const sumAssuredInEth = sumAssured / ethToThbRate;
    
    // Format the premium exactly as backend does (6 decimal places)
    const formattedPremiumEth = Number(premiumInEth.toFixed(6)).toString();
    const premiumWei = ethers.parseEther(formattedPremiumEth);
    
    // Format sumAssured to match backend precision
    const formattedSumAssuredEth = sumAssuredInEth.toString();
    const sumAssuredWei = ethers.parseEther(formattedSumAssuredEth);
    
    console.log(`Premium: ${premium} THB = ${premiumInEth} ETH = ${premiumWei} Wei`);
    console.log(`Sum Assured: ${sumAssured} THB = ${sumAssuredInEth} ETH = ${sumAssuredWei} Wei`);
    
    // 6. Create message hash EXACTLY as in ContractsService.createPolicySignature
    console.log("\n=== CREATING MESSAGE HASH ===");
    
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [userId, premiumWei, sumAssuredWei, BigInt(duration), chainId]
      )
    );
    
    console.log(`Message hash: ${messageHash}`);
    
    // 7. Sign the message exactly as backend does
    console.log("\n=== SIGNING MESSAGE ===");
    
    const messageBytes = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageBytes);
    
    console.log(`Signature: ${signature}`);
    
    // Verify signature
    const ethSignedMessageHash = ethers.hashMessage(messageBytes);
    const recoveredAddress = ethers.recoverAddress(ethSignedMessageHash, signature);
    
    console.log(`Ethereum Signed Message Hash: ${ethSignedMessageHash}`);
    console.log(`Recovered address: ${recoveredAddress}`);
    console.log(`Matches wallet: ${recoveredAddress.toLowerCase() === wallet.address.toLowerCase()}`);
    
    // 8. Create payload for API
    const payload = {
      userId,
      fullName: "Backend Compatible User",
      age: 30,
      gender: "male",
      occupation: "engineer",
      contactInfo: "backend@example.com",
      sumAssured,
      premium,
      signature
    };
    
    console.log("\n=== API PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    
    return { success: true, payload };
  } catch (error) {
    console.error("\n=== ERROR OCCURRED ===");
    console.error(`Error message: ${error.message}`);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    return { success: false, error: error.message };
  }
}

// Execute the function
createExactBackendSignature().catch(console.error);