import { expect } from "chai";
import { ethers } from "hardhat";
import {
  HealthCareLite,
  InsuranceVault,
  PolicyBaseMock,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("HealthCareLite - Comprehensive Unit Tests", function () {
  let vault: InsuranceVault;
  let healthContract: HealthCareLite;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const VAULT_INITIAL_BALANCE = ethers.parseEther("10.0");
  const PREMIUM_AMOUNT = ethers.parseEther("1.0");
  const SUM_ASSURED = ethers.parseEther("10.0");
  const DURATION = 365 * 24 * 60 * 60; // 365 days in seconds
  const CLAIM_AMOUNT = ethers.parseEther("3.0");
  const PARTIAL_CLAIM = ethers.parseEther("2.0");
  const REFUND_AMOUNT = ethers.parseEther("0.5");

  let samplePolicyId: string;
  let adminRole: string;

  beforeEach(async function () {
    [owner, admin, user1, user2, unauthorized] = await ethers.getSigners();

    // Deploy InsuranceVault
    const VaultFactory = await ethers.getContractFactory("InsuranceVault");
    vault = await VaultFactory.deploy(owner.address);

    // Deploy HealthCareLite
    const HealthFactory = await ethers.getContractFactory("HealthCareLite");
    healthContract = await HealthFactory.deploy(vault.target);

    // Fund the vault
    await owner.sendTransaction({
      to: vault.target,
      value: VAULT_INITIAL_BALANCE,
    });

    // Approve health contract in vault
    await vault.connect(owner).approveContract(healthContract.target);

    // Grant admin role
    adminRole = await healthContract.ADMIN_ROLE();
    await healthContract.connect(owner).grantRole(adminRole, admin.address);

    // Create a sample policy for testing
    const tx = await healthContract.connect(admin).purchasePolicy(
      user1.address,
      PREMIUM_AMOUNT,
      SUM_ASSURED,
      DURATION, // This will be ignored, always 365 days
      { value: PREMIUM_AMOUNT }
    );
    const receipt = await tx.wait();
    const event = receipt?.logs.find((log) => {
      try {
        return (
          healthContract.interface.parseLog(log as any)?.name ===
          "PolicyPurchased"
        );
      } catch {
        return false;
      }
    });
    samplePolicyId = healthContract.interface.parseLog(event as any)?.args[0];
  });

  describe("Deployment & Initialization", function () {
    it("Should deploy with correct vault address", async function () {
      expect(await healthContract.vault()).to.equal(vault.target);
    });

    it("Should set deployer as default admin", async function () {
      const defaultAdminRole = await healthContract.DEFAULT_ADMIN_ROLE();
      expect(await healthContract.hasRole(defaultAdminRole, owner.address)).to
        .be.true;
    });

    it("Should inherit from PolicyBase correctly", async function () {
      expect(await healthContract.ADMIN_ROLE()).to.not.be.undefined;
    });
  });

  describe("Policy Purchase", function () {
    describe("purchasePolicy", function () {
      it("Should purchase policy with fixed 365-day duration", async function () {
        const initialVaultBalance = await vault.getVaultBalance();

        await expect(
          healthContract.connect(admin).purchasePolicy(
            user2.address,
            PREMIUM_AMOUNT,
            SUM_ASSURED,
            999999999, // Any duration - should be ignored
            { value: PREMIUM_AMOUNT }
          )
        )
          .to.emit(healthContract, "PolicyPurchased")
          .and.to.emit(healthContract, "PremiumCalculated");

        expect(await vault.getVaultBalance()).to.equal(
          initialVaultBalance + PREMIUM_AMOUNT
        );
      });

      it("Should create policy with correct fixed duration", async function () {
        const tx = await healthContract.connect(admin).purchasePolicy(
          user2.address,
          PREMIUM_AMOUNT,
          SUM_ASSURED,
          999, // This should be ignored
          { value: PREMIUM_AMOUNT }
        );

        const receipt = await tx.wait();
        const event = receipt?.logs.find((log) => {
          try {
            return (
              healthContract.interface.parseLog(log as any)?.name ===
              "PolicyPurchased"
            );
          } catch {
            return false;
          }
        });
        const policyId = healthContract.interface.parseLog(event as any)
          ?.args[0];

        const policy = await healthContract.getPolicy(policyId);
        const expectedExpiry = policy.createdAt + BigInt(DURATION);

        expect(policy.expiry).to.be.closeTo(expectedExpiry, 10); // Allow 10 second variance
      });

      it("Should emit PremiumCalculated event", async function () {
        // The current test expects ZeroHash but the contract emits an actual hash
        await expect(
          healthContract
            .connect(admin)
            .purchasePolicy(
              user2.address,
              PREMIUM_AMOUNT,
              SUM_ASSURED,
              DURATION,
              { value: PREMIUM_AMOUNT }
            )
        )
          .to.emit(healthContract, "PremiumCalculated")
          .withArgs(
            // Don't check exact policy ID since we can't know it ahead of time
            anyValue,
            user2.address,
            PREMIUM_AMOUNT
          );
      });

      it("Should initialize claim amounts to zero", async function () {
        const tx = await healthContract
          .connect(admin)
          .purchasePolicy(
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
              healthContract.interface.parseLog(log as any)?.name ===
              "PolicyPurchased"
            );
          } catch {
            return false;
          }
        });
        const policyId = healthContract.interface.parseLog(event as any)
          ?.args[0];

        expect(await healthContract.getTotalClaimed(policyId)).to.equal(0);
        expect(await healthContract.getRemainingCoverage(policyId)).to.equal(
          SUM_ASSURED
        );
      });

      it("Should revert when non-admin tries to purchase", async function () {
        // Fix to expect the AccessControlUnauthorizedAccount error
        const adminRole = await healthContract.ADMIN_ROLE();

        await expect(
          healthContract
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
            healthContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unauthorized.address, adminRole);
      });

      it("Should revert with incorrect premium amount", async function () {
        await expect(
          healthContract
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

      it("Should revert with invalid parameters", async function () {
        // Zero premium
        await expect(
          healthContract
            .connect(admin)
            .purchasePolicy(user2.address, 0, SUM_ASSURED, DURATION, {
              value: 0,
            })
        ).to.be.revertedWith("Invalid parameters");

        // Zero sum assured
        await expect(
          healthContract
            .connect(admin)
            .purchasePolicy(user2.address, PREMIUM_AMOUNT, 0, DURATION, {
              value: PREMIUM_AMOUNT,
            })
        ).to.be.revertedWith("Invalid parameters");

        // Invalid owner
        await expect(
          healthContract
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
    });
  });

  describe("Claims Management", function () {
    describe("fileAndApproveClaim", function () {
      it("Should allow admin to file and approve claim", async function () {
        const initialUserBalance = await ethers.provider.getBalance(
          user1.address
        );
        const initialClaimed = await healthContract.getTotalClaimed(
          samplePolicyId
        );

        await expect(
          healthContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        )
          .to.emit(healthContract, "ClaimFiled")
          .and.to.emit(healthContract, "ClaimApproved");

        const finalUserBalance = await ethers.provider.getBalance(
          user1.address
        );
        expect(finalUserBalance).to.equal(initialUserBalance + CLAIM_AMOUNT);

        const finalClaimed = await healthContract.getTotalClaimed(
          samplePolicyId
        );
        expect(finalClaimed).to.equal(initialClaimed + CLAIM_AMOUNT);
      });

      it("Should keep policy active for partial claims", async function () {
        // Claim less than sum assured
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, PARTIAL_CLAIM);

        const policy = await healthContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.true;
        expect(policy.isClaimed).to.be.false;

        const remaining = await healthContract.getRemainingCoverage(
          samplePolicyId
        );
        expect(remaining).to.equal(SUM_ASSURED - PARTIAL_CLAIM);
      });

      it("Should terminate policy when fully claimed", async function () {
        // Claim the full sum assured
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, SUM_ASSURED);

        const policy = await healthContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;
        expect(policy.isClaimed).to.be.true;

        const remaining = await healthContract.getRemainingCoverage(
          samplePolicyId
        );
        expect(remaining).to.equal(0);
      });

      it("Should handle multiple partial claims", async function () {
        const claim1 = ethers.parseEther("2.0");
        const claim2 = ethers.parseEther("3.0");
        const claim3 = ethers.parseEther("5.0");

        // First claim
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, claim1);
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          claim1
        );
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(SUM_ASSURED - claim1);

        // Second claim
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, claim2);
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          claim1 + claim2
        );
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(SUM_ASSURED - claim1 - claim2);

        // Third claim - should complete the policy
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, claim3);
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          SUM_ASSURED
        );
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(0);

        const policy = await healthContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;
        expect(policy.isClaimed).to.be.true;
      });

      it("Should revert when claim exceeds remaining coverage", async function () {
        const excessiveAmount = SUM_ASSURED + ethers.parseEther("1.0");

        await expect(
          healthContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, excessiveAmount)
        ).to.be.revertedWith("Exceeds coverage");
      });

      it("Should revert when claiming after policy termination", async function () {
        // First, fully claim the policy
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, SUM_ASSURED);

        // Try to claim again - expect "Exceeds coverage" error
        await expect(
          healthContract
            .connect(admin)
            .fileAndApproveClaim(samplePolicyId, ethers.parseEther("1.0"))
        ).to.be.revertedWith("Exceeds coverage");
      });

      it("Should revert when non-admin tries to file claim", async function () {
        await expect(
          healthContract
            .connect(unauthorized)
            .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Not authorized");
      });

      it("Should revert for non-existent policy", async function () {
        const fakePolicyId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

        await expect(
          healthContract
            .connect(admin)
            .fileAndApproveClaim(fakePolicyId, CLAIM_AMOUNT)
        ).to.be.revertedWith("Policy does not exist");
      });

      it("Should revert for zero claim amount", async function () {
        await expect(
          healthContract.connect(admin).fileAndApproveClaim(samplePolicyId, 0)
        ).to.be.revertedWith("Invalid amount");
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
          healthContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        )
          .to.emit(healthContract, "PolicyCancelled")
          .withArgs(samplePolicyId, user1.address, REFUND_AMOUNT);

        const policy = await healthContract.getPolicy(samplePolicyId);
        expect(policy.isActive).to.be.false;

        const finalUserBalance = await ethers.provider.getBalance(
          user1.address
        );
        expect(finalUserBalance).to.equal(initialUserBalance + REFUND_AMOUNT);
      });

      it("Should revert when non-admin tries to cancel", async function () {
        await expect(
          healthContract
            .connect(unauthorized)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWithCustomError(
          healthContract,
          "AccessControlUnauthorizedAccount"
        );
      });

      it("Should revert for inactive policy", async function () {
        // First cancel the policy
        await healthContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);

        // Try to cancel again
        await expect(
          healthContract
            .connect(admin)
            .cancelPolicy(samplePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWith("Policy not active");
      });

      it("Should revert for non-existent policy", async function () {
        const fakePolicyId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

        await expect(
          healthContract
            .connect(admin)
            .cancelPolicy(fakePolicyId, REFUND_AMOUNT)
        ).to.be.revertedWith("Policy does not exist");
      });
    });
  });

  describe("Policy Renewal", function () {
    describe("renewPolicy", function () {
      it("Should allow admin to renew policy", async function () {
        const renewalPremium = ethers.parseEther("1.2");
        const originalExpiry = (await healthContract.getPolicy(samplePolicyId))
          .expiry;

        await expect(
          healthContract
            .connect(admin)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        )
          .to.emit(healthContract, "PolicyRenewed")
          .withArgs(samplePolicyId, user1.address, renewalPremium, anyValue);

        const policy = await healthContract.getPolicy(samplePolicyId);
        expect(policy.premium).to.equal(renewalPremium);
        expect(policy.expiry).to.be.gt(originalExpiry);
        expect(policy.isClaimed).to.be.false;

        // Claim amounts should be reset
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          0
        );
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(SUM_ASSURED);
      });

      it("Should reset claim amounts on renewal", async function () {
        // Make a partial claim first
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, PARTIAL_CLAIM);
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          PARTIAL_CLAIM
        );

        // Renew the policy
        const renewalPremium = ethers.parseEther("1.1");
        await healthContract
          .connect(admin)
          .renewPolicy(samplePolicyId, renewalPremium, {
            value: renewalPremium,
          });

        // Claim amounts should be reset
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          0
        );
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(SUM_ASSURED);
      });

      it("Should extend expiry by exactly 365 days", async function () {
        const renewalPremium = ethers.parseEther("1.3");
        const preRenewalPolicy = await healthContract.getPolicy(samplePolicyId);

        const tx = await healthContract
          .connect(admin)
          .renewPolicy(samplePolicyId, renewalPremium, {
            value: renewalPremium,
          });
        const receipt = await tx.wait();
        const blockTimestamp = (await ethers.provider.getBlock(
          receipt!.blockNumber
        ))!.timestamp;

        const postRenewalPolicy = await healthContract.getPolicy(
          samplePolicyId
        );
        const expectedExpiry = BigInt(blockTimestamp) + BigInt(DURATION);

        expect(postRenewalPolicy.expiry).to.be.closeTo(expectedExpiry, 5);
      });

      it("Should revert when non-admin tries to renew", async function () {
        const renewalPremium = ethers.parseEther("1.0");

        await expect(
          healthContract
            .connect(unauthorized)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("Not authorized");
      });

      it("Should revert with incorrect premium amount", async function () {
        const renewalPremium = ethers.parseEther("1.0");

        await expect(
          healthContract
            .connect(admin)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium + 1n,
            })
        ).to.be.revertedWith("Wrong premium");
      });

      it("Should revert for inactive policy", async function () {
        // Cancel the policy first
        await healthContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);

        const renewalPremium = ethers.parseEther("1.0");
        await expect(
          healthContract
            .connect(admin)
            .renewPolicy(samplePolicyId, renewalPremium, {
              value: renewalPremium,
            })
        ).to.be.revertedWith("Policy not active");
      });
    });
  });

  describe("View Functions", function () {
    describe("getRemainingCoverage", function () {
      it("Should return full sum assured for new policy", async function () {
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(SUM_ASSURED);
      });

      it("Should return reduced coverage after partial claim", async function () {
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, PARTIAL_CLAIM);
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(SUM_ASSURED - PARTIAL_CLAIM);
      });

      it("Should return zero for fully claimed policy", async function () {
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, SUM_ASSURED);
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(0);
      });

      it("Should return zero for inactive policy", async function () {
        await healthContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);
        expect(
          await healthContract.getRemainingCoverage(samplePolicyId)
        ).to.equal(0);
      });
    });

    describe("getTotalClaimed", function () {
      it("Should return zero for new policy", async function () {
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          0
        );
      });

      it("Should return correct amount after claims", async function () {
        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, PARTIAL_CLAIM);
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          PARTIAL_CLAIM
        );

        await healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT);
        expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
          PARTIAL_CLAIM + CLAIM_AMOUNT
        );
      });
    });

    describe("calculateRefund", function () {
      it("Should return prorated refund for active policy", async function () {
        const refund = await healthContract.calculateRefund(samplePolicyId);
        expect(refund).to.be.lte(PREMIUM_AMOUNT);
        expect(refund).to.be.gt(0);
      });

      it("Should return zero for inactive policy", async function () {
        await healthContract
          .connect(admin)
          .cancelPolicy(samplePolicyId, REFUND_AMOUNT);
        expect(await healthContract.calculateRefund(samplePolicyId)).to.equal(
          0
        );
      });

      it("Should return zero for expired policy", async function () {
        // Fast forward time past expiry
        await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
        await ethers.provider.send("evm_mine", []);

        expect(await healthContract.calculateRefund(samplePolicyId)).to.equal(
          0
        );
      });

      it("Should calculate correct prorated refund", async function () {
        // Fast forward to halfway through policy
        await ethers.provider.send("evm_increaseTime", [DURATION / 2]);
        await ethers.provider.send("evm_mine", []);

        const refund = await healthContract.calculateRefund(samplePolicyId);
        const expectedRefund = PREMIUM_AMOUNT / 2n;

        // Allow for small timing differences
        expect(refund).to.be.closeTo(expectedRefund, ethers.parseEther("0.01"));
      });
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete policy lifecycle", async function () {
      // 1. Purchase policy
      const tx = await healthContract
        .connect(admin)
        .purchasePolicy(user2.address, PREMIUM_AMOUNT, SUM_ASSURED, DURATION, {
          value: PREMIUM_AMOUNT,
        });

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try {
          return (
            healthContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const policyId = healthContract.interface.parseLog(event as any)?.args[0];

      // 2. Make partial claim
      await healthContract
        .connect(admin)
        .fileAndApproveClaim(policyId, PARTIAL_CLAIM);
      expect(await healthContract.getRemainingCoverage(policyId)).to.equal(
        SUM_ASSURED - PARTIAL_CLAIM
      );

      // 3. Renew policy (resets claims)
      const renewalPremium = ethers.parseEther("1.5");
      await healthContract
        .connect(admin)
        .renewPolicy(policyId, renewalPremium, { value: renewalPremium });
      expect(await healthContract.getRemainingCoverage(policyId)).to.equal(
        SUM_ASSURED
      );

      // 4. Make full claim
      await healthContract
        .connect(admin)
        .fileAndApproveClaim(policyId, SUM_ASSURED);

      const policy = await healthContract.getPolicy(policyId);
      expect(policy.isActive).to.be.false;
      expect(policy.isClaimed).to.be.true;
    });

    it("Should handle multiple users with separate policies", async function () {
      // Create policy for user2
      const tx1 = await healthContract
        .connect(admin)
        .purchasePolicy(user2.address, PREMIUM_AMOUNT, SUM_ASSURED, DURATION, {
          value: PREMIUM_AMOUNT,
        });

      const receipt1 = await tx1.wait();
      const event1 = receipt1?.logs.find((log) => {
        try {
          return (
            healthContract.interface.parseLog(log as any)?.name ===
            "PolicyPurchased"
          );
        } catch {
          return false;
        }
      });
      const policyId2 = healthContract.interface.parseLog(event1 as any)
        ?.args[0];

      // Claims on different policies should be independent
      await healthContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, PARTIAL_CLAIM);
      await healthContract
        .connect(admin)
        .fileAndApproveClaim(policyId2, CLAIM_AMOUNT);

      expect(await healthContract.getTotalClaimed(samplePolicyId)).to.equal(
        PARTIAL_CLAIM
      );
      expect(await healthContract.getTotalClaimed(policyId2)).to.equal(
        CLAIM_AMOUNT
      );

      expect(
        await healthContract.getRemainingCoverage(samplePolicyId)
      ).to.equal(SUM_ASSURED - PARTIAL_CLAIM);
      expect(await healthContract.getRemainingCoverage(policyId2)).to.equal(
        SUM_ASSURED - CLAIM_AMOUNT
      );
    });
  });

  describe("Edge Cases & Error Handling", function () {
    it("Should handle vault transfer failures gracefully", async function () {
      // Revoke vault approval to simulate transfer failure
      await vault.connect(owner).revokeContract(healthContract.target);

      await expect(
        healthContract
          .connect(admin)
          .fileAndApproveClaim(samplePolicyId, CLAIM_AMOUNT)
      ).to.be.reverted;
    });

    it("Should revert renewal with zero premium due to vault transfer", async function () {
      await expect(
        healthContract
          .connect(admin)
          .renewPolicy(samplePolicyId, 0, { value: 0 })
      ).to.be.revertedWith("Vault transfer failed");
    });

    it("Should handle maximum claim amounts correctly", async function () {
      const maxClaim = SUM_ASSURED;

      await healthContract
        .connect(admin)
        .fileAndApproveClaim(samplePolicyId, maxClaim);

      const policy = await healthContract.getPolicy(samplePolicyId);
      expect(policy.isActive).to.be.false;
      expect(policy.isClaimed).to.be.true;
      expect(
        await healthContract.getRemainingCoverage(samplePolicyId)
      ).to.equal(0);
    });

    it("Should handle refund calculation edge cases", async function () {
      // Test with very small time differences
      await ethers.provider.send("evm_increaseTime", [1]);
      await ethers.provider.send("evm_mine", []);

      const refund = await healthContract.calculateRefund(samplePolicyId);
      expect(refund).to.be.lt(PREMIUM_AMOUNT);
      expect(refund).to.be.gt(0);
    });
  });
});
