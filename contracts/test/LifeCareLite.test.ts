import { expect } from "chai";
import { ethers } from "hardhat";
import { LifeCareLite } from "../typechain-types/contracts/plans/LifeCareLite";
import { InsuranceVault } from "../typechain-types/contracts/utils/InsuranceVault";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LifeCareLite", function () {
  // Contract instances
  let lifeCareLite: LifeCareLite;
  let vault: InsuranceVault;

  // Signers
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let trustedSigner: HardhatEthersSigner;

  // Addresses
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;
  let adminAddress: string;
  let trustedSignerAddress: string;

  // Test values
  let premium: bigint;
  let sumAssured: bigint;
  const duration = 365 * 24 * 60 * 60; // 1 year in seconds

  /**
   * Helper function to generate a purchase signature
   * This matches the format in PolicyBase.purchasePolicy
   */
  async function generatePurchaseSignature(
    owner: string,
    premium: bigint,
    sumAssured: bigint,
    duration: number
  ): Promise<string> {
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    // This must match the format in PolicyBase.purchasePolicy:
    // messageHash = keccak256(abi.encodePacked(insured, premium, sumAssured, duration, block.chainid))
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ["address", "uint256", "uint256", "uint256", "uint256"],
        [owner, premium, sumAssured, duration, chainId]
      )
    );

    console.log("Generating purchase signature for messageHash:", messageHash);
    console.log("Purchase signature parameters:", {
      owner,
      premium: premium.toString(),
      sumAssured: sumAssured.toString(),
      duration,
      chainId: chainId.toString(),
    });

    const signature = await trustedSigner.signMessage(
      ethers.getBytes(messageHash)
    );
    console.log("Generated purchase signature:", signature);
    return signature;
  }

  /**
   * Helper function to generate a claim signature
   * This matches the format in PolicyBase.fileClaim
   */
  async function generateClaimSignature(
    policyId: string,
    amount: bigint,
    documentHash: string
  ): Promise<string> {
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    // This must match the format in PolicyBase.fileClaim:
    // messageHash = keccak256(abi.encodePacked(policyId, amount, docHash, chainId))
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ["bytes32", "uint256", "string", "uint256"],
        [policyId, amount, documentHash, chainId]
      )
    );

    console.log("Generating claim signature for messageHash:", messageHash);
    console.log("Claim signature parameters:", {
      policyId,
      amount: amount.toString(),
      documentHash,
      chainId: chainId.toString(),
    });

    const signature = await trustedSigner.signMessage(
      ethers.getBytes(messageHash)
    );
    console.log("Generated claim signature:", signature);
    return signature;
  }

  /**
   * Helper function to generate a cancellation signature
   */
  async function generateCancelSignature(
    policyId: string,
    owner: string,
    refundAmount: bigint
  ): Promise<string> {
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ["bytes32", "address", "uint256", "uint256", "uint256"],
        [policyId, owner, refundAmount, 0, chainId]
      )
    );

    console.log("Generating cancel signature for messageHash:", messageHash);
    console.log("Cancel signature parameters:", {
      policyId,
      owner,
      refundAmount: refundAmount.toString(),
      chainId: chainId.toString(),
    });

    const signature = await trustedSigner.signMessage(
      ethers.getBytes(messageHash)
    );
    console.log("Generated cancel signature:", signature);
    return signature;
  }

  /**
   * Helper function to extract policy ID from event logs
   */
  async function getPolicyIdFromLogs(receipt: any): Promise<string | null> {
    if (!receipt || !receipt.logs) {
      console.log("No logs in receipt");
      return null;
    }

    console.log(
      `Examining ${receipt.logs.length} logs for PolicyPurchased event`
    );

    // Find PolicyPurchased event
    for (const log of receipt.logs) {
      // Check if first topic matches PolicyPurchased event signature
      if (
        log.topics[0] ===
        ethers.id("PolicyPurchased(bytes32,address,uint256,uint256,uint256)")
      ) {
        // Policy ID is in the first indexed parameter (second topic)
        console.log("Found PolicyPurchased event, policy ID:", log.topics[1]);
        return log.topics[1];
      }
    }

    console.log("PolicyPurchased event not found in logs");
    return null;
  }

  before(async function () {
    console.log("============================================");
    console.log("Setting up test environment...");
    console.log("============================================");

    // Get signers
    const signers = await ethers.getSigners();
    owner = signers[0];
    user1 = signers[1];
    user2 = signers[2];
    admin = signers[3];
    trustedSigner = signers[4];

    // Get addresses
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
    adminAddress = await admin.getAddress();
    trustedSignerAddress = await trustedSigner.getAddress();

    console.log("Addresses:");
    console.log("- Owner:", ownerAddress);
    console.log("- User1:", user1Address);
    console.log("- User2:", user2Address);
    console.log("- Admin:", adminAddress);
    console.log("- TrustedSigner:", trustedSignerAddress);

    // Set test values
    premium = ethers.parseEther("0.1");
    sumAssured = ethers.parseEther("10");
    console.log("Test values:");
    console.log("- Premium:", ethers.formatEther(premium), "ETH");
    console.log("- Sum Assured:", ethers.formatEther(sumAssured), "ETH");
    console.log(
      "- Duration:",
      duration,
      "seconds (",
      duration / (24 * 60 * 60),
      "days)"
    );

    // Deploy InsuranceVault with proper type
    const VaultFactory = await ethers.getContractFactory("InsuranceVault");
    vault = (await VaultFactory.deploy(ownerAddress)) as InsuranceVault;
    console.log("InsuranceVault deployed to:", await vault.getAddress());

    // Deploy LifeCareLite with proper type
    const LifeCareLiteFactory = await ethers.getContractFactory("LifeCareLite");
    lifeCareLite = (await LifeCareLiteFactory.deploy(
      trustedSignerAddress,
      await vault.getAddress()
    )) as LifeCareLite;
    console.log("LifeCareLite deployed to:", await lifeCareLite.getAddress());

    // Grant admin role
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    await lifeCareLite.grantRole(ADMIN_ROLE, adminAddress);
    console.log("Granted ADMIN_ROLE to:", adminAddress);

    // Set vault owner to LifeCareLite
    await vault.transferOwnership(await lifeCareLite.getAddress());
    console.log("Vault owner set to LifeCareLite");

    // Print function signatures from contract ABI
    console.log("\nFunction signatures in contract:");
    const contractFunctions = LifeCareLiteFactory.interface.fragments
      .filter((frag) => frag.type === "function")
      .map((frag) => frag.format());

    console.log(contractFunctions.join("\n"));
  });

  describe("Contract Setup", function () {
    it("Should have the correct trusted signer", async function () {
      console.log("\n[TEST] Verifying trusted signer address");
      const contractTrustedSigner = await lifeCareLite.trustedSigner();
      console.log("Contract trusted signer:", contractTrustedSigner);
      console.log("Expected trusted signer:", trustedSignerAddress);
      expect(contractTrustedSigner).to.equal(trustedSignerAddress);
      console.log("✓ Trusted signer verification successful");
    });

    it("Should have the correct vault address", async function () {
      console.log("\n[TEST] Verifying vault address");
      const contractVault = await lifeCareLite.vault();
      const vaultAddress = await vault.getAddress();
      console.log("Contract vault:", contractVault);
      console.log("Expected vault:", vaultAddress);
      expect(contractVault).to.equal(vaultAddress);
      console.log("✓ Vault address verification successful");
    });
  });

  describe("Policy Operations", function () {
    let policyId: string;

    it("Should purchase a policy", async function () {
      console.log("\n[TEST] Purchasing a policy");

      // Generate signature for policy purchase
      console.log("Generating signature for policy purchase");
      const signature = await generatePurchaseSignature(
        user1Address,
        premium,
        sumAssured,
        duration
      );

      console.log("Policy purchase signature generated");
      console.log("Calling purchasePolicy with parameters:");
      console.log("- User:", user1Address);
      console.log("- Premium:", ethers.formatEther(premium), "ETH");
      console.log("- Sum Assured:", ethers.formatEther(sumAssured), "ETH");
      console.log("- Duration:", duration);

      try {
        // Purchase policy
        console.log("Executing purchasePolicy transaction...");
        const tx = await lifeCareLite.connect(user1).purchasePolicy(
          user1Address, // owner
          premium, // premium
          sumAssured, // sumAssured
          BigInt(duration), // duration
          signature, // signature
          { value: premium }
        );

        console.log("Transaction hash:", tx.hash);
        console.log("Waiting for transaction confirmation...");

        const receipt = await tx.wait();
        console.log("Transaction confirmed, status:", receipt?.status);
        expect(receipt?.status).to.equal(1, "Transaction failed");

        // Extract policy ID from event logs
        console.log("Extracting policy ID from event logs...");
        const policyIdFromLogs = await getPolicyIdFromLogs(receipt);
        expect(policyIdFromLogs).to.not.be.null;

        if (policyIdFromLogs) {
          policyId = policyIdFromLogs;
          console.log("Policy purchased with ID:", policyId);

          // Verify policy details
          console.log("Fetching policy details for verification...");
          const policy = await lifeCareLite.getPolicy(policyId);
          console.log("Policy details:");
          console.log("- Owner:", policy.owner);
          console.log("- Premium:", ethers.formatEther(policy.premium), "ETH");
          console.log(
            "- Sum Assured:",
            ethers.formatEther(policy.sumAssured),
            "ETH"
          );

          console.log("- Is Active:", policy.isActive);

          expect(policy.owner).to.equal(user1Address);
          expect(policy.premium).to.equal(premium);
          expect(policy.sumAssured).to.equal(sumAssured);
          expect(policy.isActive).to.be.true;

          console.log("✓ Policy details verification successful");
        } else {
          throw new Error("Failed to retrieve policy ID");
        }
      } catch (error) {
        console.error("Error during policy purchase:", error);
        throw error;
      }
    });

    it("Should file a claim", async function () {
      console.log("\n[TEST] Filing a claim");

      if (!policyId) {
        console.log("Policy ID not found, skipping test");
        this.skip();
        return;
      }

      console.log("Policy ID for claim:", policyId);
      const documentHash = ethers.keccak256(
        ethers.toUtf8Bytes("test_document")
      );
      console.log("Document hash:", documentHash);

      const claimAmount = ethers.parseEther("5");
      console.log("Claim amount:", ethers.formatEther(claimAmount), "ETH");

      // Generate claim signature
      console.log("Generating claim signature...");
      const claimSignature = await generateClaimSignature(
        policyId,
        claimAmount,
        documentHash.toString()
      );

      // File claim
      console.log("Executing fileClaim transaction...");
      const tx = await lifeCareLite
        .connect(user1)
        .fileClaim(policyId, claimAmount, documentHash, claimSignature);

      console.log("Transaction hash:", tx.hash);
      console.log("Waiting for transaction confirmation...");

      const receipt = await tx.wait();
      console.log("Transaction confirmed, status:", receipt?.status);

      // Verify claim was filed
      console.log("Fetching claim details for verification...");
      const claim = await lifeCareLite.getClaim(policyId);
      console.log("Claim details:");
      console.log("- Amount:", ethers.formatEther(claim.amount), "ETH");
      console.log("- Document Hash:", claim.documentHash);
      console.log("- Is Pending:", claim.isPending);

      expect(claim.amount).to.equal(claimAmount);
      expect(claim.documentHash).to.equal(documentHash);
      expect(claim.isPending).to.be.true;

      console.log("✓ Claim verification successful");
    });

    it("Should approve a claim by admin", async function () {
      console.log("\n[TEST] Approving a claim by admin");

      if (!policyId) {
        console.log("Policy ID not found, skipping test");
        this.skip();
        return;
      }

      console.log("Policy ID for claim approval:", policyId);

      // Fund the vault first
      console.log("Funding the vault with 10 ETH...");
      const fundTx = await owner.sendTransaction({
        to: await vault.getAddress(),
        value: ethers.parseEther("10"),
      });
      console.log("Funding transaction hash:", fundTx.hash);

      const fundReceipt = await fundTx.wait();
      console.log("Funding confirmed, status:", fundReceipt?.status);

      // Check vault balance
      const vaultBalance = await ethers.provider.getBalance(
        await vault.getAddress()
      );
      console.log("Vault balance:", ethers.formatEther(vaultBalance), "ETH");

      // Get claim details before approval
      console.log("Claim details before approval:");
      const claimBefore = await lifeCareLite.getClaim(policyId);
      console.log("- Amount:", ethers.formatEther(claimBefore.amount), "ETH");
      console.log("- Is Pending:", claimBefore.isPending);

      // Get policy details before approval
      const policyBefore = await lifeCareLite.getPolicy(policyId);
      console.log("Policy status before approval:");
      console.log("- Is Active:", policyBefore.isActive);
      console.log("- Is Claimed:", policyBefore.isClaimed);

      // Get user balance before approval
      const userBalanceBefore = await ethers.provider.getBalance(user1Address);
      console.log(
        "User balance before approval:",
        ethers.formatEther(userBalanceBefore),
        "ETH"
      );

      // Approve claim
      console.log("Executing approveClaim transaction as admin...");
      const approveTx = await lifeCareLite
        .connect(admin)
        .approveClaim(policyId);
      console.log("Approval transaction hash:", approveTx.hash);

      const approveReceipt = await approveTx.wait();
      console.log("Approval confirmed, status:", approveReceipt?.status);

      // Get user balance after approval
      const userBalanceAfter = await ethers.provider.getBalance(user1Address);
      console.log(
        "User balance after approval:",
        ethers.formatEther(userBalanceAfter),
        "ETH"
      );
      console.log(
        "Balance increase:",
        ethers.formatEther(userBalanceAfter - userBalanceBefore),
        "ETH"
      );

      // Verify claim was approved
      console.log("Fetching claim and policy details after approval...");
      const claim = await lifeCareLite.getClaim(policyId);
      const policy = await lifeCareLite.getPolicy(policyId);

      console.log("Claim details after approval:");
      console.log("- Amount:", ethers.formatEther(claim.amount), "ETH");
      console.log("- Is Pending:", claim.isPending);

      console.log("Policy status after approval:");
      console.log("- Is Active:", policy.isActive);
      console.log("- Is Claimed:", policy.isClaimed);

      expect(claim.isPending).to.be.false;
      expect(policy.isClaimed).to.be.true;
      expect(policy.isActive).to.be.false;

      console.log("✓ Claim approval verification successful");
    });

    it("Should reject policy renewal", async function () {
      console.log("\n[TEST] Attempting policy renewal (should be rejected)");

      if (!policyId) {
        console.log("Policy ID not found, skipping test");
        this.skip();
        return;
      }

      console.log("Policy ID for renewal attempt:", policyId);
      console.log("Renewal parameters:");
      console.log("- Premium:", ethers.formatEther(premium), "ETH");
      console.log("- Duration:", duration);

      // Attempt to renew (should fail)
      console.log("Attempting to call renewPolicy (should fail)...");
      try {
        await lifeCareLite.connect(user1).renewPolicy(
          policyId,
          premium,
          BigInt(duration),
          "0x", // Dummy signature
          { value: premium }
        );
        console.log("❌ ERROR: Renewal succeeded when it should have failed");
        expect.fail("Renewal should have been rejected");
      } catch (error: any) {
        console.log("Renewal rejected as expected with error:", error.message);
        expect(error.message).to.include(
          "LifeCareLite does not support renewals"
        );
        console.log("✓ Policy renewal rejection verification successful");
      }
    });
  });

  describe("Edge Cases", function () {
    it("Should reject purchase with excessive duration", async function () {
      console.log(
        "\n[TEST] Attempting purchase with excessive duration (should be rejected)"
      );

      const excessiveDuration = 100 * 365 * 24 * 60 * 60; // 100 years
      console.log(
        "Excessive duration:",
        excessiveDuration,
        "seconds (",
        excessiveDuration / (365 * 24 * 60 * 60),
        "years)"
      );

      // Generate valid signature but with excessive duration
      console.log("Generating signature with excessive duration...");
      const signature = await generatePurchaseSignature(
        user1Address,
        premium,
        sumAssured,
        excessiveDuration
      );

      // Attempt purchase with excessive duration
      console.log(
        "Attempting to purchase policy with excessive duration (should fail)..."
      );
      try {
        await lifeCareLite
          .connect(user1)
          .purchasePolicy(
            user1Address,
            premium,
            sumAssured,
            BigInt(excessiveDuration),
            signature,
            { value: premium }
          );
        console.log(
          "❌ ERROR: Purchase with excessive duration succeeded when it should have failed"
        );
        expect.fail(
          "Purchase with excessive duration should have been rejected"
        );
      } catch (error: any) {
        console.log("Purchase rejected as expected with error:", error.message);
        expect(error.message).to.include("Exceeds maximum duration");
        console.log("✓ Excessive duration rejection verification successful");
      }
    });

    it("Should reject purchase with insufficient payment", async function () {
      console.log(
        "\n[TEST] Attempting purchase with insufficient payment (should be rejected)"
      );

      const insufficientPayment = premium / 2n;
      console.log("Required premium:", ethers.formatEther(premium), "ETH");
      console.log(
        "Insufficient payment:",
        ethers.formatEther(insufficientPayment),
        "ETH"
      );

      // Generate valid signature
      console.log("Generating valid signature...");
      const signature = await generatePurchaseSignature(
        user2Address,
        premium,
        sumAssured,
        duration
      );

      // Attempt purchase with insufficient payment
      console.log(
        "Attempting to purchase policy with insufficient payment (should fail)..."
      );
      try {
        await lifeCareLite
          .connect(user2)
          .purchasePolicy(
            user2Address,
            premium,
            sumAssured,
            BigInt(duration),
            signature,
            { value: insufficientPayment }
          );
        console.log(
          "❌ ERROR: Purchase with insufficient payment succeeded when it should have failed"
        );
        expect.fail(
          "Purchase with insufficient payment should have been rejected"
        );
      } catch (error: any) {
        console.log("Purchase rejected as expected with error:", error.message);
        expect(error.message).to.include("Incorrect premium amount");
        console.log("✓ Insufficient payment rejection verification successful");
      }
    });
  });
});
