import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const log = (message: string) => console.log(message);

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  log(`📤 Deploying from: ${wallet.address}`);

  // === Load compiled ABI + bytecode ===
  const loadContract = (name: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${name}.sol/${name}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  };

  // === Deploy contracts ===
  const oracleFactory = loadContract("PriceOracle");
  const oracle = await oracleFactory.deploy(wallet.address);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  log(`✅ PriceOracle deployed to: ${oracleAddress}`);

  const lifeguardFactory = loadContract("LifeGuard99");
  const lifeguard = await lifeguardFactory.deploy(
    wallet.address,
    oracleAddress
  );
  await lifeguard.waitForDeployment();
  const lifeguardAddress = await lifeguard.getAddress();
  log(`✅ LifeGuard99 deployed to: ${lifeguardAddress}`);

  const smartReturnFactory = loadContract("SmartReturn806");
  const smartreturn = await smartReturnFactory.deploy(
    wallet.address,
    oracleAddress
  );
  await smartreturn.waitForDeployment();
  const smartreturnAddress = await smartreturn.getAddress();
  log(`✅ SmartReturn806 deployed to: ${smartreturnAddress}`);

  const insuranceManagerFactory = loadContract("InsuranceManager");
  const manager = await insuranceManagerFactory.deploy(
    wallet.address,
    lifeguardAddress,
    smartreturnAddress
  );
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  log(`✅ InsuranceManager deployed to: ${managerAddress}`);

  // === Export ABI + address ===
  const frontendPath = path.resolve(__dirname, "../../apps/frontend/abis");
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath, { recursive: true });
  }

  const backendPath = path.resolve(__dirname, "../../apps/backend/abis");
  if (!fs.existsSync(backendPath)) {
    fs.mkdirSync(backendPath, { recursive: true });
  }

  const exportABI = (name: string, address: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../../artifacts/contracts/${name}.sol/${name}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Export to frontend
    const frontendOutPath = path.join(frontendPath, `${name}.json`);
    fs.writeFileSync(
      frontendOutPath,
      JSON.stringify({ address, abi: artifact.abi }, null, 2)
    );
    log(`📄 Exported to frontend: ${name}.json`);

    // Export to backend
    const backendOutPath = path.join(backendPath, `${name}.json`);
    fs.writeFileSync(
      backendOutPath,
      JSON.stringify({ address, abi: artifact.abi }, null, 2)
    );
    log(`📄 Exported to backend: ${name}.json`);
  };

  exportABI("PriceOracle", oracleAddress);
  exportABI("LifeGuard99", lifeguardAddress);
  exportABI("SmartReturn806", smartreturnAddress);
  exportABI("InsuranceManager", managerAddress);

  log("✅ ABI & address exported to frontend/abis/ and backend/abis/");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
