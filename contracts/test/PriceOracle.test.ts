import { expect } from "chai";
import { ethers } from "hardhat";
import { PriceOracle, PriceOracle__factory } from "../typechain-types";
import { Signer } from "ethers";

describe("PriceOracle", function () {
  let owner: Signer;
  let updater: Signer;
  let other: Signer;
  let oracle: PriceOracle;

  beforeEach(async () => {
    [owner, updater, other] = await ethers.getSigners();
    const factory = new PriceOracle__factory(owner);
    oracle = await factory.deploy(
      await owner.getAddress(),
      await updater.getAddress()
    );
    await oracle.waitForDeployment();
    console.log("Deployed PriceOracle contract at:", oracle.target);
    console.log("Owner address:", await owner.getAddress());
    console.log("Updater address:", await updater.getAddress());
  });

  describe("Deployment", () => {
    it("should set owner and updater correctly", async () => {
      console.log("Checking owner and updater addresses...");
      expect(await oracle.owner()).to.equal(await owner.getAddress());
      expect(await oracle.updater()).to.equal(await updater.getAddress());
      console.log("Owner and updater addresses are set correctly.");
    });
  });

  describe("Rate update", () => {
    it("should allow updater to update rate", async () => {
      const rate = ethers.parseUnits("0.000015", 18);
      console.log("Updater is updating rate to:", rate.toString());
      await expect(oracle.connect(updater).updateEthPerThb(rate))
        .to.emit(oracle, "RateUpdated")
        .withArgs(rate);
      const updatedRate = await oracle.ethPerThb();
      console.log("Updated rate:", updatedRate.toString());
      expect(updatedRate).to.equal(rate);
    });

    it("should revert update from non-updater", async () => {
      const rate = ethers.parseUnits("0.00002", 18);
      console.log("Non-updater attempting to update rate to:", rate.toString());
      await expect(
        oracle.connect(other).updateEthPerThb(rate)
      ).to.be.revertedWith("Not authorized");
    });

    it("should revert if rate is zero", async () => {
      console.log("Updater attempting to update rate to zero...");
      await expect(
        oracle.connect(updater).updateEthPerThb(0)
      ).to.be.revertedWith("Invalid rate");
    });

    it("should emit RateUpdated even if rate is same", async () => {
      const rate = ethers.parseUnits("0.000012", 18);
      console.log("Updater setting rate to:", rate.toString());
      await oracle.connect(updater).updateEthPerThb(rate);
      console.log("Updater setting the same rate again:", rate.toString());
      await expect(oracle.connect(updater).updateEthPerThb(rate))
        .to.emit(oracle, "RateUpdated")
        .withArgs(rate);
    });

    it("should reflect latest rate after multiple updates", async () => {
      const rates = ["0.00001", "0.000013", "0.00002"].map((r) =>
        ethers.parseUnits(r, 18)
      );
      console.log("Updater performing multiple rate updates...");
      for (const rate of rates) {
        console.log("Updating rate to:", rate.toString());
        await oracle.connect(updater).updateEthPerThb(rate);
      }
      const latestRate = await oracle.ethPerThb();
      console.log("Latest rate after updates:", latestRate.toString());
      expect(latestRate).to.equal(rates[2]);
    });
  });

  describe("Updater management", () => {
    it("should allow owner to change updater", async () => {
      console.log("Owner changing updater to:", await other.getAddress());
      await expect(oracle.connect(owner).setUpdater(await other.getAddress()))
        .to.emit(oracle, "UpdaterChanged")
        .withArgs(await other.getAddress());
      const newUpdater = await oracle.updater();
      console.log("New updater address:", newUpdater);
      expect(newUpdater).to.equal(await other.getAddress());
    });

    it("should revert if non-owner sets updater", async () => {
      console.log("Non-owner attempting to change updater...");
      await expect(oracle.connect(other).setUpdater(await updater.getAddress()))
        .to.be.revertedWithCustomError(oracle, "OwnableUnauthorizedAccount")
        .withArgs(await other.getAddress());
    });

    it("should revert if setting zero address", async () => {
      console.log("Owner attempting to set updater to zero address...");
      await expect(
        oracle.connect(owner).setUpdater(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });
});
