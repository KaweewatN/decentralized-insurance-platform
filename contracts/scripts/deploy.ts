import { ethers } from "hardhat";

async function main() {
  const FlightInsurance = await ethers.getContractFactory("FlightInsurance");
  const contract = await FlightInsurance.deploy();

  await contract.waitForDeployment();
  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});




