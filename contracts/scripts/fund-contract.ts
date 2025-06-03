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

  const amount = ethers.parseEther("0.025"); // fund with 0.025 ETH

  const tx = await contract.fundContract({ value: amount });
  console.log("⏳ Funding transaction sent:", tx.hash);
  await tx.wait();
  console.log("✅ Contract successfully funded with 0.025 ETH.");
}

main().catch((err) => {
  console.error("❌ Funding failed:", err);
});
