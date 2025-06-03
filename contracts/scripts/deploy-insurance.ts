import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const backendSigner = "0x544a45602D05558DbF3902B0C0E5cC2A6fbA1912"; // Replace this with your real backend signer address

  const Insurance = await ethers.getContractFactory("RainfallInsurance");
  const contract = await Insurance.deploy(backendSigner);

  await contract.waitForDeployment();
  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
