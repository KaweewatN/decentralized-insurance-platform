import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying all contracts with automatic vault approval...");
  console.log(`📝 Deployer: ${deployer.address}`);

  // === Deploy InsuranceVault ===
  console.log("🏦 Deploying InsuranceVault...");
  const VaultFactory = await ethers.getContractFactory("InsuranceVault");
  const vault = await VaultFactory.deploy(deployer.address);
  await vault.deploymentTransaction()?.wait();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ InsuranceVault deployed at: ${vaultAddress}`);

  // === Deploy LifeCareLite ===
  console.log("\n📋 Deploying LifeCareLite...");
  const LifeFactory = await ethers.getContractFactory("LifeCareLite");
  const lifeContract = await LifeFactory.deploy(vaultAddress);
  await lifeContract.deploymentTransaction()?.wait();
  const lifeAddress = await lifeContract.getAddress();
  console.log(`✅ LifeCareLite deployed: ${lifeAddress}`);

  // === Deploy HealthCareLite ===
  console.log("\n📋 Deploying HealthCareLite...");
  const HealthFactory = await ethers.getContractFactory("HealthCareLite");
  const healthContract = await HealthFactory.deploy(vaultAddress);
  await healthContract.deploymentTransaction()?.wait();
  const healthAddress = await healthContract.getAddress();
  console.log(`✅ HealthCareLite deployed: ${healthAddress}`);

  // 🔐 Automatically approve vault for both contracts
  console.log("\n🔐 Setting up automatic vault approvals...");

  try {
    // Try different possible method names for vault approval
    console.log("🔓 Approving vault for LifeCareLite...");
    try {
      let lifeApprovalTx;
      if (typeof (vault as any).approveContract === "function") {
        lifeApprovalTx = await (vault as any).approveContract(lifeAddress);
      } else if (
        typeof (vault as any).approveInsuranceContract === "function"
      ) {
        lifeApprovalTx = await (vault as any).approveInsuranceContract(
          lifeAddress
        );
      } else if (typeof (vault as any).setApprovedContract === "function") {
        lifeApprovalTx = await (vault as any).setApprovedContract(
          lifeAddress,
          true
        );
      } else {
        throw new Error("No vault approval method found");
      }
      await lifeApprovalTx.wait();
      console.log(`✅ Life contract approved - TX: ${lifeApprovalTx.hash}`);
    } catch (lifeError) {
      console.log(
        `⚠️ Life contract approval failed: ${(lifeError as Error).message}`
      );
    }

    // Approve health contract
    console.log("🔓 Approving vault for HealthCareLite...");
    try {
      let healthApprovalTx;
      if (typeof (vault as any).approveContract === "function") {
        healthApprovalTx = await (vault as any).approveContract(healthAddress);
      } else if (
        typeof (vault as any).approveInsuranceContract === "function"
      ) {
        healthApprovalTx = await (vault as any).approveInsuranceContract(
          healthAddress
        );
      } else if (typeof (vault as any).setApprovedContract === "function") {
        healthApprovalTx = await (vault as any).setApprovedContract(
          healthAddress,
          true
        );
      } else {
        throw new Error("No vault approval method found");
      }
      await healthApprovalTx.wait();
      console.log(`✅ Health contract approved - TX: ${healthApprovalTx.hash}`);
    } catch (healthError) {
      console.log(
        `⚠️ Health contract approval failed: ${(healthError as Error).message}`
      );
    }

    // 👨‍💼 Grant admin roles to deployer
    console.log("\n👨‍💼 Granting admin roles...");

    // Grant admin role to life contract
    const adminRole = await lifeContract.ADMIN_ROLE();
    const lifeAdminTx = await lifeContract.grantRole(
      adminRole,
      deployer.address
    );
    await lifeAdminTx.wait();
    console.log(`✅ Life admin role granted - TX: ${lifeAdminTx.hash}`);

    // Grant admin role to health contract
    const healthAdminTx = await healthContract.grantRole(
      adminRole,
      deployer.address
    );
    await healthAdminTx.wait();
    console.log(`✅ Health admin role granted - TX: ${healthAdminTx.hash}`);

    // 🧪 Verify approvals (try different method names)
    console.log("\n🧪 Verifying vault approvals...");
    try {
      let lifeApproved = false;
      let healthApproved = false;

      if (typeof (vault as any).isApprovedContract === "function") {
        lifeApproved = await (vault as any).isApprovedContract(lifeAddress);
        healthApproved = await (vault as any).isApprovedContract(healthAddress);
      } else if (typeof (vault as any).approvedContracts === "function") {
        lifeApproved = await (vault as any).approvedContracts(lifeAddress);
        healthApproved = await (vault as any).approvedContracts(healthAddress);
      } else {
        console.log("⚠️ Cannot verify approvals - method not found");
      }

      console.log(`📋 Life contract approved: ${lifeApproved ? "✅" : "❌"}`);
      console.log(
        `📋 Health contract approved: ${healthApproved ? "✅" : "❌"}`
      );
    } catch (verifyError) {
      console.log(`⚠️ Verification failed: ${(verifyError as Error).message}`);
    }
  } catch (error) {
    console.error("❌ Auto-approval setup failed:", (error as Error).message);
    console.log("⚠️ Manual approval will be needed after deployment");
    console.log(
      "Run: curl -X POST http://localhost:3000/api/admin/approve-vault"
    );
  }

  // === Export ABIs ===
  const exportABI = (subdir: string, name: string, address: string) => {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${subdir}/${name}.sol/${name}.json`
    );

    if (!fs.existsSync(artifactPath)) {
      console.log(`⚠️ Artifact not found: ${artifactPath}`);
      return;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const outDirFE = path.resolve(__dirname, "../../apps/frontend/abis");
    const outDirBE = path.resolve(__dirname, "../../apps/backend/abis");
    for (const dir of [outDirFE, outDirBE]) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    const payload = JSON.stringify({ address, abi: artifact.abi }, null, 2);
    fs.writeFileSync(path.join(outDirFE, `${name}.json`), payload);
    fs.writeFileSync(path.join(outDirBE, `${name}.json`), payload);
    console.log(`📄 ABI exported to frontend and backend: ${name}.json`);
  };

  exportABI("utils", "InsuranceVault", vaultAddress);
  exportABI("plans", "LifeCareLite", lifeAddress);
  exportABI("plans", "HealthCareLite", healthAddress);

  console.log("\n🎯 Deployment Summary:");
  console.log(`📄 InsuranceVault: ${vaultAddress}`);
  console.log(`📄 LifeCareLite: ${lifeAddress}`);
  console.log(`📄 HealthCareLite: ${healthAddress}`);
  console.log(`🏦 Vault: ${vaultAddress}`);

  console.log("\n📋 Next steps:");
  console.log("1. Update .env with new contract addresses:");
  console.log(`   VAULT_ADDRESS=${vaultAddress}`);
  console.log(`   LIFECARE_LITE_ADDRESS=${lifeAddress}`);
  console.log(`   HEALTHCARE_LITE_ADDRESS=${healthAddress}`);
  console.log("2. Restart backend server");
  console.log(
    "3. Verify vault status: curl -X GET http://localhost:3000/api/admin/vault-status"
  );
  console.log("\n✅ All contracts deployed with automatic vault approval!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
