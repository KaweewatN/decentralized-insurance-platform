import { ethers } from "hardhat";

async function main() {
  // Replace this with the actual deployed contract address
  const contractAddress = "0xdd5c9030612CF05e4a5638068Ba1f69e9D9C1100";

  // Replace this with the address you got from the previous step
  const signerAddress = "0x544a45602D05558DbF3902B0C0E5cC2A6fbA1912";

  const flightInsurance = await ethers.getContractAt("FlightInsurance", contractAddress);

  const tx = await flightInsurance.setTrustedSigner(signerAddress);
  await tx.wait();

  console.log("✅ trustedSigner set to:", signerAddress);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
