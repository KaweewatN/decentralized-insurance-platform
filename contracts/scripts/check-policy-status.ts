// scripts/check-policy-status.ts
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

  const policyId = 0; // Change this if you want to check another policy
  const policy = await contract.getPolicy(policyId);

  const statusMap = ["Pending", "Active", "Claimed", "Rejected"];
  const statusValue = Number(policy.status);
  const statusText = statusMap[statusValue] || "Unknown";

  console.log(`📄 Policy ${policyId} Status: ${statusText} (${statusValue})`);
}

main().catch((err) => {
  console.error("❌ Error checking policy status:", err);
});
