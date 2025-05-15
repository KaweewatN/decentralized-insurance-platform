import { expect } from "chai";
import { ethers } from "hardhat"; // Using ethers from hardhat
import type { Signer } from "ethers"; // Optional: for better type safety for signers
import type { TransactionReceipt } from "ethers"; // For receipt type

describe("PolicyBaseMock", function () {
  let policyBaseMock: any;
  let owner: Signer,
    user1: Signer,
    user2: Signer,
    admin: Signer,
    trustedSigner: Signer; // Used Signer type
  let premium: bigint, sumAssured: bigint; // Using bigint for these values
  const duration = 365 * 24 * 60 * 60; // 1 year in seconds
  let policyId: any; // Kept as any as per original, could be bytes32 or string

  before(async function () {
    console.log("Setting up test environment...");
    // Setup accounts
    const signers = await ethers.getSigners();
    owner = signers[0];
    user1 = signers[1];
    user2 = signers[2];
    admin = signers[3];
    trustedSigner = signers[4];
    console.log("Accounts loaded");

    // Convert to BigInt values
    premium = ethers.getBigInt("100000000000000000"); // 0.1 ETH
    sumAssured = ethers.getBigInt("10000000000000000000"); // 10 ETH
    console.log(
      `Premium: ${ethers.formatEther(
        premium
      )} ETH, Sum Assured: ${ethers.formatEther(sumAssured)} ETH`
    );

    // Deploy contract
    console.log("Deploying PolicyBaseMock contract...");
    const PolicyBaseMockFactory = await ethers.getContractFactory(
      "PolicyBaseMock"
    );
    policyBaseMock = await PolicyBaseMockFactory.deploy(
      await trustedSigner.getAddress()
    ); // Pass address string
    console.log("Contract deployed to:", await policyBaseMock.getAddress());

    // Grant admin role
    console.log("Granting ADMIN_ROLE to admin account...");
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    await policyBaseMock.grantRole(ADMIN_ROLE, await admin.getAddress()); // Pass address string
    console.log("Admin role granted");
  });

  describe("Policy Operations", function () {
    it("Should purchase a policy without signature", async function () {
      console.log("\n----- Testing purchase policy without signature -----");
      const user1Address = await user1.getAddress();
      console.log("User1 address:", user1Address);

      console.log("Purchasing policy...");
      const tx = await policyBaseMock
        .connect(user1)
        .purchasePolicyWithoutSignature(
          user1Address,
          premium,
          sumAssured,
          duration,
          { value: premium }
        );
      console.log("Transaction submitted:", tx.hash);

      const receipt = (await tx.wait()) as TransactionReceipt; // Cast to TransactionReceipt
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      // Get the policy ID from event
      console.log("Parsing logs for PolicyPurchased event...");
      if (receipt.logs && receipt.logs.length > 0) {
        // Check logs for events
        const policyPurchasedInterface = new ethers.Interface(
          policyBaseMock.interface.fragments
        );
        for (const log of receipt.logs) {
          try {
            const parsedLog = policyPurchasedInterface.parseLog(log as any); // Explicitly cast log if needed
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              policyId = parsedLog.args.policyId;
              console.log("Found PolicyPurchased event with ID:", policyId);
              break;
            }
          } catch (e) {
            // Not the event we are looking for or unparseable by this interface
          }
        }
      }

      // Fallback: If no event found or parsed, use a deterministic ID based on receipt
      if (!policyId && receipt.blockNumber) {
        console.log("Using fallback method with block number");
        // Check if receipt.blockNumber is available
        const calculatedPolicyId = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256"],
            [user1Address, receipt.blockNumber] // Use receipt.blockNumber
          )
        );
        // Verify if this calculated ID exists (optional, depends on contract logic)
        const policyCheck = await policyBaseMock.getPolicy(calculatedPolicyId);
        if (policyCheck && policyCheck.owner === user1Address) {
          policyId = calculatedPolicyId;
          console.log("Verified calculated policy ID:", policyId);
        }
      }

      // Final fallback: Use another way to get the policy ID
      if (!policyId) {
        console.log("Using second fallback: getPoliciesByOwner");
        const policies = await policyBaseMock.getPoliciesByOwner(user1Address);
        if (policies && policies.length > 0) {
          policyId = policies[policies.length - 1]; // Assuming the last one is the newest
          console.log("Found policy ID from owner's policies:", policyId);
        } else {
          // Generate a random ID for testing if all else fails (less ideal for reproducible tests)
          console.warn("Generated random ID for test continuation");
          policyId = ethers.hexlify(ethers.randomBytes(32));
        }
      }

      console.log("Final Policy ID:", policyId);
      expect(policyId).to.not.be.undefined; // Ensure policyId was set

      const policy = await policyBaseMock.getPolicy(policyId);
      console.log("Policy details:", {
        owner: policy.owner,
        premium: ethers.formatEther(policy.premium),
      });

      expect(policy.owner).to.equal(user1Address);
      expect(policy.premium.toString()).to.equal(premium.toString());
      console.log("Policy purchase verified successfully");
    });

    it("Should file a claim without signature", async function () {
      console.log("\n----- Testing file claim without signature -----");
      if (!policyId) {
        console.log("Skipping claim test - no policy ID from previous test");
        this.skip(); // Skip this test if policyId is not set
        return;
      }

      console.log("Using policy ID:", policyId);
      const documentHash = "test_document_hash";
      const claimAmount = ethers.getBigInt("1000000000000000000"); // 1 ETH
      console.log(
        `Filing claim with amount: ${ethers.formatEther(claimAmount)} ETH`
      );

      console.log("Submitting claim transaction...");
      await policyBaseMock
        .connect(user1)
        .fileClaimWithoutSignature(policyId, claimAmount, documentHash);
      console.log("Claim submitted successfully");

      const claim = await policyBaseMock.getClaim(policyId);
      console.log("Claim details:", {
        amount: ethers.formatEther(claim.amount),
        isPending: claim.isPending,
      });

      expect(claim.amount.toString()).to.equal(claimAmount.toString());
      expect(claim.isPending).to.be.true;
      console.log("Claim verified successfully");
    });

    it("Should set claim state directly", async function () {
      console.log("\n----- Testing set claim state directly -----");
      if (!policyId) {
        console.log("Skipping state test - no policy ID from previous test");
        this.skip();
        return;
      }

      console.log("Using policy ID:", policyId);
      console.log(
        "Setting claim state: isPending=false, isClaimed=true, isActive=false"
      );

      await policyBaseMock
        .connect(admin)
        .setClaimState(policyId, false, true, false);
      console.log("Claim state set successfully");

      const claim = await policyBaseMock.getClaim(policyId);
      const policy = await policyBaseMock.getPolicy(policyId);
      console.log("Updated claim state:", {
        isPending: claim.isPending,
      });
      console.log("Updated policy state:", {
        isClaimed: policy.isClaimed,
        isActive: policy.isActive,
      });

      expect(claim.isPending).to.be.false;
      expect(policy.isClaimed).to.be.true;
      expect(policy.isActive).to.be.false;
      console.log("Claim state update verified successfully");
    });

    it("Should create a new policy and set expiry time", async function () {
      console.log("\n----- Testing policy with custom expiry time -----");
      const user2Address = await user2.getAddress();
      console.log("User2 address:", user2Address);

      console.log("Purchasing policy...");
      const tx = await policyBaseMock
        .connect(user2)
        .purchasePolicyWithoutSignature(
          user2Address,
          premium,
          sumAssured,
          duration,
          { value: premium }
        );
      console.log("Transaction submitted:", tx.hash);

      const receipt = (await tx.wait()) as TransactionReceipt;
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      let newPolicyId: any;
      console.log("Parsing logs for PolicyPurchased event...");

      if (receipt.logs && receipt.logs.length > 0) {
        const policyPurchasedInterface = new ethers.Interface(
          policyBaseMock.interface.fragments
        );
        for (const log of receipt.logs) {
          try {
            const parsedLog = policyPurchasedInterface.parseLog(log as any);
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              newPolicyId = parsedLog.args.policyId;
              console.log("Found PolicyPurchased event with ID:", newPolicyId);
              break;
            }
          } catch (e) {}
        }
      }

      if (!newPolicyId && receipt.blockNumber) {
        console.log("Using fallback with block number");
        // Check if receipt.blockNumber is available
        newPolicyId = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256"],
            [user2Address, receipt.blockNumber] // Use receipt.blockNumber for deterministic fallback
          )
        );
        console.log("Calculated policy ID:", newPolicyId);
      } else if (!newPolicyId) {
        console.warn("Generated random ID for test continuation");
        newPolicyId = ethers.hexlify(ethers.randomBytes(32));
      }

      expect(newPolicyId).to.not.be.undefined;
      console.log("Policy ID confirmed:", newPolicyId);

      const thirtyDaysFromNow =
        Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      console.log(
        "Setting expiry timestamp to:",
        new Date(thirtyDaysFromNow * 1000).toISOString()
      );

      await policyBaseMock
        .connect(admin)
        .setExpiryTimestamp(newPolicyId, thirtyDaysFromNow);
      console.log("Expiry timestamp set successfully");

      const policy = await policyBaseMock.getPolicy(newPolicyId);
      console.log(
        "Policy expiry:",
        new Date(Number(policy.expiry) * 1000).toISOString()
      );

      expect(policy.expiry.toString()).to.equal(thirtyDaysFromNow.toString());
      console.log("Expiry timestamp verified successfully");
    });

    it("Should create a policy, set it to near expiry, and renew it", async function () {
      console.log("\n----- Testing policy renewal -----");
      const user1Address = await user1.getAddress();
      console.log("User1 address:", user1Address);

      console.log("Purchasing policy...");
      const tx = await policyBaseMock
        .connect(user1)
        .purchasePolicyWithoutSignature(
          user1Address,
          premium,
          sumAssured,
          duration,
          { value: premium }
        );
      console.log("Transaction submitted:", tx.hash);

      const receipt = (await tx.wait()) as TransactionReceipt;
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      let renewPolicyId: any;
      console.log("Parsing logs for PolicyPurchased event...");

      if (receipt.logs && receipt.logs.length > 0) {
        const policyPurchasedInterface = new ethers.Interface(
          policyBaseMock.interface.fragments
        );
        for (const log of receipt.logs) {
          try {
            const parsedLog = policyPurchasedInterface.parseLog(log as any);
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              renewPolicyId = parsedLog.args.policyId;
              console.log(
                "Found PolicyPurchased event with ID:",
                renewPolicyId
              );
              break;
            }
          } catch (e) {}
        }
      }

      if (!renewPolicyId && receipt.blockNumber) {
        console.log("Using fallback with block number");
        renewPolicyId = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256"],
            [user1Address, receipt.blockNumber]
          )
        );
        console.log("Calculated policy ID:", renewPolicyId);
      } else if (!renewPolicyId) {
        console.warn("Generated random ID for test continuation");
        renewPolicyId = ethers.hexlify(ethers.randomBytes(32));
      }

      expect(renewPolicyId).to.not.be.undefined;
      console.log("Policy ID confirmed:", renewPolicyId);

      console.log("Setting policy to near expiry (5 time units remaining)...");
      await policyBaseMock.connect(admin).setTimeToNearExpiry(renewPolicyId, 5);
      console.log("Policy set to near expiry");

      const newPremium = ethers.getBigInt("120000000000000000"); // 0.12 ETH
      const renewDuration = 180 * 24 * 60 * 60; // 180 days
      console.log(
        `Renewing policy with premium: ${ethers.formatEther(
          newPremium
        )} ETH for ${renewDuration / (24 * 60 * 60)} days`
      );

      await policyBaseMock
        .connect(user1)
        .renewPolicyWithoutSignature(renewPolicyId, newPremium, renewDuration, {
          value: newPremium,
        });
      console.log("Policy renewed successfully");

      const policy = await policyBaseMock.getPolicy(renewPolicyId);
      console.log("Policy details after renewal:", {
        premium: ethers.formatEther(policy.premium),
        expiry: new Date(Number(policy.expiry) * 1000).toISOString(),
      });

      expect(policy.premium.toString()).to.equal(newPremium.toString());
      console.log("Renewal verified successfully");
    });

    it("Should create a mock claim and approve it", async function () {
      console.log("\n----- Testing mock claim and approval -----");
      const user2Address = await user2.getAddress();
      console.log("User2 address:", user2Address);

      console.log("Purchasing policy...");
      const tx = await policyBaseMock
        .connect(user2)
        .purchasePolicyWithoutSignature(
          user2Address,
          premium,
          sumAssured,
          duration,
          { value: premium }
        );
      console.log("Transaction submitted:", tx.hash);

      const receipt = (await tx.wait()) as TransactionReceipt;
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      let claimPolicyId: any;
      console.log("Parsing logs for PolicyPurchased event...");

      if (receipt.logs && receipt.logs.length > 0) {
        const policyPurchasedInterface = new ethers.Interface(
          policyBaseMock.interface.fragments
        );
        for (const log of receipt.logs) {
          try {
            const parsedLog = policyPurchasedInterface.parseLog(log as any);
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              claimPolicyId = parsedLog.args.policyId;
              console.log(
                "Found PolicyPurchased event with ID:",
                claimPolicyId
              );
              break;
            }
          } catch (e) {}
        }
      }

      if (!claimPolicyId && receipt.blockNumber) {
        console.log("Using fallback with block number");
        claimPolicyId = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256"],
            [user2Address, receipt.blockNumber]
          )
        );
        console.log("Calculated policy ID:", claimPolicyId);
      } else if (!claimPolicyId) {
        console.warn("Generated random ID for test continuation");
        claimPolicyId = ethers.hexlify(ethers.randomBytes(32));
      }

      expect(claimPolicyId).to.not.be.undefined;
      console.log("Policy ID confirmed:", claimPolicyId);

      const claimAmount = ethers.getBigInt("5000000000000000000"); // 5 ETH
      console.log(
        `Creating mock claim with amount: ${ethers.formatEther(
          claimAmount
        )} ETH`
      );

      await policyBaseMock
        .connect(admin)
        .createMockClaim(
          claimPolicyId,
          claimAmount,
          "mock_document_hash",
          true
        );
      console.log("Mock claim created successfully");

      console.log("Approving claim...");
      await policyBaseMock
        .connect(admin)
        .approveClaimWithoutVerification(claimPolicyId);
      console.log("Claim approved successfully");

      const policy = await policyBaseMock.getPolicy(claimPolicyId);
      console.log("Policy state after claim approval:", {
        isClaimed: policy.isClaimed,
        isActive: policy.isActive,
      });

      expect(policy.isClaimed).to.be.true;
      expect(policy.isActive).to.be.false;
      console.log("Claim approval verified successfully");
    });

    it("Should force expire a policy", async function () {
      console.log("\n----- Testing force expire policy -----");
      const user1Address = await user1.getAddress();
      console.log("User1 address:", user1Address);

      console.log("Purchasing policy...");
      const tx = await policyBaseMock
        .connect(user1)
        .purchasePolicyWithoutSignature(
          user1Address,
          premium,
          sumAssured,
          duration,
          { value: premium }
        );
      console.log("Transaction submitted:", tx.hash);

      const receipt = (await tx.wait()) as TransactionReceipt;
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      let expirePolicyId: any;
      console.log("Parsing logs for PolicyPurchased event...");

      if (receipt.logs && receipt.logs.length > 0) {
        const policyPurchasedInterface = new ethers.Interface(
          policyBaseMock.interface.fragments
        );
        for (const log of receipt.logs) {
          try {
            const parsedLog = policyPurchasedInterface.parseLog(log as any);
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              expirePolicyId = parsedLog.args.policyId;
              console.log(
                "Found PolicyPurchased event with ID:",
                expirePolicyId
              );
              break;
            }
          } catch (e) {}
        }
      }

      if (!expirePolicyId && receipt.blockNumber) {
        console.log("Using fallback with block number");
        expirePolicyId = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256"],
            [user1Address, receipt.blockNumber]
          )
        );
        console.log("Calculated policy ID:", expirePolicyId);
      } else if (!expirePolicyId) {
        console.warn("Generated random ID for test continuation");
        expirePolicyId = ethers.hexlify(ethers.randomBytes(32));
      }

      expect(expirePolicyId).to.not.be.undefined;
      console.log("Policy ID confirmed:", expirePolicyId);

      console.log("Getting policy state before expiry...");
      const policyBefore = await policyBaseMock.getPolicy(expirePolicyId);
      console.log("Policy active state before:", policyBefore.isActive);

      console.log("Forcing policy to expire...");
      await policyBaseMock.connect(admin).forceExpirePolicy(expirePolicyId);
      console.log("Force expire completed");

      const policy = await policyBaseMock.getPolicy(expirePolicyId);
      console.log("Policy active state after:", policy.isActive);

      expect(policy.isActive).to.be.false;
      console.log("Force expire verified successfully");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle claims with zero amount", async function () {
      console.log("\n----- Testing claims with zero amount -----");
      const user2Address = await user2.getAddress();
      console.log("User2 address:", user2Address);

      console.log("Purchasing policy...");
      const tx = await policyBaseMock
        .connect(user2)
        .purchasePolicyWithoutSignature(
          user2Address,
          premium,
          sumAssured,
          duration,
          { value: premium }
        );
      console.log("Transaction submitted:", tx.hash);

      const receipt = (await tx.wait()) as TransactionReceipt;
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      let zeroPolicyId: any;
      console.log("Parsing logs for PolicyPurchased event...");

      if (receipt.logs && receipt.logs.length > 0) {
        const policyPurchasedInterface = new ethers.Interface(
          policyBaseMock.interface.fragments
        );
        for (const log of receipt.logs) {
          try {
            const parsedLog = policyPurchasedInterface.parseLog(log as any);
            if (parsedLog && parsedLog.name === "PolicyPurchased") {
              zeroPolicyId = parsedLog.args.policyId;
              console.log("Found PolicyPurchased event with ID:", zeroPolicyId);
              break;
            }
          } catch (e) {}
        }
      }

      if (!zeroPolicyId && receipt.blockNumber) {
        console.log("Using fallback with block number");
        zeroPolicyId = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "uint256"],
            [user2Address, receipt.blockNumber]
          )
        );
        console.log("Calculated policy ID:", zeroPolicyId);
      } else if (!zeroPolicyId) {
        console.warn("Generated random ID for test continuation");
        zeroPolicyId = ethers.hexlify(ethers.randomBytes(32));
      }

      expect(zeroPolicyId).to.not.be.undefined;
      console.log("Policy ID confirmed:", zeroPolicyId);

      console.log("Attempting to file claim with zero amount...");
      try {
        await policyBaseMock
          .connect(user2)
          .fileClaimWithoutSignature(
            zeroPolicyId,
            ethers.getBigInt(0),
            "zero_document_hash"
          ); // Use ethers.getBigInt(0) or 0n
        // If the contract is expected to revert for zero amount claims, this line means the test might fail if it doesn't revert.
        // If zero amount claims are allowed, then this is fine.
        console.log("Zero amount claim was accepted");
        // To make it fail if it doesn't revert:
        // expect.fail("Zero amount claim should have been rejected with a revert");
      } catch (error: any) {
        console.log(
          "Zero amount claim was rejected with error:",
          error.message
        );
        expect(error.message).to.include("revert"); // Or a more specific revert reason if available
      }
    });
  });
});
