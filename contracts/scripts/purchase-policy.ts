import { ethers } from "ethers";
import * as dotenv from "dotenv";
import RainfallABI from "../artifacts/contracts/RainfallInsurance.sol/RainfallInsurance.json";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const contract = new ethers.Contract(
    process.env.RAINFALL_CONTRACT_ADDRESS!,
    RainfallABI.abi,
    wallet
  );

  const policyId = 2;
  const userAddress = wallet.address;
  const coverageAmount = ethers.parseEther("0.02");
  const premium = ethers.parseEther("0.0161");
  const threshold = 300;
  const startDate = "2025-03-01";
  const endDate = "2025-05-25";
  const conditionType = 0;
  const latitude = 187600;
  const longitude = 989800;
  const signature =
    "0x03b7c2424315e31f464582261b90aafdcd44d163939c7190c55e6b925fe348c523a61674e1abd8b2bb1f6d388e182cb653ac9f5527f41fc9c1be7db8fc0214411c"; // from GET /sign-policy/1

  try {
    const tx = await contract.purchasePolicy(
      policyId,
      coverageAmount,
      premium,
      threshold,
      startDate,
      endDate,
      conditionType,
      latitude,
      longitude,
      signature,
      { value: premium }
    );

    console.log("⏳ Sending transaction...");
    console.log("📤 TX hash:", tx.hash);
    await tx.wait();
    console.log("✅ Policy successfully stored on-chain!");
  } catch (err) {
    console.error("❌ Failed to store policy:", err);
  }
}

main();
