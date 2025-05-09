import { expect } from "chai";
import { ethers } from "hardhat";
import {
  HealthCareLite,
  PriceOracle,
  InsuranceVault,
} from "../typechain-types";

describe("HealthCareLite", function () {
  let contract: HealthCareLite;
  let oracle: PriceOracle;
  let vault: InsuranceVault;
  let owner: any, user: any, other: any;

  beforeEach(async () => {
    [owner, user, other] = await ethers.getSigners();

    const OracleFactory = await ethers.getContractFactory("PriceOracle", owner);
    oracle = await OracleFactory.deploy(owner.address, owner.address);

    const VaultFactory = await ethers.getContractFactory(
      "InsuranceVault",
      owner
    );
    vault = await VaultFactory.deploy(owner.address);

    const ContractFactory = await ethers.getContractFactory(
      "HealthCareLite",
      owner
    );
    contract = await ContractFactory.deploy(
      owner.address,
      oracle.getAddress(),
      vault.getAddress()
    );

    await oracle
      .connect(owner)
      .updateEthPerThb(ethers.parseUnits("0.00002", 18)); // ✅ ต้องตั้งค่า
  });

  it("should correctly calculate premium", async () => {
    const premium = await contract.calculatePremium(
      30,
      "male",
      "developer",
      100000
    );
    expect(premium).to.be.gt(0n);
  });

  it("should purchase a policy and emit events", async () => {
    const premium = await contract.previewPremium(
      25,
      "female",
      "teacher",
      100000,
      user.address
    );
    await expect(
      contract
        .connect(user)
        .purchasePolicy(
          user.address,
          "Alice",
          25,
          "female",
          "teacher",
          "alice@web3.com",
          100000,
          { value: premium }
        )
    ).to.emit(contract, "PolicyPurchased");
  });

  it("should reject purchase with incorrect premium", async () => {
    const premium = await contract.previewPremium(
      30,
      "male",
      "engineer",
      100000,
      user.address
    );
    const lower = premium - BigInt(1); // ✅ ป้องกัน overflow
    await expect(
      contract
        .connect(user)
        .purchasePolicy(
          user.address,
          "Bob",
          30,
          "male",
          "engineer",
          "bob@email.com",
          100000,
          { value: lower }
        )
    ).to.be.revertedWith("Incorrect premium");
  });

  it("should renew expired policy", async () => {
    const premium = await contract.previewPremium(
      40,
      "female",
      "farmer",
      100000,
      user.address
    );
    await contract
      .connect(user)
      .purchasePolicy(
        user.address,
        "Farmer",
        40,
        "female",
        "farmer",
        "field",
        100000,
        { value: premium }
      );
    await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await expect(
      contract
        .connect(user)
        .renewPolicy(user.address, premium, { value: premium })
    ).to.emit(contract, "PolicyRenewed");
  });

  it("should cancel policy and emit RefundIssued(0)", async () => {
    const premium = await contract.previewPremium(
      35,
      "male",
      "worker",
      100000,
      user.address
    );
    await contract
      .connect(user)
      .purchasePolicy(
        user.address,
        "Worker",
        35,
        "male",
        "worker",
        "x",
        100000,
        { value: premium }
      );
    await expect(contract.connect(user).cancelPolicy(user.address))
      .to.emit(contract, "RefundIssued")
      .withArgs(user.address, 0);
  });

  it("should file and approve claim", async () => {
    const premium = await contract.previewPremium(
      45,
      "female",
      "scientist",
      100000,
      user.address
    );
    await contract
      .connect(user)
      .purchasePolicy(
        user.address,
        "Scientist",
        45,
        "female",
        "scientist",
        "lab",
        100000,
        { value: premium }
      );
    await contract.connect(user).fileClaim(user.address, 25000, "QmClaimHash");
    await expect(contract.connect(owner).approveClaim(user.address))
      .to.emit(contract, "ClaimApproved")
      .withArgs(user.address, 25000);
  });

  it("should revert second claim if pending exists", async () => {
    const premium = await contract.previewPremium(
      50,
      "male",
      "doctor",
      100000,
      user.address
    );
    await contract
      .connect(user)
      .purchasePolicy(
        user.address,
        "Doctor",
        50,
        "male",
        "doctor",
        "dr@email",
        100000,
        { value: premium }
      );
    await contract.connect(user).fileClaim(user.address, 10000, "hash1");
    await expect(
      contract.connect(user).fileClaim(user.address, 5000, "hash2")
    ).to.be.revertedWith("Pending claim exists");
  });

  it("should return refund before expiry", async () => {
    const premium = await contract.previewPremium(
      60,
      "female",
      "engineer",
      100000,
      user.address
    );
    await contract
      .connect(user)
      .purchasePolicy(
        user.address,
        "Refundable",
        60,
        "female",
        "engineer",
        "x@x.com",
        100000,
        { value: premium }
      );
    await ethers.provider.send("evm_increaseTime", [180 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    const refund = await contract.calculateRefund(user.address);
    expect(refund).to.be.gt(0);
  });
});
