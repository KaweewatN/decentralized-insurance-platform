import { Wallet, Contract, JsonRpcProvider } from 'ethers';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// ✅ Load ABI JSON
const contractJson = require('../abis/FlightInsurance.json');

// ✅ Setup
const backendURL = 'http://localhost:3001';
const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
const userWallet = new Wallet(process.env.ORACLE_WALLET_PRIVATE_KEY!, provider);
const contract = new Contract(
  process.env.FLIGHT_CONTRACT_ADDRESS!,
  contractJson.abi,
  userWallet,
);

async function runTest() {
  try {
    // 1️⃣ Prepare flight data
    const flightNumber = 'TG635';
    const bufferMinutes = 30;
    const flightTime = Math.floor(Date.now() / 1000) + bufferMinutes * 60;
    const coveragePerPerson = 100;
    const numPersons = 2;
    const userAddress = await userWallet.getAddress();

    // 2️⃣ Estimate premium from backend
    const estimateRes = await axios.get(
      `${backendURL}/flight-insurance/estimate-premium`,
      {
        params: {
          airline: 'TG',
          depAirport: 'BKK',
          arrAirport: 'NRT',
          depTime: '10:00',
          flightDate: '2024-12-25',
          depCountry: 'TH',
          arrCountry: 'JP',
          coverageAmount: coveragePerPerson,
          numPersons: numPersons,
        },
      },
    );
    const totalPremium = estimateRes.data.totalPremium;
    const scaledPremium = Math.round(totalPremium);

    // 3️⃣ Submit application to backend
    const submitRes = await axios.post(
      `${backendURL}/flight-insurance/submit-application`,
      {
        user_address: userAddress,
        airline: 'Thai Airways',
        flightNumber,
        depAirport: 'BKK',
        arrAirport: 'NRT',
        depTime: '10:00',
        flightDate: '2024-12-25',
        depCountry: 'TH',
        arrCountry: 'JP',
        coverageAmount: coveragePerPerson,
        numPersons,
      },
    );
    const appId = submitRes.data.applicationId;
    console.log('✅ Application submitted with ID:', appId);

    // 4️⃣ Approve the application
    await axios.post(
      `${backendURL}/flight-insurance/approve-application?id=${appId}`,
    );
    console.log('✅ Application approved');

    // 5️⃣ Generate signature from backend
    const sigRes = await axios.post(
      `${backendURL}/flight-insurance/generate-signature`,
      {
        flightNumber,
        coveragePerPerson,
        numPersons,
        totalPremium: scaledPremium, // send integer
      },
    );
    const signature = sigRes.data.signature;
    console.log('✅ Got signature:', signature);

    // 6️⃣ Create policy on-chain
    const tx = await contract.createPolicy(
      flightNumber,
      flightTime,
      coveragePerPerson,
      numPersons,
      scaledPremium,
      signature,
      { value: scaledPremium },
    );
    await tx.wait();
    console.log('✅ Policy created on-chain, Tx hash:', tx.hash);

    // 7️⃣ Get policy ID
    const policyId = (await contract.policyCounter()) - 1n;
    console.log('💡 Created policy ID:', policyId.toString());
  } catch (err: any) {
    console.error('❌ Test failed:', err.response?.data || err.message || err);
  }
}

runTest();
