import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const log = (msg: string) => console.log(msg);

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  log(`📤 Deploying from: ${wallet.address}`);

  const loadContract = (name: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${name}.sol/${name}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  };

  // === Deploy Oracle ===
  const oracleFactory = loadContract("PriceOracle");
  const oracle = await oracleFactory.deploy(wallet.address, wallet.address); // owner และ updater เป็น address เดียวกัน
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  log(`✅ PriceOracle deployed at: ${oracleAddress}`);

  // === Deploy Vault ===
  const vaultFactory = loadContract("InsuranceVault");
  const vault = await vaultFactory.deploy(wallet.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  log(`✅ InsuranceVault deployed at: ${vaultAddress}`);

  // === Deploy Insurance Plans ===
  const deployPlan = async (name: string) => {
    const factory = loadContract(name);
    const contract = await factory.deploy(
      wallet.address,
      oracleAddress,
      vaultAddress
    );
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    log(`✅ ${name} deployed at: ${address}`);
    return address;
  };

  const lifePlusAddr = await deployPlan("LifeCarePlus");
  const lifeLiteAddr = await deployPlan("LifeCareLite");
  const healthPlusAddr = await deployPlan("HealthCarePlus");
  const healthLiteAddr = await deployPlan("HealthCareLite");

  // === Deploy Central Manager ===
  const managerFactory = loadContract("LifeHealthInsuranceManager");
  const manager = await managerFactory.deploy(
    wallet.address,
    lifePlusAddr,
    lifeLiteAddr,
    healthPlusAddr,
    healthLiteAddr,
    vaultAddress
  );
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  log(`✅ LifeHealthInsuranceManager deployed at: ${managerAddress}`);

  // === Export to frontend + backend
  const frontendPath = path.resolve(__dirname, "../../apps/frontend/abis");
  const backendPath = path.resolve(__dirname, "../../apps/backend/abis");
  for (const dir of [frontendPath, backendPath]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const exportABI = (name: string, address: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${name}.sol/${name}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const exportPaths = {
      frontend: path.join(frontendPath, `${name}.json`),
      backend: path.join(backendPath, `${name}.json`),
    };

    for (const [label, outputPath] of Object.entries(exportPaths)) {
      fs.writeFileSync(
        outputPath,
        JSON.stringify({ address, abi: artifact.abi }, null, 2)
      );
      log(`📄 Exported to ${label}: ${name}.json`);
    }
  };

  exportABI("PriceOracle", oracleAddress);
  exportABI("InsuranceVault", vaultAddress);
  exportABI("LifeCarePlus", lifePlusAddr);
  exportABI("LifeCareLite", lifeLiteAddr);
  exportABI("HealthCarePlus", healthPlusAddr);
  exportABI("HealthCareLite", healthLiteAddr);
  exportABI("LifeHealthInsuranceManager", managerAddress);

  log("✅ All contracts deployed & exported to frontend/backend abis/");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
