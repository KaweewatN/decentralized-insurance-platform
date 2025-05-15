import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import type { TransactionReceipt } from "ethers";
import type { HealthCareLite, InsuranceVault } from "../typechain-types";

describe("HealthCareLite", function () {
  let vault: any; // InsuranceVault
  let hc: any; // HealthCareLite
  let owner: Signer;
  let trustedSigner: Signer;
  let admin: Signer;
  let user: Signer;
  let other: Signer;
  let adminRole: string;

  const ONE_YEAR = 365 * 24 * 60 * 60; // 1 year in seconds
  const THIRTY_DAYS = 30 * 24 * 60 * 60; // 30 days in seconds
  const premium = ethers.parseEther("1"); // 1 ETH
  const sumAssured = ethers.parseEther("5"); // 5 ETH

  // Helper function to create policy signature matching contract's expectation
  async function createPolicySignature(
    address: string,
    premiumAmount: bigint,
    sumAssuredAmount: bigint,
    duration: number
  ) {
    const chainId = (await ethers.provider.getNetwork()).chainId;

    // FIXED: Using proper parameter order to match contract's expectation
    // The contract expects: (address, premium, sumAssured, duration, chainId)
    const packedData = ethers.solidityPacked(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [address, premiumAmount, sumAssuredAmount, duration, chainId]
    );

    // Hash the packed data
    const msgHash = ethers.keccak256(packedData);

    // Sign the hash directly (no need for hashMessage)
    const signature = await trustedSigner.signMessage(ethers.getBytes(msgHash));

    return signature;
  }

  // Helper function to create a policy with a unique signature
  async function createTestPolicy(
    policyUser: Signer,
    premiumAmount: bigint,
    sumAssuredAmount: bigint,
    duration: number
  ) {
    const userAddress = await policyUser.getAddress();
    const sig = await createPolicySignature(
      userAddress,
      premiumAmount,
      sumAssuredAmount,
      duration
    );

    const tx = await hc
      .connect(policyUser)
      .purchaseHealthPolicy(
        userAddress,
        premiumAmount,
        sumAssuredAmount,
        duration,
        sig,
        {
          value: premiumAmount,
        }
      );

    const receipt = await tx.wait();

    // Extract policy ID
    if (receipt?.logs) {
      const policyPurchasedInterface = new ethers.Interface(
        hc.interface.fragments
      );

      for (const log of receipt.logs) {
        try {
          const parsedLog = policyPurchasedInterface.parseLog(log as any);
          if (parsedLog && parsedLog.name === "PolicyPurchased") {
            return parsedLog.args.policyId;
          }
        } catch (e) {
          // Not the event we're looking for
        }
      }
    }

    throw new Error("Failed to get policy ID");
  }

  // Helper for renewal signature
  async function createRenewalSignature(
    policyId: string,
    owner: string,
    premium: bigint,
    duration: number
  ) {
    const chainId = (await ethers.provider.getNetwork()).chainId;

    // Match exactly what the contract expects for renewal
    const packedData = ethers.solidityPacked(
      ["bytes32", "address", "uint256", "uint256", "uint256"],
      [policyId, owner, premium, duration, chainId]
    );

    const msgHash = ethers.keccak256(packedData);
    return await trustedSigner.signMessage(ethers.getBytes(msgHash));
  }

  // Helper for claim signature
  async function createClaimSignature(
    policyId: string,
    amount: bigint,
    docHash: string
  ) {
    const chainId = (await ethers.provider.getNetwork()).chainId;

    // Match exactly what the contract expects for claims
    const packedData = ethers.solidityPacked(
      ["bytes32", "uint256", "string", "uint256"],
      [policyId, amount, docHash, chainId]
    );

    const msgHash = ethers.keccak256(packedData);
    return await trustedSigner.signMessage(ethers.getBytes(msgHash));
  }

  // Helper for cancel policy signature
  async function createCancelSignature(
    policyId: string,
    owner: string,
    refundAmount: bigint
  ) {
    const chainId = (await ethers.provider.getNetwork()).chainId;

    // Match exactly what the contract expects for cancellation
    const packedData = ethers.solidityPacked(
      ["bytes32", "address", "uint256", "uint256", "uint256"],
      [policyId, owner, refundAmount, 0, chainId]
    );

    const msgHash = ethers.keccak256(packedData);
    return await trustedSigner.signMessage(ethers.getBytes(msgHash));
  }

  beforeEach(async function () {
    console.log("\n===== RESET EVM STATE =====");

    // Reset EVM state
    await ethers.provider.send("hardhat_reset", []);

    // Reinitialize signers and contracts
    const signers = await ethers.getSigners();
    owner = signers[0];
    trustedSigner = signers[1];
    admin = signers[2];
    user = signers[3];
    other = signers[4];

    // Deploy Vault
    console.log("\n===== DEPLOY INSURANCE VAULT =====");
    const VaultF = await ethers.getContractFactory("InsuranceVault");
    vault = await VaultF.deploy(await owner.getAddress());
    console.log(`Vault deployed at ${await vault.getAddress()}`);

    // Fund Vault
    await owner.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther("50"),
    });
    console.log(`Vault funded: 50 ETH`);

    // Deploy HealthCareLite
    console.log("\n===== DEPLOY HEALTHCARE LITE =====");
    const HCF = await ethers.getContractFactory("HealthCareLite");
    hc = await HCF.deploy(
      await trustedSigner.getAddress(),
      await vault.getAddress()
    );
    console.log(`HealthCareLite deployed at ${await hc.getAddress()}`);

    // Transfer Vault ownership to contract
    await vault.connect(owner).transferOwnership(await hc.getAddress());
    console.log(`Vault ownership transferred to contract`);

    // Grant admin role
    adminRole = await hc.ADMIN_ROLE();
    await hc.connect(owner).grantRole(adminRole, await admin.getAddress());
    console.log(`Granted ADMIN_ROLE to ${await admin.getAddress()}`);
  });

  describe("Basic Setup", function () {
    it("deployment sets trustedSigner & vault", async function () {
      console.log("TEST: deployment checks init state");
      expect(await hc.trustedSigner()).to.equal(
        await trustedSigner.getAddress()
      );
      expect(await hc.vault()).to.equal(await vault.getAddress());
    });
  });

  describe("Policy Operations", function () {
    it("rejects unauthorized and invalid vaults", async function () {
      console.log("TEST: setVault unauthorized & invalid");
      const otherAddress = await other.getAddress();
      await expect(hc.connect(other).setVault(otherAddress))
        .to.be.revertedWithCustomError(hc, "AccessControlUnauthorizedAccount")
        .withArgs(otherAddress, adminRole);

      await expect(
        hc.connect(owner).setVault(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid vault address");
    });

    it("allows admin to update vault", async function () {
      console.log("TEST: setVault success path");
      const NewVaultF = await ethers.getContractFactory("InsuranceVault");
      const newVault = await NewVaultF.deploy(await owner.getAddress());
      const newAddr = await newVault.getAddress();

      await expect(hc.connect(admin).setVault(newAddr))
        .to.emit(hc, "VaultUpdated")
        .withArgs(newAddr);

      expect(await hc.vault()).to.equal(newAddr);

      // Reset vault back to original for other tests
      await hc.connect(admin).setVault(await vault.getAddress());
    });

    it("rejects invalid signature for policy purchase", async function () {
      console.log("TEST: purchaseHealthPolicy invalid signature");
      const invalidSig = "0x1234";
      const userAddress = await user.getAddress();

      await expect(
        hc
          .connect(user)
          .purchaseHealthPolicy(
            userAddress,
            premium,
            sumAssured,
            ONE_YEAR,
            invalidSig,
            { value: premium }
          )
      ).to.be.revertedWith("Invalid signature length");
    });

    it("rejects when msg.value doesn't match premium", async function () {
      console.log("TEST: purchaseHealthPolicy incorrect premium");
      const userAddress = await user.getAddress();

      // Create policy signature
      const sig = await createPolicySignature(
        userAddress,
        premium,
        sumAssured,
        ONE_YEAR
      );

      await expect(
        hc
          .connect(user)
          .purchaseHealthPolicy(
            userAddress,
            premium,
            sumAssured,
            ONE_YEAR,
            sig,
            { value: premium - 1n }
          )
      ).to.be.revertedWith("Incorrect premium amount");
    });

    it("accepts valid purchase and emits events", async function () {
      console.log("TEST: purchaseHealthPolicy success path");
      const userAddress = await user.getAddress();

      // Create policy signature
      const sig = await createPolicySignature(
        userAddress,
        premium,
        sumAssured,
        ONE_YEAR
      );

      const vaultBal0 = await ethers.provider.getBalance(
        await vault.getAddress()
      );

      const tx = await hc
        .connect(user)
        .purchaseHealthPolicy(userAddress, premium, sumAssured, ONE_YEAR, sig, {
          value: premium,
        });

      const receipt = await tx.wait();

      // Check events
      await expect(tx)
        .to.emit(hc, "PolicyPurchased")
        .withArgs(
          matchAnyValue(), // policyId can be any value
          userAddress,
          premium,
          sumAssured,
          matchAnyValue() // timestamp can be any value
        )
        .and.to.emit(hc, "PremiumCalculated")
        .withArgs(
          matchAnyValue(), // policyId can be any value
          userAddress,
          premium
        );

      const vaultBal1 = await ethers.provider.getBalance(
        await vault.getAddress()
      );
      expect(vaultBal1 - vaultBal0).to.equal(premium);

      // Get policy ID for future tests
      let policyId: string | undefined;

      if (receipt?.logs && receipt.logs.length > 0) {
        const policyPurchasedInterface = new ethers.Interface(
          hc.interface.fragments
        );

        for (const log of receipt.logs) {
          try {
            const parsedLog = policyPurchasedInterface.parseLog(log as any);
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              policyId = parsedLog.args.policyId;
              break;
            }
          } catch (e) {
            // Not the event we're looking for
          }
        }
      }

      console.log("Policy ID:", policyId);
      if (policyId) {
        // Store for later tests
        this.policyId = policyId;
      }
    });
  });

  describe("Post-purchase flows", function () {
    // Each test creates its own policy to avoid dependence on previous tests
    it("getRemainingCoverage() matches sumAssured initially", async function () {
      console.log("TEST: getRemainingCoverage initial");

      // Create a fresh policy
      const testPolicyId = await createTestPolicy(
        user,
        premium,
        sumAssured,
        ONE_YEAR
      );
      console.log("Coverage test policy ID:", testPolicyId);

      expect(await hc.getRemainingCoverage(testPolicyId)).to.equal(sumAssured);
    });

    it("can file and approve a claim", async function () {
      console.log("TEST: fileClaim & approveClaim");

      // Create a fresh policy
      const testPolicyId = await createTestPolicy(
        user,
        premium,
        sumAssured,
        ONE_YEAR
      );
      console.log("Claim test policy ID:", testPolicyId);

      const userAddress = await user.getAddress();
      const claimAmt = ethers.parseEther("2");
      const docHash = "doc123";

      // Generate claim signature
      const claimSig = await createClaimSignature(
        testPolicyId,
        claimAmt,
        docHash
      );

      const fileTx = await hc
        .connect(user)
        .fileClaim(testPolicyId, claimAmt, docHash, claimSig);

      await expect(fileTx)
        .to.emit(hc, "ClaimFiled")
        .withArgs(testPolicyId, userAddress, claimAmt, docHash);

      const userBal0 = await ethers.provider.getBalance(userAddress);
      const approveTx = await hc.connect(admin).approveClaim(testPolicyId);

      await expect(approveTx)
        .to.emit(hc, "ClaimApproved")
        .withArgs(testPolicyId, userAddress, claimAmt)
        .and.to.emit(hc, "ClaimTransferred")
        .withArgs(testPolicyId, userAddress, claimAmt);

      const userBal1 = await ethers.provider.getBalance(userAddress);
      expect(userBal1).to.be.gt(userBal0);

      // Check remaining coverage is reduced
      expect(await hc.getRemainingCoverage(testPolicyId)).to.equal(
        sumAssured - claimAmt
      );
    });

    it("calculateRefund() prorates correctly", async function () {
      console.log("TEST: calculateRefund prorates");

      // Create a fresh policy
      const refundPolicyId = await createTestPolicy(
        user,
        premium,
        sumAssured,
        ONE_YEAR
      );
      console.log("Refund test policy ID:", refundPolicyId);

      // Check initial refund
      expect(await hc.calculateRefund(refundPolicyId)).to.be.at.most(premium);

      // Move time forward halfway
      await ethers.provider.send("evm_increaseTime", [ONE_YEAR / 2]);
      await ethers.provider.send("evm_mine", []);

      // Check refund is ~50% of premium
      expect(await hc.calculateRefund(refundPolicyId)).to.be.closeTo(
        premium / 2n,
        ethers.parseEther("0.01") // Allow small precision differences
      );

      // Move time forward completely
      await ethers.provider.send("evm_increaseTime", [ONE_YEAR]);
      await ethers.provider.send("evm_mine", []);

      // Check refund is 0
      expect(await hc.calculateRefund(refundPolicyId)).to.equal(0n);
    });
  });

  describe("Renewal", function () {
    it("allows renewal within 30 days of expiry", async function () {
      console.log("TEST: renewal within 30 days");

      // Create a fresh policy
      const renewPolicyId = await createTestPolicy(
        user,
        premium,
        sumAssured,
        ONE_YEAR
      );
      console.log("Renewal test policy ID:", renewPolicyId);

      const userAddress = await user.getAddress();

      // Move time forward to 15 days before expiry
      await ethers.provider.send("evm_increaseTime", [
        ONE_YEAR - 15 * 24 * 60 * 60,
      ]);
      await ethers.provider.send("evm_mine", []);

      // Renew policy with a proper signature
      const newPremium = ethers.parseEther("1.5");

      // Generate renewal signature correctly
      const renewSig = await createRenewalSignature(
        renewPolicyId,
        userAddress,
        newPremium,
        ONE_YEAR
      );

      const renewTx = await hc
        .connect(user)
        .renewPolicy(renewPolicyId, newPremium, ONE_YEAR, renewSig, {
          value: newPremium,
        });

      await expect(renewTx)
        .to.emit(hc, "PolicyRenewed")
        .withArgs(renewPolicyId, userAddress, newPremium, matchAnyValue());
      // Check policy was updated
      const policy = await hc.getPolicy(renewPolicyId);
      expect(policy.premium).to.equal(newPremium);

      // Claim amounts should be reset
      expect(await hc.getRemainingCoverage(renewPolicyId)).to.equal(sumAssured);
    });

    it("can cancel policy with refund", async function () {
      console.log("TEST: cancel policy with refund");

      // Create a fresh policy
      const cancelPolicyId = await createTestPolicy(
        user,
        premium,
        sumAssured,
        ONE_YEAR
      );

      const userAddress = await user.getAddress();
      const refundAmount = premium / 2n;

      // Generate cancel signature
      const cancelSig = await createCancelSignature(
        cancelPolicyId,
        userAddress,
        refundAmount
      );

      const userBal0 = await ethers.provider.getBalance(userAddress);

      const cancelTx = await hc
        .connect(admin)
        .cancelPolicy(cancelPolicyId, refundAmount, cancelSig);

      await expect(cancelTx)
        .to.emit(hc, "PolicyCancelled")
        .withArgs(cancelPolicyId, userAddress, refundAmount)
        .and.to.emit(hc, "PolicyRefunded")
        .withArgs(cancelPolicyId, userAddress, refundAmount);

      const userBal1 = await ethers.provider.getBalance(userAddress);
      expect(userBal1).to.be.gt(userBal0);

      // Policy should be inactive
      const policy = await hc.getPolicy(cancelPolicyId);
      expect(policy.isActive).to.be.false;
    });
  });
});

// Helper function to match any value in expect.to.emit checks
function matchAnyValue() {
  return (actual: any) => {
    // Always return true, we just want to ensure the parameter exists
    return true;
  };
}
