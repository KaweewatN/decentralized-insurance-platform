import { expect } from "chai";
import { ethers } from "hardhat";
import { InsuranceVault } from "../typechain-types";

describe("InsuranceVault", function () {
  let vault: InsuranceVault;
  let owner: any, user: any, other: any;

  beforeEach(async () => {
    [owner, user, other] = await ethers.getSigners();

    const VaultFactory = await ethers.getContractFactory(
      "InsuranceVault",
      owner
    );
    vault = await VaultFactory.deploy(owner.address);
    await vault.waitForDeployment();
  });

  describe("Premium Payment (receive)", function () {
    it("should accept ETH and emit PremiumPaid", async () => {
      const amount = ethers.parseEther("1");

      await expect(
        user.sendTransaction({
          to: await vault.getAddress(),
          value: amount,
        })
      )
        .to.emit(vault, "PremiumPaid")
        .withArgs(await user.getAddress(), amount);

      const balance = await ethers.provider.getBalance(
        await vault.getAddress()
      );
      expect(balance).to.equal(amount);
    });

    it("should revert if 0 ETH is sent", async () => {
      await expect(
        user.sendTransaction({
          to: await vault.getAddress(),
          value: 0,
        })
      ).to.be.revertedWith("Premium must be greater than zero");
    });
  });

  describe("Claim Approval", function () {
    it("should allow owner to approve claim payout", async () => {
      const amount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: amount,
      });

      await expect(
        vault.connect(owner).approveClaim(await user.getAddress(), amount)
      )
        .to.emit(vault, "ClaimApproved")
        .withArgs(await user.getAddress(), amount);
    });

    it("should revert if non-owner tries to approve claim", async () => {
      await expect(
        vault
          .connect(user)
          .approveClaim(await user.getAddress(), ethers.parseEther("1"))
      )
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount")
        .withArgs(await user.getAddress());
    });

    it("should revert if vault has insufficient balance", async () => {
      await expect(
        vault
          .connect(owner)
          .approveClaim(await user.getAddress(), ethers.parseEther("100"))
      ).to.be.revertedWith("Insufficient balance in vault");
    });
  });

  describe("Refund Issuance", function () {
    it("should allow owner to issue refund", async () => {
      const amount = ethers.parseEther("0.5");
      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: amount,
      });

      await expect(
        vault.connect(owner).issueRefund(await user.getAddress(), amount)
      )
        .to.emit(vault, "RefundIssued")
        .withArgs(await user.getAddress(), amount);
    });

    it("should revert if non-owner tries to issue refund", async () => {
      await expect(
        vault
          .connect(user)
          .issueRefund(await user.getAddress(), ethers.parseEther("0.5"))
      )
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount")
        .withArgs(await user.getAddress());
    });

    it("should revert if vault has insufficient balance for refund", async () => {
      await expect(
        vault
          .connect(owner)
          .issueRefund(await user.getAddress(), ethers.parseEther("100"))
      ).to.be.revertedWith("Insufficient balance in vault");
    });
  });

  describe("Vault Balance", function () {
    it("should return correct vault balance", async () => {
      const deposit = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: deposit,
      });

      const balance = await vault.getVaultBalance();
      expect(balance).to.equal(deposit);
    });
  });
});
