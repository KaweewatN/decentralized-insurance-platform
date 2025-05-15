import { expect } from "chai";
import { ethers } from "hardhat";
import { InsuranceVault } from "../typechain-types"; // Make sure this path is correct
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"; // Import SignerWithAddress

describe("InsuranceVault", function () {
  let insuranceVault: InsuranceVault;
  let owner: SignerWithAddress; // Use SignerWithAddress for type safety
  let user: SignerWithAddress; // Use SignerWithAddress for type safety

  beforeEach(async function () {
    // Get signers
    [owner, user] = await ethers.getSigners();

    // Get contract factory, explicitly connecting the owner as the deployer
    const InsuranceVaultFactory = await ethers.getContractFactory(
      "InsuranceVault",
      owner // The owner signer will be used for deployment and Ownable's initial owner
    );
    // Deploy the contract
    insuranceVault = (await InsuranceVaultFactory.deploy(
      owner.address // Pass the owner's address to the Ownable constructor
    )) as unknown as InsuranceVault; // Cast to InsuranceVault type
    await insuranceVault.waitForDeployment(); // Wait for the contract to be deployed
    console.log(
      "Deployed InsuranceVault contract at:",
      await insuranceVault.getAddress()
    );
  });

  it("should accept premium payments and emit PremiumPaid event", async function () {
    const premiumAmount = ethers.parseEther("1");
    console.log("Sending premium payment of:", premiumAmount.toString());

    // User sends ETH to the contract, triggering the receive() function
    await expect(
      user.sendTransaction({
        to: await insuranceVault.getAddress(), // Use getAddress() for the target
        value: premiumAmount,
      })
    )
      .to.emit(insuranceVault, "PremiumPaid")
      .withArgs(user.address, premiumAmount); // msg.sender will be user.address

    const vaultBalance = await insuranceVault.getVaultBalance();
    console.log(
      "Vault balance after premium payment:",
      vaultBalance.toString()
    );
    expect(vaultBalance).to.equal(premiumAmount);
  });

  it("should allow the owner to send a claim payout", async function () {
    const premiumAmount = ethers.parseEther("2");
    const payoutAmount = ethers.parseEther("1");

    console.log("Sending premium payment of:", premiumAmount.toString());
    // Fund the vault first
    await user.sendTransaction({
      to: await insuranceVault.getAddress(),
      value: premiumAmount,
    });

    console.log("Sending claim payout of:", payoutAmount.toString());
    // Corrected: Call approveClaim instead of sendPayout
    await expect(
      insuranceVault.connect(owner).approveClaim(user.address, payoutAmount) // User's address is payable
    )
      .to.emit(insuranceVault, "ClaimPaid")
      .withArgs(user.address, payoutAmount);

    const vaultBalance = await insuranceVault.getVaultBalance();
    console.log("Vault balance after claim payout:", vaultBalance.toString());
    expect(vaultBalance).to.equal(premiumAmount - payoutAmount);
  });

  it("should revert if non-owner tries to send a claim payout", async function () {
    const premiumAmount = ethers.parseEther("2"); // Fund the vault
    const payoutAmount = ethers.parseEther("1");
    console.log(
      "Attempting to send claim payout as non-owner:",
      payoutAmount.toString()
    );

    // Fund the vault first so it doesn't revert due to insufficient balance
    await owner.sendTransaction({
      to: await insuranceVault.getAddress(),
      value: premiumAmount,
    });

    // Corrected: Call approveClaim instead of sendPayout
    // Expecting revert due to Ownable's onlyOwner modifier
    await expect(
      insuranceVault
        .connect(user) // Non-owner attempts the call
        .approveClaim(user.address, payoutAmount)
    )
      .to.be.revertedWithCustomError(
        insuranceVault,
        "OwnableUnauthorizedAccount"
      )
      .withArgs(user.address);
  });

  it("should allow the owner to issue a refund", async function () {
    const premiumAmount = ethers.parseEther("2");
    const refundAmount = ethers.parseEther("1");

    console.log("Sending premium payment of:", premiumAmount.toString());
    await user.sendTransaction({
      to: await insuranceVault.getAddress(),
      value: premiumAmount,
    });

    console.log("Issuing refund of:", refundAmount.toString());
    await expect(
      insuranceVault.connect(owner).sendRefund(user.address, refundAmount) // User's address is payable
    )
      .to.emit(insuranceVault, "RefundIssued")
      .withArgs(user.address, refundAmount);

    const vaultBalance = await insuranceVault.getVaultBalance();
    console.log("Vault balance after refund:", vaultBalance.toString());
    expect(vaultBalance).to.equal(premiumAmount - refundAmount);
  });

  it("should revert if non-owner tries to issue a refund", async function () {
    const premiumAmount = ethers.parseEther("2"); // Fund the vault
    const refundAmount = ethers.parseEther("1");
    console.log(
      "Attempting to issue refund as non-owner:",
      refundAmount.toString()
    );
    // Fund the vault first
    await owner.sendTransaction({
      to: await insuranceVault.getAddress(),
      value: premiumAmount,
    });

    // Expecting revert due to Ownable's onlyOwner modifier
    await expect(
      insuranceVault
        .connect(user) // Non-owner attempts the call
        .sendRefund(user.address, refundAmount)
    )
      .to.be.revertedWithCustomError(
        insuranceVault,
        "OwnableUnauthorizedAccount"
      )
      .withArgs(user.address);
  });

  it("should allow the owner to withdraw funds", async function () {
    const premiumAmount = ethers.parseEther("3");
    const withdrawAmount = ethers.parseEther("2");

    console.log("Sending premium payment of:", premiumAmount.toString());
    await user.sendTransaction({
      to: await insuranceVault.getAddress(),
      value: premiumAmount,
    });

    console.log("Withdrawing funds of:", withdrawAmount.toString());
    await expect(
      insuranceVault.connect(owner).withdrawFunds(owner.address, withdrawAmount) // Owner's address is payable
    )
      .to.emit(insuranceVault, "FundWithdrawn")
      .withArgs(owner.address, withdrawAmount);

    const vaultBalance = await insuranceVault.getVaultBalance();
    console.log("Vault balance after withdrawal:", vaultBalance.toString());
    expect(vaultBalance).to.equal(premiumAmount - withdrawAmount);
  });

  it("should revert if non-owner tries to withdraw funds", async function () {
    const premiumAmount = ethers.parseEther("2"); // Fund the vault
    const withdrawAmount = ethers.parseEther("1");
    console.log(
      "Attempting to withdraw funds as non-owner:",
      withdrawAmount.toString()
    );
    // Fund the vault first
    await owner.sendTransaction({
      to: await insuranceVault.getAddress(),
      value: premiumAmount,
    });

    // Expecting revert due to Ownable's onlyOwner modifier
    await expect(
      insuranceVault
        .connect(user) // Non-owner attempts the call
        .withdrawFunds(user.address, withdrawAmount)
    )
      .to.be.revertedWithCustomError(
        insuranceVault,
        "OwnableUnauthorizedAccount"
      )
      .withArgs(user.address);
  });

  it("should revert if trying to send a payout with insufficient balance", async function () {
    const payoutAmount = ethers.parseEther("1"); // Vault is empty
    console.log(
      "Attempting to send payout with insufficient balance:",
      payoutAmount.toString()
    );

    // Corrected: Call approveClaim instead of sendPayout
    await expect(
      insuranceVault.connect(owner).approveClaim(user.address, payoutAmount)
    ).to.be.revertedWith("Insufficient balance in vault");
  });

  it("should revert if trying to issue a refund with insufficient balance", async function () {
    const refundAmount = ethers.parseEther("1"); // Vault is empty
    console.log(
      "Attempting to issue refund with insufficient balance:",
      refundAmount.toString()
    );

    await expect(
      insuranceVault.connect(owner).sendRefund(user.address, refundAmount)
    ).to.be.revertedWith("Insufficient balance in vault");
  });

  it("should revert if trying to withdraw funds with insufficient balance", async function () {
    const withdrawAmount = ethers.parseEther("1"); // Vault is empty
    console.log(
      "Attempting to withdraw funds with insufficient balance:",
      withdrawAmount.toString()
    );

    await expect(
      insuranceVault.connect(owner).withdrawFunds(owner.address, withdrawAmount)
    ).to.be.revertedWith("Insufficient balance in vault");
  });

  it("should return the correct vault balance", async function () {
    const premiumAmount = ethers.parseEther("1");
    console.log("Sending premium payment of:", premiumAmount.toString());

    await user.sendTransaction({
      to: await insuranceVault.getAddress(),
      value: premiumAmount,
    });

    const vaultBalance = await insuranceVault.getVaultBalance();
    console.log(
      "Vault balance after premium payment:",
      vaultBalance.toString()
    );
    expect(vaultBalance).to.equal(premiumAmount);
  });
});
