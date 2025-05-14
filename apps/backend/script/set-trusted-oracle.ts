import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as contractJson from '../../../contracts/artifacts/contracts/FlightDelayInsurance.sol/FlightInsurance.json';


dotenv.config();

async function setTrustedOracle() {
    const rpcUrl = process.env.SEPOLIA_RPC!;
    const contractAddress = process.env.FLIGHT_CONTRACT_ADDRESS!;
    const deployerKey = process.env.DEPLOYER_PRIVATE_KEY!;
    const oracleKey = process.env.ORACLE_WALLET_PRIVATE_KEY!;

    // ✅ Setup provider and signer (deployer)
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const deployerWallet = new ethers.Wallet(deployerKey, provider);

    // ✅ Get oracle address from the private key
    const oracleWallet = new ethers.Wallet(oracleKey);
    const oracleAddress = oracleWallet.address;

    // ✅ Load the contract
    const contract = new ethers.Contract(contractAddress, contractJson.abi, deployerWallet);

    console.log(`📌 Setting trusted oracle to: ${oracleAddress}...`);

    // ✅ Call the contract to set trusted oracle
    const tx = await contract.setTrustedOracle(oracleAddress);
    await tx.wait();

    console.log('✅ Trusted oracle set successfully!');
}

setTrustedOracle().catch((err) => {
    console.error('❌ Error:', err.message || err);
});
