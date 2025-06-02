import { expect } from "chai";
import { ethers } from "hardhat";
import { PolicyBaseMock, InsuranceVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PolicyBase & PolicyBaseMock", function () {
  let vault: InsuranceVault;
  let policyContract: PolicyBaseMock;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const VAULT_INITIAL_BALANCE = ethers.parseEther("100.0");
  const PREMIUM_AMOUNT = ethers.parseEther("0.1");
  const SUM_ASSURED = ethers.parseEther("1.0");
  const DURATION = 365 * 24 * 60 * 60; // 1 year in seconds
  const CLAIM_AMOUNT = ethers.parseEther("0.5");
  const REFUND_AMOUNT = ethers.parseEther("0.08");

  let samplePolicyId: string;

  beforeEach(async function () {
    [owner, admin, user1, user2, unauthorized] = await ethers.getSigners();

    // Deploy InsuranceVault
    const VaultFactory = await ethers.getContractFactory("InsuranceVault");
    vault = await VaultFactory.deploy(owner.address);

    // Deploy PolicyBaseMock
    const PolicyFactory = await ethers.getContractFactory("PolicyBaseMock");
    policyContract = await PolicyFactory.deploy(vault.target);

    // Fund the vault
    await owner.sendTransaction({
      to: vault.target,
      value: VAULT_INITIAL_BALANCE,
    });

    // Approve policy contract in vault
    await vault.connect(owner).approveContract(policyContract.target);

    // Grant admin role
    const adminRole = await policyContract.ADMIN_ROLE();
    await policyContract.connect(owner).grantRole(adminRole, admin.address);

    // Create a sample policy for testing
    const tx = await policyContract
      .connect(user1)
      .purchasePolicyWithoutSignature(
        user1.address,
        PREMIUM_AMOUNT,
        SUM_ASSURED,
        DURATION,
        { value: PREMIUM_AMOUNT }
      );
    const receipt = await tx.wait();
    const event = receipt?.logs.find((log) => {
      try {
        return (
          policyContract.interface.parseLog(log as any)?.name ===
          "PolicyPurchased"
        );
      } catch {
        return false;
      }
    });
    samplePolicyId = policyContract.interface.parseLog(event as any)?.args[0];
  });

  describe("Deployment & Initialization", function () {
    it("Should deploy with correct vault address", async function () {
      const vaultInfo = await policyContract.getVaultInfo();
      expect(vaultInfo.vaultAddress).to.equal(vault.target);
    });

    it("Should set deployer as default admin", async function () {
      const defaultAdminRole = await policyContract.DEFAULT_ADMIN_ROLE();
      expect(await policyContract.hasRole(defaultAdminRole, owner.address)).to
        .be.true;
    });

    it("Should set deployer as admin", async function () {
      const adminRole = await policyContract.ADMIN_ROLE();
      expect(await policyContract.hasRole(adminRole, owner.address)).to.be.true;
    });

    it("Should check vault approval status", async function () {
      expect(await policyContract.isApprovedInVault()).to.be.true;
    });
  });

  describe("Access Control", function () {
    describe("ADMIN_ROLE management", function () {
      it("Should allow admin to grant admin role", async function () {
        const adminRole = await policyContract.ADMIN_ROLE();
        await policyContract.connect(owner).grantRole(adminRole, user2.address);
        expect(await policyContract.hasRole(adminRole, user2.address)).to.be
          .true;
      });

      it("Should allow admin to revoke admin role", async function () {
        const adminRole = await policyContract.ADMIN_ROLE();
        await policyContract
          .connect(owner)
          .revokeRole(adminRole, admin.address);
        expect(await policyContract.hasRole(adminRole, admin.address)).to.be
          .false;
      });

      it("Should revert when non-admin tries to grant role", async function () {
        const adminRole = await policyContract.ADMIN_ROLE();
        await expect(
          policyContract
            .connect(unauthorized)
            .grantRole(adminRole, user2.address)
        ).to.be.revertedWithCustomError(
          policyContract,
          "AccessControlUnauthorizedAccount"
        );
      });
    });
  });

  describe("Policy Purchase", function () {
    describe("purchasePolicy (admin function)", function () {
      it("Should allow admin to purchase policy", async function () {
        const initialVaultBalance = await vault.getVaultBalance();

        await expect(
          policyContract
            .connect(admin)
            .purchasePolicy(
              user2.address,
              PREMIUM_AMOUNT,
              SUM_ASSURED,
              DURATION,
              { value: PREMIUM_AMOUNT }
            )
        ).to.emit(policyContract, "PolicyPurchased");

        expect(await vault.getVaultBalance()).to.equal(
          initialVaultBalance + PREMIUM_AMOUNT
        );
      });

      it("Should revert when non-admin tries to purchase policy", async function () {
        // Get admin role
        const adminRole = await policyContract.ADMIN_ROLE();

        // Explicitly check that unauthorized user doesn't have admin role
        expect(await policyContract.hasRole(adminRole, unauthorized.address)).to
          .be.false;

        // Attempt to purchase policy with unauthorized user
        await expect(
          policyContract
            .connect(unauthorized)
            .purchasePolicy(
              user2.address,
              PREMIUM_AMOUNT,
              SUM_ASSURED,
              DURATION,
              { value: PREMIUM_AMOUNT }
            )
        )
          .to.be.revertedWithCustomError(
            policyContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unauthorized.address, adminRole);
      });

      it("Should revert with invalid owner address", async function () {
        await expect(
          policyContract
            .connect(admin)
            .purchasePolicy(
              ethers.ZeroAddress,
              PREMIUM_AMOUNT,
              SUM_ASSURED,
              DURATION,
              { value: PREMIUM_AMOUNT }
            )
        ).to.be.revertedWith("Invalid owner");
      });

      it("Should revert with invalid parameters", async function () {
        // Zero premium
        await expect(
          policyContract
            .connect(admin)
            .purchasePolicy(user2.address, 0, SUM_ASSURED, DURATION, {
              value: 0,
            })
        ).to.be.revertedWith("Invalid parameters");

        // Zero sum assured
        await expect(
          policyContract
            .connect(admin)
            .purchasePolicy(user2.address, PREMIUM_AMOUNT, 0, DURATION, {
              value: PREMIUM_AMOUNT,
            })
        ).to.be.revertedWith("Invalid parameters");

        // Zero duration
        await expect(
          policyContract
            .connect(admin)
            .purchasePolicy(user2.address, PREMIUM_AMOUNT, SUM_ASSURED, 0, {
              value: PREMIUM_AMOUNT,
            })
        ).to.be.revertedWith("Invalid parameters");
      });

      it("Should revert with incorrect premium amount", async function () {
        await expect(
          policyContract
            .connect(admin)
            .purchasePolicy(
              user2.address,
              PREMIUM_AMOUNT,
              SUM_ASSURED,
              DURATION,
              { value: PREMIUM_AMOUNT + 1n }
            )
        ).to.be.revertedWith("Incorrect premium");
      });
    });

    describe("purchasePolicyWithoutSignature (test function)", function () {
      it("Should create valid policy", async function () {
        const tx = await policyContract
          .connect(user2)
          .purchasePolicyWithoutSignature(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            DURATION,
            { value: PREMIUM_AMOUNT }
          );

        const receipt = await tx.wait();
        const event = receipt?.logs.find((log) => {
          try {
            return (
              policyContract.interface.parseLog(log as any)?.name ===
              "PolicyPurchased"
            );
          } catch {
            return false;
          }
        });
        const policyId = policyContract.interface.parseLog(event as any)
          ?.args[0];

        const policy = await policyContract.getPolicy(policyId);
        expect(policy.owner).to.equal(user2.address);
        expect(policy.premium).to.equal(PREMIUM_AMOUNT);
        expect(policy.sumAssured).to.equal(SUM_ASSURED);
        expect(policy.isActive).to.be.true;
        expect(policy.isClaimed).to.be.false;
      });

      it("Should process mock policy data", async function () {
        const tx = await policyContract
          .connect(user2)
          .purchasePolicyWithoutSignature(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            DURATION,
            { value: PREMIUM_AMOUNT }
          );

        const receipt = await tx.wait();
        const event = receipt?.logs.find((log) => {
          try {
            return (
              policyContract.interface.parseLog(log as any)?.name ===
              "PolicyPurchased"
            );
          } catch {
            return false;
          }
        });
        const policyId = policyContract.interface.parseLog(event as any)
          ?.args[0];

        const mockData = await policyContract.getMockPolicyData(policyId);
        expect(mockData.metadata).to.equal("Test Metadata");
        expect(mockData.processed).to.be.true;
      });
    });
  });

  describe("Claim Management", function () {
    describe("fileAndApproveClaim", function () {
      it("Should allow admin to file and approve claim", async function () {
        const initialUserBalance = await ethers.provider.getBalance(
          user1.address
        );

        await expect(
          policyContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        )
          .to.emit(policyContract, "ClaimFiled")
          .and.to.emit(policyContract, "ClaimApproved");

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.isClaimed).to.be.true;
        expect(policy.isActive).to.be.false;

        const finalUserBalance = await ethers.provider.getBalance(
          user1.address
        );
        expect(finalUserBalance).to.equal(initialUserBalance + CLAIM_AMOUNT);
      });

      it("Should revert when non-admin tries to file claim", async function () {
        await expect(
          policyContract
            .connect(unauthorized)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWithCustomError(
          policyContract,
          "AccessControlUnauthorizedAccount"
        );
      });

      it("Should revert for non-existent policy", async function () {
        const fakePolicyId = ethers.keccak256(ethers.toUtf8Bytes("fake"));
        await expect(
          policyContract
            .connect(admin)
            .fileAndApproveClaim(fakePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Policy does not exist");
      });

      it("Should revert for inactive policy", async function () {
        await policyContract
          .connect(admin)
          .setPolicyState(samplePolicyId, false, false);

        await expect(
          policyContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Policy not active");
      });

      it("Should revert for already claimed policy", async function () {
        await policyContract
          .connect(admin)
          .setPolicyState(samplePolicyId, true, true);

        await expect(
          policyContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Policy already claimed");
      });

      it("Should revert for zero claim amount", async function () {
        await expect(
          policyContract.connect(admin).fileAndApproveClaim(samplePolicyId, 0)
        ).to.be.revertedWith("Invalid amount");
      });

      it("Should revert when claim exceeds sum assured", async function () {
        const excessiveAmount = SUM_ASSURED + ethers.parseEther("1.0");
        await expect(
          policyContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, excessiveAmount)
        ).to.be.revertedWith("Amount exceeds sum assured");
      });
    });

    describe("fileClaimWithoutSignature (test function)", function () {
      it("Should file claim with pending status", async function () {
        await expect(
          policyContract
            .connect(user1)
            .fileClaimWithoutSignature(samplePolicyId, CLAIM_AMOUNT)
        ).to.emit(policyContract, "ClaimFiled");

        const claim = await policyContract.getClaim(samplePolicyId);
        expect(claim.amount).to.equal(CLAIM_AMOUNT);
        expect(claim.isPending).to.be.true;
      });

      it("Should revert for duplicate claims", async function () {
        await policyContract
          .connect(user1)
          .fileClaimWithoutSignature(samplePolicyId, CLAIM_AMOUNT);

        await expect(
          policyContract
            .connect(user1)
            .fileClaimWithoutSignature(samplePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Claim exists");
      });
    });

    describe("approveClaimWithoutVerification (test function)", function () {
      beforeEach(async function () {
        await policyContract
          .connect(admin)
          .createMockClaim(samplePolicyId, CLAIM_AMOUNT, true);
      });

      it("Should approve pending claim", async function () {
        await expect(
          policyContract
            .connect(admin)
            .approveClaimWithoutVerification(samplePolicyId)
        ).to.emit(policyContract, "ClaimApproved");

        const claim = await policyContract.getClaim(samplePolicyId);
        expect(claim.isPending).to.be.false;

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.isClaimed).to.be.true;
        expect(policy.isActive).to.be.false;
      });

      it("Should revert when no pending claim exists", async function () {
        await policyContract
          .connect(admin)
          .setClaimState(samplePolicyId, false);

        await expect(
          policyContract
            .connect(admin)
            .approveClaimWithoutVerification(samplePolicyId)
        ).to.be.revertedWith("No pending claim");
      });
    });
  });

  describe("Policy Cancellation", function () {
    describe("cancelPolicy", function () {
      it("Should allow admin to cancel policy", async function () {
        const initialUserBalance = await ethers.provider.getBalance(
          user1.address
        );

        await expect(
          policyContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.emit(policyContract, "PolicyCancelled");

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;

        const finalUserBalance = await ethers.provider.getBalance(
          user1.address
        );
        expect(finalUserBalance).to.equal(initialUserBalance + REFUND_AMOUNT);
      });

      it("Should revert when non-admin tries to cancel", async function () {
        await expect(
          policyContract
            .connect(unauthorized)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWithCustomError(
          policyContract,
          "AccessControlUnauthorizedAccount"
        );
      });

      it("Should revert for inactive policy", async function () {
        await policyContract
          .connect(admin)
          .setPolicyState(samplePolicyId, false, false);

        await expect(
          policyContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWith("Policy not active");
      });
    });

    describe("cancelPolicyWithoutSignature (test function)", function () {
      it("Should cancel policy and send refund", async function () {
        await expect(
          policyContract
            .connect(admin)
            .cancelPolicyWithoutSignature(samplePolicyId, REFUND_AMOUNT)
        ).to.emit(policyContract, "PolicyCancelled");

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;
      });
    });
  });

  describe("Policy Renewal", function () {
    describe("renewPolicy", function () {
      it("Should allow policy owner to renew policy", async function () {
        const renewalPremium = ethers.parseEther("0.5");
        const renewalDuration = 180 * 24 * 60 * 60; // 6 months
        const originalExpiry = (await policyContract.getPolicy(samplePolicyId))
          .expiry;

        await expect(
          policyContract
            .connect(user1)
            .renewPolicy(samplePolicyId, renewalPremium, renewalDuration, {
              value: renewalPremium,
            })
        ).to.emit(policyContract, "PolicyRenewed");

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.premium).to.equal(renewalPremium);
        expect(policy.expiry).to.equal(
          originalExpiry + BigInt(renewalDuration)
        );
      });

      it("Should revert when non-owner tries to renew", async function () {
        const renewalPremium = ethers.parseEther("0.5");
        const renewalDuration = 180 * 24 * 60 * 60;

        await expect(
          policyContract
            .connect(user2)
            .renewPolicy(samplePolicyId, renewalPremium, renewalDuration, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("Not the policy owner");
      });

      it("Should revert for claimed policy", async function () {
        await policyContract
          .connect(admin)
          .setPolicyState(samplePolicyId, true, true);
        const renewalPremium = ethers.parseEther("0.5");
        const renewalDuration = 180 * 24 * 60 * 60;

        await expect(
          policyContract
            .connect(user1)
            .renewPolicy(samplePolicyId, renewalPremium, renewalDuration, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("Policy already claimed");
      });

      it("Should revert with incorrect premium", async function () {
        const renewalPremium = ethers.parseEther("0.5");
        const renewalDuration = 180 * 24 * 60 * 60;

        await expect(
          policyContract
            .connect(user1)
            .renewPolicy(samplePolicyId, renewalPremium, renewalDuration, {
              value: renewalPremium + 1n,
            })
        ).to.be.revertedWith("Incorrect premium");
      });
    });
  });

  describe("View Functions", function () {
    describe("getPolicy", function () {
      it("Should return correct policy data", async function () {
        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.owner).to.equal(user1.address);
        expect(policy.premium).to.equal(PREMIUM_AMOUNT);
        expect(policy.sumAssured).to.equal(SUM_ASSURED);
        expect(policy.isActive).to.be.true;
        expect(policy.isClaimed).to.be.false;
      });
    });

    describe("getClaim", function () {
      it("Should return empty claim for new policy", async function () {
        const claim = await policyContract.getClaim(samplePolicyId);
        expect(claim.amount).to.equal(0);
        expect(claim.isPending).to.be.false;
      });

      it("Should return correct claim data after filing", async function () {
        await policyContract
          .connect(user1)
          .fileClaimWithoutSignature(samplePolicyId, CLAIM_AMOUNT);

        const claim = await policyContract.getClaim(samplePolicyId);
        expect(claim.amount).to.equal(CLAIM_AMOUNT);
        expect(claim.isPending).to.be.true;
      });
    });

    describe("getClaimStatus", function () {
      it("Should return correct status for new policy", async function () {
        const status = await policyContract.getClaimStatus(samplePolicyId);
        expect(status.hasClaim).to.be.false;
        expect(status.amount).to.equal(0);
        expect(status.isPending).to.be.false;
        expect(status.isApproved).to.be.false;
      });

      it("Should return correct status for pending claim", async function () {
        await policyContract
          .connect(user1)
          .fileClaimWithoutSignature(samplePolicyId, CLAIM_AMOUNT);

        const status = await policyContract.getClaimStatus(samplePolicyId);
        expect(status.hasClaim).to.be.true;
        expect(status.amount).to.equal(CLAIM_AMOUNT);
        expect(status.isPending).to.be.true;
        expect(status.isApproved).to.be.false;
      });

      it("Should return correct status for approved claim", async function () {
        await policyContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);

        const status = await policyContract.getClaimStatus(samplePolicyId);
        expect(status.hasClaim).to.be.true;
        expect(status.amount).to.equal(CLAIM_AMOUNT);
        expect(status.isPending).to.be.false;
        expect(status.isApproved).to.be.true;
      });
    });

    describe("getVaultInfo", function () {
      it("Should return correct vault information", async function () {
        const vaultInfo = await policyContract.getVaultInfo();
        expect(vaultInfo.vaultAddress).to.equal(vault.target);
        expect(vaultInfo.vaultBalance).to.be.gt(0);
        expect(vaultInfo.isApproved).to.be.true;
      });
    });

    describe("isApprovedInVault", function () {
      it("Should return true when approved", async function () {
        expect(await policyContract.isApprovedInVault()).to.be.true;
      });

      it("Should return false when not approved", async function () {
        await vault.connect(owner).revokeContract(policyContract.target);
        expect(await policyContract.isApprovedInVault()).to.be.false;
      });
    });
  });

  describe("Test Utility Functions", function () {
    describe("Mock data functions", function () {
      it("Should set and get mock policy data", async function () {
        const mockData = await policyContract.getMockPolicyData(samplePolicyId);
        expect(mockData.metadata).to.equal("Test Metadata");
        expect(mockData.processed).to.be.true;
      });
    });

    describe("Admin test utilities", function () {
      it("Should allow admin to force expire policy", async function () {
        await policyContract.connect(admin).forceExpirePolicy(samplePolicyId);

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;
        expect(policy.expiry).to.be.lt(
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp)
        );
      });

      it("Should allow admin to set expiry timestamp", async function () {
        const newExpiry = Math.floor(Date.now() / 1000) + 1000;
        await policyContract
          .connect(admin)
          .setExpiryTimestamp(samplePolicyId, newExpiry);

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.expiry).to.equal(newExpiry);
      });

      it("Should allow admin to set claim state", async function () {
        await policyContract
          .connect(admin)
          .createMockClaim(samplePolicyId, CLAIM_AMOUNT, true);
        await policyContract
          .connect(admin)
          .setClaimState(samplePolicyId, false);

        const claim = await policyContract.getClaim(samplePolicyId);
        expect(claim.isPending).to.be.false;
      });

      it("Should allow admin to set policy state", async function () {
        await policyContract
          .connect(admin)
          .setPolicyState(samplePolicyId, false, true);

        const policy = await policyContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;
        expect(policy.isClaimed).to.be.true;
      });

      it("Should allow admin to create mock claim", async function () {
        const newPolicyId = ethers.keccak256(ethers.toUtf8Bytes("test2"));

        // Create a new policy first
        await policyContract
          .connect(user2)
          .purchasePolicyWithoutSignature(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            DURATION,
            { value: PREMIUM_AMOUNT }
          );

        await expect(
          policyContract
            .connect(admin)
            .createMockClaim(samplePolicyId, CLAIM_AMOUNT, true)
        ).to.emit(policyContract, "ClaimFiled");

        const claim = await policyContract.getClaim(samplePolicyId);
        expect(claim.amount).to.equal(CLAIM_AMOUNT);
        expect(claim.isPending).to.be.true;
      });
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete policy lifecycle", async function () {
      // 1. Purchase policy
      const tx = await policyContract
        .connect(user2)
        .purchasePolicyWithoutSignature(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          DURATION,
          { value: PREMIUM_AMOUNT }
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return (
            policyContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const policyId = policyContract.interface.parseLog(event as any)?.args[0];

      // 2. File claim
      await policyContract
        .connect(user2)
        .fileClaimWithoutSignature(policyId, CLAIM_AMOUNT);

      // 3. Approve claim
      await policyContract
        .connect(admin)
        .approveClaimWithoutVerification(policyId);

      // 4. Verify final state
      const policy = await policyContract.getPolicy(policyId);
      expect(policy.isClaimed).to.be.true;
      expect(policy.isActive).to.be.false;
    });

    it("Should handle policy renewal lifecycle", async function () {
      const renewalPremium = ethers.parseEther("0.3");
      const renewalDuration = 90 * 24 * 60 * 60; // 3 months

      // Renew policy
      await policyContract
        .connect(user1)
        .renewPolicyWithoutSignature(
          samplePolicyId,
          renewalPremium,
          renewalDuration,
          { value: renewalPremium }
        );

      // Verify renewal
      const policy = await policyContract.getPolicy(samplePolicyId);
      expect(policy.premium).to.equal(renewalPremium);
    });

    it("Should handle policy cancellation with refund", async function () {
      const initialBalance = await ethers.provider.getBalance(user1.address);

      await policyContract
        .connect(admin)
        .cancelPolicyWithoutSignature(samplePolicyId, REFUND_AMOUNT);

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.equal(initialBalance + REFUND_AMOUNT);

      const policy = await policyContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.false;
    });
  });

  describe("Error Handling & Edge Cases", function () {
    it("Should handle vault transfer failures gracefully", async function () {
      // Revoke vault approval to simulate transfer failure
      await vault.connect(owner).revokeContract(policyContract.target);

      await expect(
        policyContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
      ).to.be.reverted; // Should fail due to vault not being approved
    });
    it("Should handle expired policies correctly", async function () {
      // Get current blockchain timestamp
      const currentBlock = await ethers.provider.getBlock("latest");
      const currentTime = currentBlock!.timestamp;

      // Set the policy to an expired timestamp but keep it active
      await policyContract
        .connect(admin)
        .setExpiryTimestamp(samplePolicyId, currentTime - 3600); // 1 hour in the past

      // IMPORTANT: Explicitly ensure policy is active
      await policyContract
        .connect(admin)
        .setPolicyState(samplePolicyId, true, false);

      // Verify policy state after our modifications
      const policy = await policyContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.true;
      expect(Number(policy.expiry)).to.be.lessThan(currentTime);

      // Now try to claim on the expired but active policy
      await expect(
        policyContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
      ).to.emit(policyContract, "ClaimApproved");
    });

    it("Should handle zero policy ID correctly", async function () {
      const zeroPolicyId =
        "0x0000000000000000000000000000000000000000000000000000000000000000";

      await expect(
        policyContract
          .connect(admin)
          .fileAndApproveClaim(zeroPolicyId, CLAIM_AMOUNT)
      ).to.be.revertedWith("Policy does not exist");
    });
  });
});
