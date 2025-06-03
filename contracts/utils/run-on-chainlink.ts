import { ethers } from "ethers";
import RainfallABI from "../artifacts/contracts/RainfallInsurance.sol/RainfallInsurance.json";
import * as dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import vm from "vm";

dotenv.config();

async function main() {
  // Step 1: Setup provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // Step 2: Load contract
  const contract = new ethers.Contract(
    process.env.RAINFALL_CONTRACT_ADDRESS!,
    RainfallABI.abi,
    wallet
  );

  // Step 3: Get policy from contract
  const policyId = 3; // Updated policy ID
  const policy = await contract.getPolicy(policyId);
  console.log("📝 Raw policy from contract:", policy);

  const lat = policy.latitude.toString();
  const lon = policy.longitude.toString();
  const startDate = policy.startDate;
  const endDate = policy.endDate;
  const threshold = policy.threshold.toString();
  const condition = policy.conditionType.toString() === "0" ? "below" : "above";

  const args = [lat, lon, startDate, endDate, threshold, condition];
  console.log("📦 Chainlink args:", args);

  // Optional: View contract balance and policy count
  const balance = await provider.getBalance(
    process.env.RAINFALL_CONTRACT_ADDRESS!
  );
  console.log("💰 Contract balance:", ethers.formatEther(balance));

  const total = await contract.policyCounter?.();
  console.log("📊 Total policies on chain:", total);

  // Step 4: Read rainfall-check.js source
  const sourceCode = fs.readFileSync("scripts/rainfall-check.js", "utf8");

  // Step 5: Run JS code with VM for simulation
  const context = {
    args,
    axios,
    console,
    BigInt,
    Buffer,
    fetch,
    Function,
    Uint8Array,
    parseFloat,
    Math,
    Number,
    require,
    Date,
    module,
    setTimeout,
  };

  const script = new vm.Script(`${sourceCode}\n;run()`);
  const sandbox = vm.createContext(context);

  let result;
  try {
    result = await script.runInContext(sandbox);
  } catch (err) {
    console.error("❌ Error during simulation:", err);
    process.exit(1);
  }

  // Step 6: Encode result as bytes
  const encodedResult = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bool"],
    [result]
  );
  const fakeRequestId = ethers.keccak256(
    ethers.toUtf8Bytes("mock-request-" + Date.now())
  );

  console.log("📡 Simulated Result:", result);
  console.log("🧪 Encoded Bytes:", encodedResult);

  // Step 7: Fulfill the contract manually
  try {
    const tx = await contract.handleOracleFulfillment(
      fakeRequestId,
      encodedResult,
      "0x"
    );
    await tx.wait();
    console.log("✅ Contract fulfilled with result:", result);
  } catch (err) {
    console.error("❌ Error running Chainlink logic:", err);
  }
}

main();
