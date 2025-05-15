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

  // Ensure we have a vault address to pass in
  const vaultAddress = process.env.VAULT_ADDRESS;
  if (!vaultAddress) {
    throw new Error("Please set VAULT_ADDRESS in your .env");
  }
  log(`🔗 Using existing InsuranceVault at: ${vaultAddress}`);

  // Helper to load an artifact and return a ContractFactory
  const loadContract = (subdir: string, name: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${subdir}/${name}.sol/${name}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  };

  // === Deploy LifeCareLite ===
  log("Deploying LifeCareLite...");
  const lifeFactory = loadContract("plans", "LifeCareLite");
  const life = await lifeFactory.deploy(wallet.address, vaultAddress);
  await life.waitForDeployment();
  const lifeAddress = await life.getAddress();
  log(`✅ LifeCareLite deployed at: ${lifeAddress}`);

  // === Deploy HealthCareLite ===
  log("Deploying HealthCareLite...");
  const healthFactory = loadContract("plans", "HealthCareLite");
  const health = await healthFactory.deploy(wallet.address, vaultAddress);
  await health.waitForDeployment();
  const healthAddress = await health.getAddress();
  log(`✅ HealthCareLite deployed at: ${healthAddress}`);

  // === Export ABIs ===
  const exportABI = (subdir: string, name: string, address: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${subdir}/${name}.sol/${name}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const outDirFE = path.resolve(__dirname, "../../apps/frontend/abis");
    const outDirBE = path.resolve(__dirname, "../../apps/backend/abis");
    for (const dir of [outDirFE, outDirBE]) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    const payload = JSON.stringify({ address, abi: artifact.abi }, null, 2);
    fs.writeFileSync(path.join(outDirFE, `${name}.json`), payload);
    fs.writeFileSync(path.join(outDirBE, `${name}.json`), payload);
    log(`📄 ABI exported to frontend and backend: ${name}.json`);
  };

  exportABI("plans", "LifeCareLite", lifeAddress);
  exportABI("plans", "HealthCareLite", healthAddress);

  log("✅ All contracts deployed and ABIs exported.");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
