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

  const ORACLE_ROLE = ethers.id("ORACLE_ROLE"); // Correct way to compute the role hash
  const myAddress = await wallet.getAddress();

  console.log("🆔 Granting ORACLE_ROLE to", myAddress);

  const tx = await contract.grantRole(ORACLE_ROLE, myAddress);
  await tx.wait();

  console.log("✅ ORACLE_ROLE granted!");
}

main().catch((err) => {
  console.error("❌ Failed to grant role:", err);
});

