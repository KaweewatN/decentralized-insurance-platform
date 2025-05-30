import { expect } from "chai";
import { ethers } from "hardhat";
import { InsuranceVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("InsuranceVault", function () {
  let vault: InsuranceVault;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let insuranceContract: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const INITIAL_BALANCE = ethers.parseEther("10.0");
  const PREMIUM_AMOUNT = ethers.parseEther("1.0");
  const CLAIM_AMOUNT = ethers.parseEther("2.0");
  const REFUND_AMOUNT = ethers.parseEther("0.5");

  beforeEach(async function () {
    [owner, user1, user2, insuranceContract, unauthorized] =
      await ethers.getSigners();

    const VaultFactory = await ethers.getContractFactory("InsuranceVault");
    vault = await VaultFactory.deploy(owner.address);

    // Fund the vault for testing
    await owner.sendTransaction({
      to: vault.target,
      value: INITIAL_BALANCE,
    });
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should have correct initial balance", async function () {
      expect(await vault.getVaultBalance()).to.equal(INITIAL_BALANCE);
    });

    it("Should not have any approved contracts initially", async function () {
      expect(await vault.isApprovedContract(insuranceContract.address)).to.be
        .false;
    });
  });

  describe("Contract Approval System", function () {
    describe("approveContract", function () {
      it("Should allow owner to approve a contract", async function () {
        await expect(
          vault.connect(owner).approveContract(insuranceContract.address)
        )
          .to.emit(vault, "ContractApproved")
          .withArgs(insuranceContract.address);

        expect(await vault.isApprovedContract(insuranceContract.address)).to.be
          .true;
        expect(await vault.approvedContracts(insuranceContract.address)).to.be
          .true;
      });

      it("Should revert if non-owner tries to approve contract", async function () {
        await expect(
          vault.connect(unauthorized).approveContract(insuranceContract.address)
        ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
      });

      it("Should revert when trying to approve zero address", async function () {
        await expect(
          vault.connect(owner).approveContract(ethers.ZeroAddress)
        ).to.be.revertedWith("Invalid contract address");
      });

      it("Should allow approving multiple contracts", async function () {
        await vault.connect(owner).approveContract(insuranceContract.address);
        await vault.connect(owner).approveContract(user1.address);

        expect(await vault.isApprovedContract(insuranceContract.address)).to.be
          .true;
        expect(await vault.isApprovedContract(user1.address)).to.be.true;
      });
    });

    describe("revokeContract", function () {
      beforeEach(async function () {
        await vault.connect(owner).approveContract(insuranceContract.address);
      });

      it("Should allow owner to revoke a contract", async function () {
        await expect(
          vault.connect(owner).revokeContract(insuranceContract.address)
        )
          .to.emit(vault, "ContractRevoked")
          .withArgs(insuranceContract.address);

        expect(await vault.isApprovedContract(insuranceContract.address)).to.be
          .false;
      });

      it("Should revert if non-owner tries to revoke contract", async function () {
        await expect(
          vault.connect(unauthorized).revokeContract(insuranceContract.address)
        ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
      });

      it("Should allow revoking non-approved contract without error", async function () {
        await vault.connect(owner).revokeContract(user1.address);
        expect(await vault.isApprovedContract(user1.address)).to.be.false;
      });
    });

    describe("isApprovedContract", function () {
      it("Should return false for non-approved contract", async function () {
        expect(await vault.isApprovedContract(insuranceContract.address)).to.be
          .false;
      });

      it("Should return true for approved contract", async function () {
        await vault.connect(owner).approveContract(insuranceContract.address);
        expect(await vault.isApprovedContract(insuranceContract.address)).to.be
          .true;
      });

      it("Should return false after contract is revoked", async function () {
        await vault.connect(owner).approveContract(insuranceContract.address);
        await vault.connect(owner).revokeContract(insuranceContract.address);
        expect(await vault.isApprovedContract(insuranceContract.address)).to.be
          .false;
      });
    });
  });

  describe("Premium Payments (receive function)", function () {
    it("Should accept premium payments and emit event", async function () {
      const initialBalance = await vault.getVaultBalance();

      await expect(
        user1.sendTransaction({
          to: vault.target,
          value: PREMIUM_AMOUNT,
        })
      )
        .to.emit(vault, "PremiumPaid")
        .withArgs(user1.address, PREMIUM_AMOUNT);

      expect(await vault.getVaultBalance()).to.equal(
        initialBalance + PREMIUM_AMOUNT
      );
    });

    it("Should revert when premium is zero", async function () {
      await expect(
        user1.sendTransaction({
          to: vault.target,
          value: 0,
        })
      ).to.be.revertedWith("Premium must be greater than zero");
    });

    it("Should accept multiple premium payments", async function () {
      const payment1 = ethers.parseEther("0.5");
      const payment2 = ethers.parseEther("1.5");
      const initialBalance = await vault.getVaultBalance();

      await user1.sendTransaction({ to: vault.target, value: payment1 });
      await user2.sendTransaction({ to: vault.target, value: payment2 });

      expect(await vault.getVaultBalance()).to.equal(
        initialBalance + payment1 + payment2
      );
    });
  });

  describe("Claim Payments", function () {
    beforeEach(async function () {
      await vault.connect(owner).approveContract(insuranceContract.address);
    });

    describe("approveClaim", function () {
      it("Should allow owner to approve claim", async function () {
        const initialBalance = await vault.getVaultBalance();
        const initialUserBalance = await ethers.provider.getBalance(
          user1.address
        );

        await expect(
          vault.connect(owner).approveClaim(user1.address, CLAIM_AMOUNT)
        )
          .to.emit(vault, "ClaimPaid")
          .withArgs(user1.address, CLAIM_AMOUNT);

        expect(await vault.getVaultBalance()).to.equal(
          initialBalance - CLAIM_AMOUNT
        );
        expect(await ethers.provider.getBalance(user1.address)).to.equal(
          initialUserBalance + CLAIM_AMOUNT
        );
      });

      it("Should allow approved contract to approve claim", async function () {
        const initialBalance = await vault.getVaultBalance();

        await expect(
          vault
            .connect(insuranceContract)
            .approveClaim(user1.address, CLAIM_AMOUNT)
        )
          .to.emit(vault, "ClaimPaid")
          .withArgs(user1.address, CLAIM_AMOUNT);

        expect(await vault.getVaultBalance()).to.equal(
          initialBalance - CLAIM_AMOUNT
        );
      });

      it("Should revert when unauthorized user tries to approve claim", async function () {
        await expect(
          vault.connect(unauthorized).approveClaim(user1.address, CLAIM_AMOUNT)
        ).to.be.revertedWith("Not authorized");
      });

      it("Should revert when vault has insufficient balance", async function () {
        const excessiveAmount = INITIAL_BALANCE + ethers.parseEther("1.0");

        await expect(
          vault.connect(owner).approveClaim(user1.address, excessiveAmount)
        ).to.be.revertedWith("Insufficient balance in vault");
      });

      it("Should revert when claim amount is zero", async function () {
        await expect(
          vault.connect(owner).approveClaim(user1.address, 0)
        ).to.be.revertedWith("Claim amount must be greater than zero");
      });

      it("Should handle multiple claims correctly", async function () {
        const claim1 = ethers.parseEther("1.0");
        const claim2 = ethers.parseEther("1.5");
        const initialBalance = await vault.getVaultBalance();

        await vault.connect(owner).approveClaim(user1.address, claim1);
        await vault
          .connect(insuranceContract)
          .approveClaim(user2.address, claim2);

        expect(await vault.getVaultBalance()).to.equal(
          initialBalance - claim1 - claim2
        );
      });
    });
  });

  describe("Refund Payments", function () {
    beforeEach(async function () {
      await vault.connect(owner).approveContract(insuranceContract.address);
    });

    describe("sendRefund", function () {
      it("Should allow owner to send refund", async function () {
        const initialBalance = await vault.getVaultBalance();
        const initialUserBalance = await ethers.provider.getBalance(
          user1.address
        );

        await expect(
          vault.connect(owner).sendRefund(user1.address, REFUND_AMOUNT)
        )
          .to.emit(vault, "RefundIssued")
          .withArgs(user1.address, REFUND_AMOUNT);

        expect(await vault.getVaultBalance()).to.equal(
          initialBalance - REFUND_AMOUNT
        );
        expect(await ethers.provider.getBalance(user1.address)).to.equal(
          initialUserBalance + REFUND_AMOUNT
        );
      });

      it("Should allow approved contract to send refund", async function () {
        const initialBalance = await vault.getVaultBalance();

        await expect(
          vault
            .connect(insuranceContract)
            .sendRefund(user1.address, REFUND_AMOUNT)
        )
          .to.emit(vault, "RefundIssued")
          .withArgs(user1.address, REFUND_AMOUNT);

        expect(await vault.getVaultBalance()).to.equal(
          initialBalance - REFUND_AMOUNT
        );
      });

      it("Should revert when unauthorized user tries to send refund", async function () {
        await expect(
          vault.connect(unauthorized).sendRefund(user1.address, REFUND_AMOUNT)
        ).to.be.revertedWith("Not authorized");
      });

      it("Should revert when vault has insufficient balance", async function () {
        const excessiveAmount = INITIAL_BALANCE + ethers.parseEther("1.0");

        await expect(
          vault.connect(owner).sendRefund(user1.address, excessiveAmount)
        ).to.be.revertedWith("Insufficient balance in vault");
      });

      it("Should revert when refund amount is zero", async function () {
        await expect(
          vault.connect(owner).sendRefund(user1.address, 0)
        ).to.be.revertedWith("Refund amount must be greater than zero");
      });
    });
  });

  describe("Fund Withdrawal", function () {
    describe("withdrawFunds", function () {
      it("Should allow owner to withdraw funds", async function () {
        const withdrawAmount = ethers.parseEther("3.0");
        const initialBalance = await vault.getVaultBalance();
        const initialOwnerBalance = await ethers.provider.getBalance(
          owner.address
        );

        const tx = await vault
          .connect(owner)
          .withdrawFunds(owner.address, withdrawAmount);
        const receipt = await tx.wait();
        const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

        await expect(tx)
          .to.emit(vault, "FundWithdrawn")
          .withArgs(owner.address, withdrawAmount);

        expect(await vault.getVaultBalance()).to.equal(
          initialBalance - withdrawAmount
        );
        expect(await ethers.provider.getBalance(owner.address)).to.equal(
          initialOwnerBalance + withdrawAmount - gasUsed
        );
      });

      it("Should allow owner to withdraw to different address", async function () {
        const withdrawAmount = ethers.parseEther("2.0");
        const initialBalance = await vault.getVaultBalance();
        const initialUserBalance = await ethers.provider.getBalance(
          user1.address
        );

        await expect(
          vault.connect(owner).withdrawFunds(user1.address, withdrawAmount)
        )
          .to.emit(vault, "FundWithdrawn")
          .withArgs(user1.address, withdrawAmount);

        expect(await vault.getVaultBalance()).to.equal(
          initialBalance - withdrawAmount
        );
        expect(await ethers.provider.getBalance(user1.address)).to.equal(
          initialUserBalance + withdrawAmount
        );
      });

      it("Should revert when non-owner tries to withdraw", async function () {
        await expect(
          vault
            .connect(unauthorized)
            .withdrawFunds(unauthorized.address, REFUND_AMOUNT)
        ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
      });

      it("Should revert when vault has insufficient balance", async function () {
        const excessiveAmount = INITIAL_BALANCE + ethers.parseEther("1.0");

        await expect(
          vault.connect(owner).withdrawFunds(owner.address, excessiveAmount)
        ).to.be.revertedWith("Insufficient balance in vault");
      });

      it("Should revert when withdraw amount is zero", async function () {
        await expect(
          vault.connect(owner).withdrawFunds(owner.address, 0)
        ).to.be.revertedWith("Withdraw amount must be greater than zero");
      });
    });
  });

  describe("Balance Queries", function () {
    describe("getVaultBalance", function () {
      it("Should return correct balance", async function () {
        expect(await vault.getVaultBalance()).to.equal(INITIAL_BALANCE);
      });

      it("Should update balance after premium payment", async function () {
        await user1.sendTransaction({
          to: vault.target,
          value: PREMIUM_AMOUNT,
        });

        expect(await vault.getVaultBalance()).to.equal(
          INITIAL_BALANCE + PREMIUM_AMOUNT
        );
      });

      it("Should update balance after claim payment", async function () {
        await vault.connect(owner).approveClaim(user1.address, CLAIM_AMOUNT);
        expect(await vault.getVaultBalance()).to.equal(
          INITIAL_BALANCE - CLAIM_AMOUNT
        );
      });

      it("Should be callable by anyone", async function () {
        expect(await vault.connect(unauthorized).getVaultBalance()).to.equal(
          INITIAL_BALANCE
        );
      });
    });
  });

  describe("Integration Tests", function () {
    beforeEach(async function () {
      await vault.connect(owner).approveContract(insuranceContract.address);
    });

    it("Should handle complete insurance lifecycle", async function () {
      const premium = ethers.parseEther("1.0");
      const claim = ethers.parseEther("2.0");
      const refund = ethers.parseEther("0.3");

      const initialBalance = await vault.getVaultBalance();

      // 1. Premium payment
      await user1.sendTransaction({ to: vault.target, value: premium });
      expect(await vault.getVaultBalance()).to.equal(initialBalance + premium);

      // 2. Claim payment
      await vault.connect(insuranceContract).approveClaim(user1.address, claim);
      expect(await vault.getVaultBalance()).to.equal(
        initialBalance + premium - claim
      );

      // 3. Refund
      await vault.connect(insuranceContract).sendRefund(user2.address, refund);
      expect(await vault.getVaultBalance()).to.equal(
        initialBalance + premium - claim - refund
      );
    });

    it("Should handle contract approval lifecycle", async function () {
      // Initially not approved
      expect(await vault.isApprovedContract(user1.address)).to.be.false;

      // Cannot make claims
      await expect(
        vault.connect(user1).approveClaim(user2.address, CLAIM_AMOUNT)
      ).to.be.revertedWith("Not authorized");

      // Approve contract
      await vault.connect(owner).approveContract(user1.address);
      expect(await vault.isApprovedContract(user1.address)).to.be.true;

      // Can now make claims
      await vault.connect(user1).approveClaim(user2.address, CLAIM_AMOUNT);

      // Revoke contract
      await vault.connect(owner).revokeContract(user1.address);
      expect(await vault.isApprovedContract(user1.address)).to.be.false;

      // Cannot make claims again
      await expect(
        vault.connect(user1).approveClaim(user2.address, CLAIM_AMOUNT)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should handle edge case of exact balance claims", async function () {
      const vaultBalance = await vault.getVaultBalance();

      // Should succeed with exact balance
      await vault.connect(owner).approveClaim(user1.address, vaultBalance);
      expect(await vault.getVaultBalance()).to.equal(0);

      // Should fail when vault is empty
      await expect(
        vault.connect(owner).approveClaim(user1.address, 1)
      ).to.be.revertedWith("Insufficient balance in vault");
    });
  });

  describe("Access Control Edge Cases", function () {
    it("Should allow owner even if not explicitly approved", async function () {
      // Owner should be able to call without being in approvedContracts
      expect(await vault.isApprovedContract(owner.address)).to.be.false;

      await vault.connect(owner).approveClaim(user1.address, CLAIM_AMOUNT);
      // Should succeed
    });

    it("Should not allow revoked contracts", async function () {
      await vault.connect(owner).approveContract(insuranceContract.address);
      await vault
        .connect(insuranceContract)
        .approveClaim(user1.address, CLAIM_AMOUNT);

      await vault.connect(owner).revokeContract(insuranceContract.address);

      await expect(
        vault
          .connect(insuranceContract)
          .approveClaim(user1.address, CLAIM_AMOUNT)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should handle zero address queries correctly", async function () {
      expect(await vault.isApprovedContract(ethers.ZeroAddress)).to.be.false;
    });
  });

  describe("Event Emissions", function () {
    beforeEach(async function () {
      await vault.connect(owner).approveContract(insuranceContract.address);
    });

    it("Should emit all events with correct parameters", async function () {
      // Test all events in sequence
      await expect(vault.connect(owner).approveContract(user1.address))
        .to.emit(vault, "ContractApproved")
        .withArgs(user1.address);

      await expect(
        user1.sendTransaction({ to: vault.target, value: PREMIUM_AMOUNT })
      )
        .to.emit(vault, "PremiumPaid")
        .withArgs(user1.address, PREMIUM_AMOUNT);

      await expect(
        vault.connect(owner).approveClaim(user1.address, CLAIM_AMOUNT)
      )
        .to.emit(vault, "ClaimPaid")
        .withArgs(user1.address, CLAIM_AMOUNT);

      await expect(
        vault.connect(owner).sendRefund(user1.address, REFUND_AMOUNT)
      )
        .to.emit(vault, "RefundIssued")
        .withArgs(user1.address, REFUND_AMOUNT);

      await expect(
        vault
          .connect(owner)
          .withdrawFunds(owner.address, ethers.parseEther("1.0"))
      )
        .to.emit(vault, "FundWithdrawn")
        .withArgs(owner.address, ethers.parseEther("1.0"));

      await expect(vault.connect(owner).revokeContract(user1.address))
        .to.emit(vault, "ContractRevoked")
        .withArgs(user1.address);
    });
  });
});
