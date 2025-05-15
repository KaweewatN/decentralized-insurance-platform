import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const log = (msg: string) => console.log(msg);

  // ─── Setup ────────────────────────────────────────────────
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  log(`📤 Deploying from: ${wallet.address}`);

  // ─── Vault ────────────────────────────────────────────────
  const vaultAddress = process.env.VAULT_ADDRESS;
  if (!vaultAddress) throw new Error("VAULT_ADDRESS missing in .env");
  log(`🔗 Using existing InsuranceVault at: ${vaultAddress}`);

  // ─── Load artifact helper ─────────────────────────────────
  function loadFactory(subdir: string, name: string) {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${subdir}/${name}.sol/${name}.json`
    );
    const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return new ethers.ContractFactory(abi, bytecode, wallet);
  }

  // ─── Deploy LifeCareLite ──────────────────────────────────
  log("==========================================");
  log("Deploying LifeCareLite contract...");
  const LCL = loadFactory("plans", "LifeCareLite");
  const lifeCare = await LCL.deploy(
    wallet.address, // trustedSigner
    vaultAddress // existing InsuranceVault
  );
  await lifeCare.waitForDeployment();
  const lifeCareAddr = await lifeCare.getAddress();
  log(`✅ LifeCareLite deployed at: ${lifeCareAddr}`);
  log("Contract deployed successfully.");
  log("==========================================");

  // ─── Export ABI & Address ────────────────────────────────
  const outFE = path.resolve(__dirname, "../../apps/frontend/abis");
  const outBE = path.resolve(__dirname, "../../apps/backend/abis");
  for (const dir of [outFE, outBE]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  log("Exporting LifeCareLite ABI to frontend + backend...");
  const artPath = path.resolve(
    __dirname,
    "../artifacts/contracts/plans/LifeCareLite.sol/LifeCareLite.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artPath, "utf8"));
  const data = JSON.stringify(
    { address: lifeCareAddr, abi: artifact.abi },
    null,
    2
  );

  fs.writeFileSync(path.join(outFE, "LifeCareLite.json"), data);
  fs.writeFileSync(path.join(outBE, "LifeCareLite.json"), data);

  log("📄 ABI exported to frontend: LifeCareLite.json");
  log("📄 ABI exported to backend:  LifeCareLite.json");
  log("==========================================");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
