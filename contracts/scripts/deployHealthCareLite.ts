import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const log = (msg: string) => console.log(msg);

  // --- Setup provider & wallet ---
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  log(`📤 Deploying from: ${wallet.address}`);

  // ensure we have a vault address to pass in
  const vaultAddress = process.env.VAULT_ADDRESS;
  if (!vaultAddress) {
    throw new Error("Please set VAULT_ADDRESS in your .env");
  }
  log(`🔗 Using existing InsuranceVault at: ${vaultAddress}`);

  // helper to load an artifact and return a ContractFactory
  const loadContract = (subdir: string, name: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${subdir}/${name}.sol/${name}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  };

  // === Deploy HealthCareLite ===
  log("==========================================");
  log("Deploying HealthCareLite contract...");
  const HCLFactory = loadContract("plans", "HealthCareLite");
  const hcl = await HCLFactory.deploy(
    wallet.address, // owner
    wallet.address, // trustedSigner (use your wallet as signer)
    vaultAddress // existing vault
  );
  await hcl.waitForDeployment();
  const hclAddress = await hcl.getAddress();
  log(`✅ HealthCareLite deployed at: ${hclAddress}`);
  log("Contract deployed successfully.");
  log("==========================================");

  // === Export ABI & address ===
  const outDirFE = path.resolve(__dirname, "../../apps/frontend/abis");
  const outDirBE = path.resolve(__dirname, "../../apps/backend/abis");
  for (const dir of [outDirFE, outDirBE]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  log("Exporting HealthCareLite ABI to frontend + backend...");
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/plans/HealthCareLite.sol/HealthCareLite.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const payload = JSON.stringify(
    { address: hclAddress, abi: artifact.abi },
    null,
    2
  );
  fs.writeFileSync(path.join(outDirFE, "HealthCareLite.json"), payload);
  fs.writeFileSync(path.join(outDirBE, "HealthCareLite.json"), payload);
  log("📄 ABI exported to frontend: HealthCareLite.json");
  log("📄 ABI exported to backend:  HealthCareLite.json");
  log("==========================================");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
