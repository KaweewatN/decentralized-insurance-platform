// generate-signature.js

const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function generateSignature() {
  // Input data
  const age = 30;
  const gender = "male";
  const occupation = "engineer";
  const sumAssured = 10000;

  console.log("Loaded ADMIN_PRIVATE_KEY:", process.env.ADMIN_PRIVATE_KEY);

  // Calculate base THB premium per 100k coverage
  let baseThbPremium = 100;
  if (age < 25) baseThbPremium -= 20;
  else if (age < 40) baseThbPremium += 30;
  else if (age < 60) baseThbPremium += 70;
  else baseThbPremium += 120;
  
  if (gender.toLowerCase() === 'female') baseThbPremium -= 10;
  
  switch (occupation.toLowerCase()) { 
    case 'soldier':
    case 'firefighter':
    case 'police':
      baseThbPremium += 100;
      break;
    case 'construction worker':
    case 'miner':
    case 'pilot':
      baseThbPremium += 80;
      break;
    case 'teacher':
    case 'office worker':
    case 'software engineer':
      baseThbPremium += 20;
      break;
    default:
      baseThbPremium += 40;
  }

  // Calculate total premium in THB (no caps)
  // Calculate total premium in THB (no caps)
  const premiumInThb = (baseThbPremium * sumAssured) / 100000;
  console.log(`Calculated premium in THB: ${premiumInThb.toFixed(6)}`);

  
  // Fetch ETH→THB rate
  const ethToThbRate = await getEthToThbRate();
  console.log(`ETH to THB rate: ${ethToThbRate}`);
  
  // Convert THB to ETH
  const premiumInEth = premiumInThb / ethToThbRate;
  console.log(`Premium in ETH: ${premiumInEth}`);
  
  // Convert to Wei
  const premiumInWei = ethers.parseEther(premiumInEth.toFixed(18));
  console.log(`Premium in Wei: ${premiumInWei}`);
  
  // Build and hash message
  const message = `${age},${gender},${occupation},${sumAssured},${premiumInThb.toFixed(6)}`;
  console.log("Message string:", message);
  const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
  console.log("Message hash:", messageHash);
  
  // Sign with admin key
  const adminKey = process.env.ADMIN_PRIVATE_KEY;
  if (!adminKey) {
    console.error("❌ ADMIN_PRIVATE_KEY is not set in the .env file");
    process.exit(1);
  }

  const wallet = new ethers.Wallet(adminKey);
  console.log("Admin address:", wallet.address);
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));
  console.log("Generated signature:", signature);
  
  // Output JSON for calculate-premium
  console.log("\n--- CALCULATE PREMIUM REQUEST JSON ---");
  console.log(JSON.stringify({
    age,
    gender,
    occupation,
    sumAssured,
    signature,
    premiumInThb: premiumInThb.toFixed(6)
  }, null, 2));
  
  // Output JSON for purchase-policy
  console.log("\n--- PURCHASE POLICY REQUEST JSON ---");
  console.log(JSON.stringify({
    userId: "0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953",
    fullName: "John Doe",
    age,
    gender,
    occupation,
    contactInfo: "johndoe@example.com",
    sumAssured,
    premium: premiumInEth.toFixed(18),
    signature
  }, null, 2));
}

async function getEthToThbRate() {
  try {
    const [ethUsdRes, fxRes] = await Promise.all([
      axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
      axios.get('https://open.er-api.com/v6/latest/USD'),
    ]);
    const ethUsd = parseFloat(ethUsdRes.data.price);
    const usdToThb = fxRes.data.rates.THB;
    const rate = ethUsd * usdToThb;
    console.log(`💰 [Binance+FX] 1 ETH = ${rate.toFixed(2)} THB`);
    return rate;
  } catch (error) {
    console.error('❌ ETH→THB fetch failed', error);
    throw new Error('Failed to fetch ETH to THB conversion rate');
  }
}

generateSignature().catch(console.error);