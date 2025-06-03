import { ethers } from "ethers";
import * as dotenv from "dotenv";
import RainfallABI from "../artifacts/contracts/RainfallInsurance.sol/RainfallInsurance.json";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!);

  const contract = new ethers.Contract(
    process.env.RAINFALL_CONTRACT_ADDRESS!,
    RainfallABI.abi,
    provider
  );

  const policyId = 2; // ← Change this to check any policy

  // 🔍 Get contract balance
  const balance = await provider.getBalance(
    process.env.RAINFALL_CONTRACT_ADDRESS!
  );
  console.log("💰 Contract Balance:", ethers.formatEther(balance), "ETH");

  // 🔍 Get policy details
  const policy = await contract.getPolicy(policyId);
  const statusMap = ["Pending", "Active", "Claimed", "Rejected"];
  const statusText = statusMap[Number(policy.status)] || "Unknown";

  console.log(`📦 Policy ${policyId} Info:`);
  console.log("   👤 User:", policy.user);
  console.log(
    "   💸 Coverage Amount:",
    ethers.formatEther(policy.coverageAmount),
    "ETH"
  );
  console.log("   📅 End Date:", policy.endDate);
  console.log("   🏷️ Status:", statusText, `(${Number(policy.status)})`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
