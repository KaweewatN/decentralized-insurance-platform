import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const oracleAddress = process.env.ORACLE_CONTRACT_ADDRESS!;
  const updaterAddress = process.env.PRIVATE_KEY
    ? new ethers.Wallet(process.env.PRIVATE_KEY).address
    : "";

  const [owner] = await ethers.getSigners();
  const oracle = await ethers.getContractAt(
    "PriceOracle",
    oracleAddress,
    owner
  );

  console.log(`🎯 Setting updater = ${updaterAddress}`);
  const tx = await oracle.setUpdater(updaterAddress);
  await tx.wait();
  console.log("✅ Updater set successfully.");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
