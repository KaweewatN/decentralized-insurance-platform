// scripts/createPolicy.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config();

async function main() {
  const signer = new ethers.Wallet(process.env.BACKEND_SIGNER_PRIVATE_KEY!);
  const contractAddress = process.env.FLIGHT_CONTRACT_ADDRESS!;
  const flightInsurance = await ethers.getContractAt("FlightInsurance", contractAddress);

  const flightNumber = "TH102";
  const flightTime = Math.floor(Date.now() / 1000) + 3600 * 24; // Tomorrow
  const coverage = ethers.parseEther("0.1"); // 0.1 ETH per person
  const numPersons = 1;
  const premium = ethers.parseEther("0.01"); // 0.01 ETH premium

  // Step 1: Create message hash
  const messageHash = ethers.keccak256(
    ethers.solidityPacked(
      ["string", "uint256", "uint256", "uint256"],
      [flightNumber, coverage, numPersons, premium]
    )
  );

  // Step 2: Sign
  const signature = await signer.signMessage(ethers.getBytes(messageHash));

  // Step 3: Call createPolicy
  const [user] = await ethers.getSigners();
  const tx = await flightInsurance.connect(user).createPolicy(
    flightNumber,
    flightTime,
    coverage,
    numPersons,
    premium,
    signature,
    { value: premium }
  );

  await tx.wait();
  console.log("✅ Policy created");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
