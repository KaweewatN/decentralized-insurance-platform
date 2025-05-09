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
  });

  describe("Deployment", () => {
    it("should set owner and updater correctly", async () => {
      expect(await oracle.owner()).to.equal(await owner.getAddress());
      expect(await oracle.updater()).to.equal(await updater.getAddress());
    });
  });

  describe("Rate update", () => {
    it("should allow updater to update rate", async () => {
      const rate = ethers.parseUnits("0.000015", 18);
      await expect(oracle.connect(updater).updateEthPerThb(rate))
        .to.emit(oracle, "RateUpdated")
        .withArgs(rate);
      expect(await oracle.ethPerThb()).to.equal(rate);
    });

    it("should revert update from non-updater", async () => {
      const rate = ethers.parseUnits("0.00002", 18);
      await expect(
        oracle.connect(other).updateEthPerThb(rate)
      ).to.be.revertedWith("Not authorized");
    });

    it("should revert if rate is zero", async () => {
      await expect(
        oracle.connect(updater).updateEthPerThb(0)
      ).to.be.revertedWith("Invalid rate");
    });

    it("should emit RateUpdated even if rate is same", async () => {
      const rate = ethers.parseUnits("0.000012", 18);
      await oracle.connect(updater).updateEthPerThb(rate);
      await expect(oracle.connect(updater).updateEthPerThb(rate))
        .to.emit(oracle, "RateUpdated")
        .withArgs(rate);
    });

    it("should reflect latest rate after multiple updates", async () => {
      const rates = ["0.00001", "0.000013", "0.00002"].map((r) =>
        ethers.parseUnits(r, 18)
      );
      for (const rate of rates) {
        await oracle.connect(updater).updateEthPerThb(rate);
      }
      expect(await oracle.ethPerThb()).to.equal(rates[2]);
    });
  });

  describe("Updater management", () => {
    it("should allow owner to change updater", async () => {
      await expect(oracle.connect(owner).setUpdater(await other.getAddress()))
        .to.emit(oracle, "UpdaterChanged")
        .withArgs(await other.getAddress());
      expect(await oracle.updater()).to.equal(await other.getAddress());
    });

    it("should revert if non-owner sets updater", async () => {
      await expect(oracle.connect(other).setUpdater(await updater.getAddress()))
        .to.be.revertedWithCustomError(oracle, "OwnableUnauthorizedAccount")
        .withArgs(await other.getAddress());
    });

    it("should revert if setting zero address", async () => {
      await expect(
        oracle.connect(owner).setUpdater(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });
});
