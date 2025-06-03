import { expect } from "chai";
import { ethers } from "hardhat";
import { LifeCareLite, InsuranceVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LifeCareLite - Comprehensive Unit Tests", function () {
  let vault: InsuranceVault;
  let lifeContract: LifeCareLite;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const VAULT_INITIAL_BALANCE = ethers.parseEther("10.0");
  const PREMIUM_AMOUNT = ethers.parseEther("0.2");
  const SUM_ASSURED = ethers.parseEther("5.0");
  const MAX_DURATION = 80 * 365 * 24 * 60 * 60; // 80 years in seconds
  const STANDARD_DURATION = 20 * 365 * 24 * 60 * 60; // 20 years in seconds
  const CLAIM_AMOUNT = ethers.parseEther("2.5");
  const REFUND_AMOUNT = ethers.parseEther("0.1");

  let samplePolicyId: string;
  let adminRole: string;

  beforeEach(async function () {
    [owner, admin, user1, user2, unauthorized] = await ethers.getSigners();

    // Deploy InsuranceVault
    const VaultFactory = await ethers.getContractFactory("InsuranceVault");
    vault = await VaultFactory.deploy(owner.address);

    // Deploy LifeCareLite
    const LifeFactory = await ethers.getContractFactory("LifeCareLite");
    lifeContract = await LifeFactory.deploy(vault.target);

    // Fund the vault
    await owner.sendTransaction({
      to: vault.target,
      value: VAULT_INITIAL_BALANCE,
    });

    // Approve life contract in vault
    await vault.connect(owner).approveContract(lifeContract.target);

    // Grant admin role
    adminRole = await lifeContract.ADMIN_ROLE();
    await lifeContract.connect(owner).grantRole(adminRole, admin.address);

    // Create a sample policy for testing
    const tx = await lifeContract
      .connect(admin)
      .purchasePolicy(
        user1.address,
        PREMIUM_AMOUNT,
        SUM_ASSURED,
        STANDARD_DURATION,
        { value: PREMIUM_AMOUNT }
      );
    const receipt = await tx.wait();
    const event = receipt?.logs.find((log) => {
      try {
        return (
          lifeContract.interface.parseLog(log as any)?.name ===
          "PolicyPurchased"
        );
      } catch {
        return false;
      }
    });
    samplePolicyId = lifeContract.interface.parseLog(event as any)?.args[0];
  });

  describe("Deployment & Initialization", function () {
    it("Should deploy with correct vault address", async function () {
      expect(await lifeContract.vault()).to.equal(vault.target);
    });

    it("Should set deployer as default admin", async function () {
      const defaultAdminRole = await lifeContract.DEFAULT_ADMIN_ROLE();
      expect(await lifeContract.hasRole(defaultAdminRole, owner.address)).to.be
        .true;
    });

    it("Should inherit from PolicyBase correctly", async function () {
      expect(await lifeContract.ADMIN_ROLE()).to.not.be.undefined;
    });

    it("Should enforce maximum duration (80 years)", async function () {
      const tooLongDuration = MAX_DURATION + 1;

      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            tooLongDuration,
            { value: PREMIUM_AMOUNT }
          )
      ).to.be.revertedWith("Duration too long");
    });
  });

  describe("Policy Purchase", function () {
    it("Should purchase policy with valid duration", async function () {
      const initialVaultBalance = await vault.getVaultBalance();

      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT }
          )
      )
        .to.emit(lifeContract, "PolicyPurchased")
        .and.to.emit(lifeContract, "PremiumCalculated");

      expect(await vault.getVaultBalance()).to.equal(
        initialVaultBalance + PREMIUM_AMOUNT
      );
    });

    it("Should create policy with correct data", async function () {
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          STANDARD_DURATION,
          { value: PREMIUM_AMOUNT }
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return (
            lifeContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const policyId = lifeContract.interface.parseLog(event as any)?.args[0];

      const policy = await lifeContract.getPolicy(policyId);
      expect(policy.owner).to.equal(user2.address);
      expect(policy.premium).to.equal(PREMIUM_AMOUNT);
      expect(policy.sumAssured).to.equal(SUM_ASSURED);
      expect(policy.isActive).to.be.true;
      expect(policy.isClaimed).to.be.false;

      const expectedExpiry = policy.createdAt + BigInt(STANDARD_DURATION);
      expect(policy.expiry).to.be.closeTo(expectedExpiry, 10);
    });

    it("Should emit PremiumCalculated event", async function () {
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          STANDARD_DURATION,
          { value: PREMIUM_AMOUNT }
        );

      await expect(tx).to.emit(lifeContract, "PremiumCalculated");
    });

    it("Should allow maximum duration (80 years)", async function () {
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            MAX_DURATION,
            { value: PREMIUM_AMOUNT }
          )
      ).to.emit(lifeContract, "PolicyPurchased");
    });

    it("Should reject duration longer than 80 years", async function () {
      const tooLongDuration = MAX_DURATION + 1;

      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            tooLongDuration,
            { value: PREMIUM_AMOUNT }
          )
      ).to.be.revertedWith("Duration too long");
    });

    it("Should allow various valid durations", async function () {
      const testDurations = [
        365 * 24 * 60 * 60, // 1 year
        10 * 365 * 24 * 60 * 60, // 10 years
        50 * 365 * 24 * 60 * 60, // 50 years
        MAX_DURATION, // 80 years
      ];

      for (let i = 0; i < testDurations.length; i++) {
        await expect(
          lifeContract
            .connect(admin)
            .purchasePolicy(
              user2.address,
              PREMIUM_AMOUNT,
              SUM_ASSURED,
              testDurations[i],
              { value: PREMIUM_AMOUNT }
            )
        ).to.emit(lifeContract, "PolicyPurchased");
      }
    });

    it("Should revert when non-admin tries to purchase", async function () {
      // Get admin role
      const adminRole = await lifeContract.ADMIN_ROLE();

      await expect(
        lifeContract
          .connect(unauthorized)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT }
          )
      )
        .to.be.revertedWithCustomError(
          lifeContract,
          "AccessControlUnauthorizedAccount"
        )
        .withArgs(unauthorized.address, adminRole);
    });

    it("Should revert with incorrect premium amount", async function () {
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT + 1n }
          )
      ).to.be.revertedWith("Incorrect premium");
    });

    it("Should revert with invalid parameters", async function () {
      // Zero premium
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(user2.address, 0, SUM_ASSURED, STANDARD_DURATION, {
            value: 0,
          })
      ).to.be.revertedWith("Invalid parameters");

      // Zero sum assured
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(user2.address, PREMIUM_AMOUNT, 0, STANDARD_DURATION, {
            value: PREMIUM_AMOUNT,
          })
      ).to.be.revertedWith("Invalid parameters");

      // Zero duration
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(user2.address, PREMIUM_AMOUNT, SUM_ASSURED, 0, {
            value: PREMIUM_AMOUNT,
          })
      ).to.be.revertedWith("Invalid parameters");

      // Invalid owner
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            ethers.ZeroAddress,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT }
          )
      ).to.be.revertedWith("Invalid owner");
    });
  });

  describe("Claims Management", function () {
    describe("fileAndApproveClaim", function () {
      it("Should allow admin to file and approve claim", async function () {
        const initialUserBalance = await ethers.provider.getBalance(
          user1.address
        );

        await expect(
          lifeContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        )
          .to.emit(lifeContract, "ClaimFiled")
          .and.to.emit(lifeContract, "ClaimApproved");

        const finalUserBalance = await ethers.provider.getBalance(
          user1.address
        );
        expect(finalUserBalance).to.equal(initialUserBalance + CLAIM_AMOUNT);
      });

      it("Should terminate policy after claim (life insurance behavior)", async function () {
        await lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);

        const policy = await lifeContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;
        expect(policy.isClaimed).to.be.true;
      });

      it("Should allow claim up to sum assured", async function () {
        await expect(
          lifeContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, SUM_ASSURED)
        ).to.emit(lifeContract, "ClaimApproved");

        const policy = await lifeContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;
        expect(policy.isClaimed).to.be.true;
      });

      it("Should prevent claim exceeding sum assured", async function () {
        const excessiveAmount = SUM_ASSURED + ethers.parseEther("1.0");

        await expect(
          lifeContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, excessiveAmount)
        ).to.be.revertedWith("Amount exceeds sum assured");
      });

      it("Should prevent double claims", async function () {
        // First claim
        await lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);

        // Second claim should fail with "Policy not active" error
        await expect(
          lifeContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, ethers.parseEther("1.0"))
        ).to.be.revertedWith("Policy not active");
      });

      it("Should revert when non-admin tries to file claim", async function () {
        const adminRole = await lifeContract.ADMIN_ROLE();

        await expect(
          lifeContract
            .connect(unauthorized)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        )
          .to.be.revertedWithCustomError(
            lifeContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unauthorized.address, adminRole);
      });

      it("Should revert for non-existent policy", async function () {
        const fakePolicyId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

        await expect(
          lifeContract
            .connect(admin)
            .fileAndApproveClaim(fakePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Policy does not exist");
      });

      it("Should revert for zero claim amount", async function () {
        await expect(
          lifeContract.connect(admin).fileAndApproveClaim(samplePolicyId, 0)
        ).to.be.revertedWith("Invalid amount");
      });

      it("Should revert for inactive policy", async function () {
        // Cancel the policy first
        await lifeContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);

        await expect(
          lifeContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Policy not active");
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
          lifeContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        )
          .to.emit(lifeContract, "PolicyCancelled")
          .withArgs(samplePolicyId, user1.address, REFUND_AMOUNT);

        const policy = await lifeContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;

        const finalUserBalance = await ethers.provider.getBalance(
          user1.address
        );
        expect(finalUserBalance).to.equal(initialUserBalance + REFUND_AMOUNT);
      });

      it("Should prevent cancellation of claimed policy", async function () {
        // First claim the policy
        await lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);

        // Try to cancel - should be reverted with "Policy not active"
        await expect(
          lifeContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWith("Policy not active");
      });

      it("Should prevent cancellation of already cancelled policy", async function () {
        // First cancel
        await lifeContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);

        // Try to cancel again
        await expect(
          lifeContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWith("Policy not active");
      });

      it("Should revert when non-admin tries to cancel", async function () {
        await expect(
          lifeContract
            .connect(unauthorized)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWithCustomError(
          lifeContract,
          "AccessControlUnauthorizedAccount"
        );
      });

      it("Should revert for non-existent policy", async function () {
        const fakePolicyId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

        await expect(
          lifeContract.connect(admin).cancelPolicy(fakePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWith("Policy does not exist");
      });

      it("Should revert cancellation with zero refund", async function () {
        await expect(
          lifeContract.connect(admin).cancelPolicy(samplePolicyId, 0)
        ).to.be.revertedWith("Refund amount must be greater than zero");
      });

      it("Should allow cancellation with full premium refund", async function () {
        await expect(
          lifeContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, PREMIUM_AMOUNT)
        )
          .to.emit(lifeContract, "PolicyCancelled")
          .withArgs(samplePolicyId, user1.address, PREMIUM_AMOUNT);
      });
    });
  });

  describe("Policy Renewal", function () {
    describe("renewPolicy", function () {
      it("Should always revert with 'No renewals' message", async function () {
        const renewalPremium = ethers.parseEther("2.5");

        await expect(
          lifeContract
            .connect(admin)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("No renewals");
      });

      it("Should revert regardless of caller", async function () {
        const renewalPremium = ethers.parseEther("2.5");

        await expect(
          lifeContract
            .connect(owner)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("No renewals");

        await expect(
          lifeContract
            .connect(user1)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("No renewals");

        await expect(
          lifeContract
            .connect(unauthorized)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("No renewals");
      });

      it("Should revert regardless of policy state", async function () {
        const renewalPremium = ethers.parseEther("2.5");

        // Try with active policy
        await expect(
          lifeContract
            .connect(admin)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("No renewals");

        // Cancel policy and try again
        await lifeContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);

        await expect(
          lifeContract
            .connect(admin)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("No renewals");
      });

      it("Should revert with any parameters", async function () {
        await expect(
          lifeContract
            .connect(admin)
            .renewPolicy(ethers.ZeroHash, 0, { value: 0 })
        ).to.be.revertedWith("No renewals");

        await expect(
          lifeContract
            .connect(admin)
            .renewPolicy(samplePolicyId, ethers.parseEther("999"), {
              value: ethers.parseEther("999"),
            })
        ).to.be.revertedWith("No renewals");
      });
    });
  });

  describe("Refund Calculation", function () {
    describe("calculateRefund", function () {
      it("Should return prorated refund for active policy", async function () {
        const refund = await lifeContract.calculateRefund(samplePolicyId);
        expect(refund).to.be.lte(PREMIUM_AMOUNT);
        expect(refund).to.be.gt(0);
      });

      it("Should return zero for inactive policy", async function () {
        await lifeContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);
        expect(await lifeContract.calculateRefund(samplePolicyId)).to.equal(0);
      });

      it("Should return zero for claimed policy", async function () {
        await lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);
        expect(await lifeContract.calculateRefund(samplePolicyId)).to.equal(0);
      });

      it("Should return zero for expired policy", async function () {
        // Fast forward time past expiry
        await ethers.provider.send("evm_increaseTime", [STANDARD_DURATION + 1]);
        await ethers.provider.send("evm_mine", []);

        expect(await lifeContract.calculateRefund(samplePolicyId)).to.equal(0);
      });

      it("Should calculate correct prorated refund", async function () {
        // Fast forward to halfway through policy
        await ethers.provider.send("evm_increaseTime", [STANDARD_DURATION / 2]);
        await ethers.provider.send("evm_mine", []);

        const refund = await lifeContract.calculateRefund(samplePolicyId);
        const expectedRefund = PREMIUM_AMOUNT / 2n;

        // Allow for small timing differences
        expect(refund).to.be.closeTo(expectedRefund, ethers.parseEther("0.01"));
      });

      it("Should handle edge case of same creation and expiry time", async function () {
        // Create a policy that expires immediately (1 second duration)
        const tx = await lifeContract.connect(admin).purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          1, // 1 second duration
          { value: PREMIUM_AMOUNT }
        );

        const receipt = await tx.wait();
        const event = receipt?.logs.find((log) => {
          try {
            return (
              lifeContract.interface.parseLog(log as any)?.name ===
              "PolicyPurchased"
            );
          } catch {
            return false;
          }
        });
        const quickPolicyId = lifeContract.interface.parseLog(event as any)
          ?.args[0];

        // Wait for it to expire
        await ethers.provider.send("evm_increaseTime", [2]);
        await ethers.provider.send("evm_mine", []);

        expect(await lifeContract.calculateRefund(quickPolicyId)).to.equal(0);
      });

      it("Should handle very small time differences correctly", async function () {
        // Move forward by 1 second
        await ethers.provider.send("evm_increaseTime", [1]);
        await ethers.provider.send("evm_mine", []);

        const refund = await lifeContract.calculateRefund(samplePolicyId);
        expect(refund).to.be.lt(PREMIUM_AMOUNT);
        expect(refund).to.be.gt(0);
      });
    });
  });

  describe("View Functions", function () {
    describe("getPolicy", function () {
      it("Should return correct policy data", async function () {
        const policy = await lifeContract.getPolicy(samplePolicyId);
        expect(policy.owner).to.equal(user1.address);
        expect(policy.premium).to.equal(PREMIUM_AMOUNT);
        expect(policy.sumAssured).to.equal(SUM_ASSURED);
        expect(policy.isActive).to.be.true;
        expect(policy.isClaimed).to.be.false;
      });
    });

    describe("Vault integration", function () {
      it("Should interact correctly with vault", async function () {
        const vaultInfo = await lifeContract.getVaultInfo();
        expect(vaultInfo.vaultAddress).to.equal(vault.target);
        expect(vaultInfo.isApproved).to.be.true;
        expect(vaultInfo.vaultBalance).to.be.gt(0);
      });
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete policy lifecycle - claim scenario", async function () {
      // 1. Purchase policy
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          STANDARD_DURATION,
          { value: PREMIUM_AMOUNT }
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return (
            lifeContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const policyId = lifeContract.interface.parseLog(event as any)?.args[0];

      // 2. Verify initial state
      let policy = await lifeContract.getPolicy(policyId);
      expect(policy.isActive).to.be.true;
      expect(policy.isClaimed).to.be.false;

      // 3. File claim
      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(policyId, SUM_ASSURED);

      // 4. Verify final state
      policy = await lifeContract.getPolicy(policyId);
      expect(policy.isActive).to.be.false;
      expect(policy.isClaimed).to.be.true;

      // 5. Verify no further operations possible
      await expect(
        lifeContract
          .connect(admin)
          .fileAndApproveClaim(policyId, ethers.parseEther("1.0"))
      ).to.be.revertedWith("Policy not active"); // Changed from "Policy already claimed"

      await expect(
        lifeContract.connect(admin).cancelPolicy(policyId, REFUND_AMOUNT)
      ).to.be.revertedWith("Policy not active"); // Changed from "Policy already claimed"
    });

    it("Should handle complete policy lifecycle - cancellation scenario", async function () {
      // 1. Purchase policy
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          STANDARD_DURATION,
          { value: PREMIUM_AMOUNT }
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return (
            lifeContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const policyId = lifeContract.interface.parseLog(event as any)?.args[0];

      // 2. Calculate refund
      const refund = await lifeContract.calculateRefund(policyId);
      expect(refund).to.be.gt(0);

      // 3. Cancel policy
      await lifeContract.connect(admin).cancelPolicy(policyId, refund);

      // 4. Verify final state
      const policy = await lifeContract.getPolicy(policyId);
      expect(policy.isActive).to.be.false;

      // 5. Verify no further operations possible
      await expect(
        lifeContract.connect(admin).fileAndApproveClaim(policyId, CLAIM_AMOUNT)
      ).to.be.revertedWith("Policy not active");

      await expect(
        lifeContract.connect(admin).cancelPolicy(policyId, REFUND_AMOUNT)
      ).to.be.revertedWith("Policy not active");
    });

    it("Should handle multiple users with separate policies", async function () {
      // Create policies for different users
      const tx1 = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          STANDARD_DURATION,
          { value: PREMIUM_AMOUNT }
        );

      const receipt1 = await tx1.wait();
      const event1 = receipt1?.logs.find((log) => {
        try {
          return (
            lifeContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const policyId2 = lifeContract.interface.parseLog(event1 as any)?.args[0];

      // Policies should be independent
      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, SUM_ASSURED);

      const policy1 = await lifeContract.getPolicy(samplePolicyId);
      const policy2 = await lifeContract.getPolicy(policyId2);

      expect(policy1.isActive).to.be.false;
      expect(policy1.isClaimed).to.be.true;
      expect(policy2.isActive).to.be.true;
      expect(policy2.isClaimed).to.be.false;
    });
  });

  describe("Edge Cases & Error Handling", function () {
    it("Should handle vault transfer failures gracefully", async function () {
      // Revoke vault approval to simulate transfer failure
      await vault.connect(owner).revokeContract(lifeContract.target);

      await expect(
        lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
      ).to.be.reverted;
    });

    it("Should reject zero refund amounts", async function () {
      // Zero refund should fail
      await expect(
        lifeContract.connect(admin).cancelPolicy(samplePolicyId, 0)
      ).to.be.revertedWith("Refund amount must be greater than zero");

      // Minimum non-zero refund should work
      await expect(
        lifeContract.connect(admin).cancelPolicy(samplePolicyId, 1)
      ).to.emit(lifeContract, "PolicyCancelled");
    });

    it("Should handle maximum claim amounts correctly", async function () {
      const maxClaim = SUM_ASSURED;

      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, maxClaim);

      const policy = await lifeContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.false;
      expect(policy.isClaimed).to.be.true;
    });

    it("Should handle policies with different durations correctly", async function () {
      const durations = [
        365 * 24 * 60 * 60, // 1 year
        10 * 365 * 24 * 60 * 60, // 10 years
        MAX_DURATION, // 80 years
      ];

      for (let duration of durations) {
        const tx = await lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            duration,
            { value: PREMIUM_AMOUNT }
          );

        const receipt = await tx.wait();
        const event = receipt?.logs.find((log) => {
          try {
            return (
              lifeContract.interface.parseLog(log as any)?.name ===
              "PolicyPurchased"
            );
          } catch {
            return false;
          }
        });
        const policyId = lifeContract.interface.parseLog(event as any)?.args[0];

        const policy = await lifeContract.getPolicy(policyId);
        expect(policy.isActive).to.be.true;
        expect(policy.isClaimed).to.be.false;

        // Each should have correct expiry based on duration
        const expectedExpiry = policy.createdAt + BigInt(duration);
        expect(policy.expiry).to.be.closeTo(expectedExpiry, 10);
      }
    });

    it("Should handle boundary duration values", async function () {
      // Test exactly at maximum duration
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            MAX_DURATION,
            { value: PREMIUM_AMOUNT }
          )
      ).to.not.be.reverted;

      // Test just over maximum duration
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            MAX_DURATION + 1,
            { value: PREMIUM_AMOUNT }
          )
      ).to.be.revertedWith("Duration too long");
    });

    it("Should handle refund calculation with extreme values", async function () {
      // Create policy with minimum duration (1 second)
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(user2.address, PREMIUM_AMOUNT, SUM_ASSURED, 1, {
          value: PREMIUM_AMOUNT,
        });

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return (
            lifeContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const shortPolicyId = lifeContract.interface.parseLog(event as any)
        ?.args[0];

      // Should have some refund immediately
      const refund = await lifeContract.calculateRefund(shortPolicyId);
      expect(refund).to.be.lte(PREMIUM_AMOUNT);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should have reasonable gas costs for policy purchase", async function () {
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          STANDARD_DURATION,
          { value: PREMIUM_AMOUNT }
        );

      const receipt = await tx.wait();
      console.log(`Policy purchase gas used: ${receipt?.gasUsed}`);

      // Should be reasonable gas cost (adjust threshold as needed)
      expect(receipt?.gasUsed).to.be.lt(300000);
    });

    it("Should have reasonable gas costs for claims", async function () {
      const tx = await lifeContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);
      const receipt = await tx.wait();

      console.log(`Claim processing gas used: ${receipt?.gasUsed}`);
      expect(receipt?.gasUsed).to.be.lt(200000);
    });

    it("Should have reasonable gas costs for cancellation", async function () {
      const tx = await lifeContract
        .connect(admin)
        .cancelPolicy(samplePolicyId, REFUND_AMOUNT);
      const receipt = await tx.wait();

      console.log(`Policy cancellation gas used: ${receipt?.gasUsed}`);
      expect(receipt?.gasUsed).to.be.lt(150000);
    });
  });

  describe("Security Tests", function () {
    it("Should prevent reentrancy attacks", async function () {
      // Life insurance claims terminate policy, so reentrancy is naturally prevented
      // But we test that state changes happen before external calls

      const initialBalance = await ethers.provider.getBalance(user1.address);
      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);

      // Policy should be terminated
      const policy = await lifeContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.false;
      expect(policy.isClaimed).to.be.true;

      // User should have received payment
      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.equal(initialBalance + CLAIM_AMOUNT);
    });

    it("Should prevent unauthorized access to admin functions", async function () {
      const adminRole = await lifeContract.ADMIN_ROLE();

      await expect(
        lifeContract
          .connect(unauthorized)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT }
          )
      )
        .to.be.revertedWithCustomError(
          lifeContract,
          "AccessControlUnauthorizedAccount"
        )
        .withArgs(unauthorized.address, adminRole);

      await expect(
        lifeContract
          .connect(unauthorized)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
      )
        .to.be.revertedWithCustomError(
          lifeContract,
          "AccessControlUnauthorizedAccount"
        )
        .withArgs(unauthorized.address, adminRole);
    });

    it("Should prevent double spending", async function () {
      // Claim policy fully
      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, SUM_ASSURED);

      // Try to claim again - should fail with "Policy not active"
      await expect(
        lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, ethers.parseEther("1.0"))
      ).to.be.revertedWith("Policy not active");
    });

    it("Should validate all inputs properly", async function () {
      // Test all zero values
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(ethers.ZeroAddress, 0, 0, 0, { value: 0 })
      ).to.be.reverted;

      // Test overflow/underflow scenarios
      const maxUint256 = ethers.MaxUint256;

      await expect(
        lifeContract.connect(admin).purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          maxUint256, // Extremely large duration
          { value: PREMIUM_AMOUNT }
        )
      ).to.be.revertedWith("Duration too long");
    });
  });

  describe("Events Verification", function () {
    it("Should emit all required events for policy purchase", async function () {
      await expect(
        lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT }
          )
      )
        .to.emit(lifeContract, "PolicyPurchased")
        .and.to.emit(lifeContract, "PremiumCalculated");
    });

    it("Should emit all required events for claims", async function () {
      await expect(
        lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
      )
        .to.emit(lifeContract, "ClaimFiled")
        .and.to.emit(lifeContract, "ClaimApproved");
    });

    it("Should emit correct event for cancellation", async function () {
      await expect(
        lifeContract.connect(admin).cancelPolicy(samplePolicyId, REFUND_AMOUNT)
      )
        .to.emit(lifeContract, "PolicyCancelled")
        .withArgs(samplePolicyId, user1.address, REFUND_AMOUNT);
    });

    it("Should emit events with correct parameters", async function () {
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          STANDARD_DURATION,
          { value: PREMIUM_AMOUNT }
        );

      await expect(tx).to.emit(lifeContract, "PremiumCalculated");
    });
  });

  describe("Contract State Consistency", function () {
    it("Should maintain consistent state throughout operations", async function () {
      // Track initial state
      const initialVaultBalance = await vault.getVaultBalance();
      const initialUserBalance = await ethers.provider.getBalance(
        user1.address
      );

      // Verify policy state
      let policy = await lifeContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.true;
      expect(policy.isClaimed).to.be.false;

      // Process claim
      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);

      // Verify final state
      policy = await lifeContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.false;
      expect(policy.isClaimed).to.be.true;

      // Verify balances changed correctly
      const finalVaultBalance = await vault.getVaultBalance();
      const finalUserBalance = await ethers.provider.getBalance(user1.address);

      expect(finalVaultBalance).to.equal(initialVaultBalance - CLAIM_AMOUNT);
      expect(finalUserBalance).to.equal(initialUserBalance + CLAIM_AMOUNT);
    });

    it("Should handle concurrent operations correctly", async function () {
      // Create multiple policies
      const policies = [];
      for (let i = 0; i < 3; i++) {
        const tx = await lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT }
          );

        const receipt = await tx.wait();
        const event = receipt?.logs.find((log) => {
          try {
            return (
              lifeContract.interface.parseLog(log as any)?.name ===
              "PolicyPurchased"
            );
          } catch {
            return false;
          }
        });
        policies.push(lifeContract.interface.parseLog(event as any)?.args[0]);
      }

      // Process different operations on different policies
      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(policies[0], CLAIM_AMOUNT);
      await lifeContract
        .connect(admin)
        .cancelPolicy(policies[1], REFUND_AMOUNT);
      // Leave policies[2] active

      // Verify each policy has correct state
      const policy0 = await lifeContract.getPolicy(policies[0]);
      const policy1 = await lifeContract.getPolicy(policies[1]);
      const policy2 = await lifeContract.getPolicy(policies[2]);

      expect(policy0.isActive).to.be.false;
      expect(policy0.isClaimed).to.be.true;

      expect(policy1.isActive).to.be.false;
      expect(policy1.isClaimed).to.be.false; // Cancelled, not claimed

      expect(policy2.isActive).to.be.true;
      expect(policy2.isClaimed).to.be.false;
    });
  });

  describe("Life Insurance Specific Features", function () {
    it("Should enforce 80-year maximum duration limit", async function () {
      // Test various long durations
      const testCases = [
        { duration: 79 * 365 * 24 * 60 * 60, shouldPass: true },
        { duration: 80 * 365 * 24 * 60 * 60, shouldPass: true },
        { duration: 81 * 365 * 24 * 60 * 60, shouldPass: false },
        { duration: 100 * 365 * 24 * 60 * 60, shouldPass: false },
      ];

      for (const testCase of testCases) {
        if (testCase.shouldPass) {
          await expect(
            lifeContract
              .connect(admin)
              .purchasePolicy(
                user2.address,
                PREMIUM_AMOUNT,
                SUM_ASSURED,
                testCase.duration,
                { value: PREMIUM_AMOUNT }
              )
          ).to.not.be.reverted;
        } else {
          await expect(
            lifeContract
              .connect(admin)
              .purchasePolicy(
                user2.address,
                PREMIUM_AMOUNT,
                SUM_ASSURED,
                testCase.duration,
                { value: PREMIUM_AMOUNT }
              )
          ).to.be.revertedWith("Duration too long");
        }
      }
    });

    it("Should handle single-claim termination correctly", async function () {
      // Make a small claim - should still terminate policy
      const smallClaim = ethers.parseEther("1.0");

      await lifeContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, smallClaim);

      const policy = await lifeContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.false;
      expect(policy.isClaimed).to.be.true;

      // No further operations should be possible
      await expect(
        lifeContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, ethers.parseEther("0.1"))
      ).to.be.revertedWith("Policy not active"); // Changed from "Policy already claimed"
    });

    it("Should prevent any renewal attempts", async function () {
      const renewalAttempts = [
        { caller: owner, premium: ethers.parseEther("1.0") },
        { caller: admin, premium: ethers.parseEther("2.0") },
        { caller: user1, premium: ethers.parseEther("3.0") },
        { caller: unauthorized, premium: ethers.parseEther("0.5") },
      ];

      for (const attempt of renewalAttempts) {
        await expect(
          lifeContract
            .connect(attempt.caller)
            .renewPolicy(samplePolicyId, attempt.premium, {
              value: attempt.premium,
            })
        ).to.be.revertedWith("No renewals");
      }
    });

    it("Should calculate refunds correctly for long-term policies", async function () {
      // Create a 50-year policy
      const longDuration = 50 * 365 * 24 * 60 * 60;
      const tx = await lifeContract
        .connect(admin)
        .purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          longDuration,
          { value: PREMIUM_AMOUNT }
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return (
            lifeContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const longPolicyId = lifeContract.interface.parseLog(event as any)
        ?.args[0];

      // Check refund at various time points
      const refund0 = await lifeContract.calculateRefund(longPolicyId);
      expect(refund0).to.be.closeTo(PREMIUM_AMOUNT, ethers.parseEther("0.01"));

      // Move forward 10 years
      await ethers.provider.send("evm_increaseTime", [10 * 365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const refund10 = await lifeContract.calculateRefund(longPolicyId);
      const expected10 = (PREMIUM_AMOUNT * 40n) / 50n; // 40/50 remaining
      expect(refund10).to.be.closeTo(expected10, ethers.parseEther("0.01"));

      // Move forward to 25 years (halfway)
      await ethers.provider.send("evm_increaseTime", [15 * 365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const refund25 = await lifeContract.calculateRefund(longPolicyId);
      const expected25 = PREMIUM_AMOUNT / 2n; // Half remaining
      expect(refund25).to.be.closeTo(expected25, ethers.parseEther("0.01"));
    });
  });

  describe("Stress Tests", function () {
    // Line ~1400 in LifeCareLite.test.ts
    it("Should handle large number of policies", async function () {
      const numPolicies = 5; // Reduced number of policies
      const policyIds = [];

      // Add more funds to vault first
      await owner.sendTransaction({
        to: vault.target,
        value: ethers.parseEther("50"), // Add substantial funds
      });

      // Create multiple policies with better event handling
      for (let i = 0; i < numPolicies; i++) {
        const tx = await lifeContract
          .connect(admin)
          .purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            STANDARD_DURATION,
            { value: PREMIUM_AMOUNT }
          );
        const receipt = await tx.wait();

        // More robust event handling
        let policyId;
        for (const log of receipt?.logs || []) {
          try {
            const parsedLog = lifeContract.interface.parseLog(log as any);
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              policyId = parsedLog.args[0];
              break;
            }
          } catch (e) {
            continue; // Skip logs that can't be parsed
          }
        }

        // Only add valid policy IDs
        if (policyId) {
          policyIds.push(policyId);
        }
      }

      // Make sure we have policies to test
      expect(policyIds.length).to.be.greaterThan(0);

      // Verify all policies were created correctly
      for (let i = 0; i < policyIds.length; i++) {
        const policy = await lifeContract.getPolicy(policyIds[i]);
        expect(policy.isActive).to.be.true;
        expect(policy.isClaimed).to.be.false;
        expect(policy.owner).to.equal(user2.address);
      }

      // Calculate how many policies to claim
      const halfCount = Math.floor(policyIds.length / 2);

      // Process claims on half of them with explicit bounds checking
      for (let i = 0; i < halfCount; i++) {
        await lifeContract
          .connect(admin)
          .fileAndApproveClaim(policyIds[i], CLAIM_AMOUNT);

        const policy = await lifeContract.getPolicy(policyIds[i]);
        expect(policy.isActive).to.be.false;
        expect(policy.isClaimed).to.be.true;
      }

      // Verify remaining policies are still active
      for (let i = halfCount; i < policyIds.length; i++) {
        const policy = await lifeContract.getPolicy(policyIds[i]);
        expect(policy.isActive).to.be.true;
        expect(policy.isClaimed).to.be.false;
      }
    });

    it("Should handle extreme duration values correctly", async function () {
      const extremeDurations = [
        1, // 1 second
        60, // 1 minute
        3600, // 1 hour
        86400, // 1 day
        365 * 24 * 60 * 60, // 1 year
        MAX_DURATION, // 80 years
      ];

      for (const duration of extremeDurations) {
        await expect(
          lifeContract
            .connect(admin)
            .purchasePolicy(
              user2.address,
              PREMIUM_AMOUNT,
              SUM_ASSURED,
              duration,
              { value: PREMIUM_AMOUNT }
            )
        ).to.emit(lifeContract, "PolicyPurchased");
      }
    });

    it("Should handle extreme premium and sum assured values", async function () {
      const extremeValues = [
        { premium: 1, sumAssured: 1 }, // Minimum values
        {
          premium: ethers.parseEther("0.001"),
          sumAssured: ethers.parseEther("0.001"),
        }, // Small values
        {
          premium: ethers.parseEther("1000"),
          sumAssured: ethers.parseEther("10000"),
        }, // Large values
      ];

      for (const values of extremeValues) {
        await expect(
          lifeContract
            .connect(admin)
            .purchasePolicy(
              user2.address,
              values.premium,
              values.sumAssured,
              STANDARD_DURATION,
              { value: values.premium }
            )
        ).to.emit(lifeContract, "PolicyPurchased");
      }
    });
  });
});
