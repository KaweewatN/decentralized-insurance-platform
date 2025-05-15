// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/PolicyBase.sol";
import "../utils/InsuranceVault.sol";

/// @title PolicyBaseMock
/// @notice Mock implementation of PolicyBase for testing
contract PolicyBaseMock is PolicyBase {
    // Define a policy data structure for testing
    struct MockPolicyData {
        string metadata;
        bool processed;
    }
    
    // Mapping to store mock policy data
    mapping(bytes32 => MockPolicyData) private mockPolicyData;
    
    // Mock vault for testing
    address private mockVaultReceiver;

    constructor(address _trustedSigner, address payable _vaultAddress) 
        PolicyBase(_trustedSigner, _vaultAddress) 
    {
        // Set a mock vault receiver for testing
        mockVaultReceiver = address(this);
    }

    /// @notice Process policy-specific data for the mock implementation
    /// @param policyId The ID of the policy
    function _processPolicyData(bytes32 policyId) internal override {
        // Minimal implementation for testing
        mockPolicyData[policyId] = MockPolicyData({
            metadata: "Test Metadata",
            processed: true
        });
    }

    /// @notice Mock function to directly purchase a policy without signature verification
    function purchasePolicyWithoutSignature(
        address owner,
        uint256 premium,
        uint256 sumAssured,
        uint256 duration
    ) public payable {
        require(owner != address(0), "Invalid owner address");
        require(premium > 0, "Premium must be positive");
        require(sumAssured > 0, "Sum assured must be positive");
        require(duration > 0, "Duration must be positive");
        require(msg.value == premium, "Incorrect premium amount");
        
        // Generate a unique policy ID
        bytes32 policyId = generatePolicyId(owner, block.timestamp);
        require(!policies[policyId].isActive, "Policy already exists");

        policies[policyId] = Policy({
            policyId: policyId,
            owner: owner,
            premium: premium,
            sumAssured: sumAssured,
            expiry: block.timestamp + duration,
            isActive: true,
            isClaimed: false,
            createdAt: block.timestamp
        });

        // Process policy-specific data
        _processPolicyData(policyId);
        
        // ส่งเงินไปยัง vault (ในกรณีนี้ ใช้ address นี้เป็น mock)
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Premium transfer to vault failed");

        emit PolicyPurchased(policyId, owner, premium, sumAssured, block.timestamp + duration);
    }

    /// @notice Test version of purchasePolicy with signature verification
    function purchasePolicyWithSignature(
        address owner,
        uint256 premium,
        uint256 sumAssured,
        uint256 duration,
        bytes memory signature
    ) public payable nonReentrant {
        require(owner != address(0), "Invalid owner address");
        require(premium > 0, "Premium must be positive");
        require(sumAssured > 0, "Sum assured must be positive");
        require(duration > 0, "Duration must be positive");
        require(msg.value == premium, "Incorrect premium amount");
        
        // Create hash of the policy parameters for signature verification
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                owner,
                premium,
                sumAssured,
                duration,
                block.chainid
            )
        );
        
        // Verify the signature
        require(verifySignature(messageHash, signature), "Invalid signature");
        
        // Mark signature as used
        usedSignatures[keccak256(signature)] = true;
        
        // Generate a unique policy ID
        bytes32 policyId = generatePolicyId(owner, block.timestamp);
        require(!policies[policyId].isActive, "Policy already exists");

        policies[policyId] = Policy({
            policyId: policyId,
            owner: owner,
            premium: premium,
            sumAssured: sumAssured,
            expiry: block.timestamp + duration,
            isActive: true,
            isClaimed: false,
            createdAt: block.timestamp
        });

        // Process policy-specific data
        _processPolicyData(policyId);
        
        // ส่งเงินไปยัง vault
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Premium transfer to vault failed");

        emit PolicyPurchased(policyId, owner, premium, sumAssured, block.timestamp + duration);
    }

    /// @notice Get mock policy data for testing
    function getMockPolicyData(bytes32 policyId) external view returns (MockPolicyData memory) {
        return mockPolicyData[policyId];
    }

    /// @notice Force expire a policy (for testing only)
    function forceExpirePolicy(bytes32 policyId) external onlyRole(ADMIN_ROLE) {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");

        policy.isActive = false;
        policy.expiry = block.timestamp - 1;

        emit PolicyExpired(policyId, policy.owner);
    }

    /// @notice Simulate time passing (for testing only)
    function advanceTime(bytes32 policyId, uint256 timeToAdvance) external onlyRole(ADMIN_ROLE) {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        
        // Reduce expiry time to simulate time passing
        if (policy.expiry > timeToAdvance) {
            policy.expiry -= timeToAdvance;
        } else {
            policy.expiry = 0;
        }
    }

    /// @notice File a claim without signature verification (for testing only)
    /// @param policyId The ID of the policy
    /// @param amount Claim amount
    /// @param documentHash Hash of supporting documents
    function fileClaimWithoutSignature(
        bytes32 policyId,
        uint256 amount,
        string memory documentHash
    ) public validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(amount <= policy.sumAssured, "Claim exceeds sum assured");
        require(!policy.isClaimed, "Policy already claimed");
        require(block.timestamp < policy.expiry, "Policy expired");
        
        claims[policyId] = ClaimRequest({
            policyId: policyId,
            amount: amount,
            documentHash: documentHash,
            isPending: true,
            createdAt: block.timestamp,
            expiryTimestamp: block.timestamp + claimExpiryPeriod
        });

        emit ClaimFiled(policyId, policy.owner, amount, documentHash);
    }

    /// @notice Set claim state directly (for testing only)
    /// @param policyId The ID of the policy
    /// @param isPending Whether the claim is pending
    /// @param isClaimed Whether the policy is marked as claimed
    /// @param isActive Whether the policy is still active
    function setClaimState(
        bytes32 policyId,
        bool isPending,
        bool isClaimed,
        bool isActive
    ) external onlyRole(ADMIN_ROLE) {
        // Retrieve the policy and claim
        Policy storage policy = policies[policyId];
        ClaimRequest storage claim = claims[policyId];
        
        require(policy.policyId == policyId, "Policy does not exist");
        
        // Update claim state
        claim.isPending = isPending;
        
        // Update policy state
        policy.isClaimed = isClaimed;
        policy.isActive = isActive;
    }

    /// @notice Renew policy without signature verification (for testing only)
    /// @param policyId The ID of the policy to renew
    /// @param premium New premium amount
    /// @param duration Additional duration in seconds
    function renewPolicyWithoutSignature(
        bytes32 policyId,
        uint256 premium,
        uint256 duration
    ) external payable validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.owner == msg.sender, "Not the policy owner");
        require(msg.value == premium, "Incorrect premium amount");
        require(!policy.isClaimed, "Policy already claimed");
        
        // Update policy
        policy.premium = premium;
        policy.expiry = policy.expiry + duration;
        
        // ส่งเงินไปยัง vault
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Premium transfer to vault failed");
        
        emit PolicyRenewed(policyId, policy.owner, premium, policy.expiry);
    }

    /// @notice Set policy expiry time directly (for testing only)
    /// @param policyId The ID of the policy
    /// @param expiryTimestamp New expiry timestamp
    function setExpiryTimestamp(
        bytes32 policyId,
        uint256 expiryTimestamp
    ) external onlyRole(ADMIN_ROLE) {
        Policy storage policy = policies[policyId];
        require(policy.policyId == policyId, "Policy does not exist");
        
        policy.expiry = expiryTimestamp;
        
        // If the new expiry is in the past, mark the policy as expired
        if (expiryTimestamp <= block.timestamp && policy.isActive) {
            policy.isActive = false;
            emit PolicyExpired(policyId, policy.owner);
        }
    }
    
    /// @notice Set policy timestamp to near expiry (for testing only)
    /// @param policyId The ID of the policy
    /// @param daysBeforeExpiry Number of days before expiry
    function setTimeToNearExpiry(
        bytes32 policyId,
        uint256 daysBeforeExpiry
    ) external onlyRole(ADMIN_ROLE) {
        Policy storage policy = policies[policyId];
        require(policy.policyId == policyId, "Policy does not exist");
        require(policy.isActive, "Policy not active");
        
        // Calculate new expiry timestamp (current time + specified days)
        uint256 newExpiry = block.timestamp + (daysBeforeExpiry * 1 days);
        
        // Ensure the new expiry is not greater than the original expiry
        require(newExpiry <= policy.expiry, "New expiry exceeds original expiry");
        
        policy.expiry = newExpiry;
    }

    /// @notice Create a mock claim directly (for testing only)
    /// @param policyId The ID of the policy
    /// @param amount Claim amount
    /// @param documentHash Hash of supporting documents
    /// @param isPending Whether the claim is pending
    function createMockClaim(
        bytes32 policyId,
        uint256 amount,
        string memory documentHash,
        bool isPending
    ) external onlyRole(ADMIN_ROLE) {
        Policy storage policy = policies[policyId];
        require(policy.policyId == policyId, "Policy does not exist");
        
        claims[policyId] = ClaimRequest({
            policyId: policyId,
            amount: amount,
            documentHash: documentHash,
            isPending: isPending,
            createdAt: block.timestamp,
            expiryTimestamp: block.timestamp + claimExpiryPeriod
        });
        
        emit ClaimFiled(policyId, policy.owner, amount, documentHash);
    }

    /// @notice Approve claim without signature verification (for testing only)
    /// @param policyId The ID of the policy
    function approveClaimWithoutVerification(
        bytes32 policyId
    ) external onlyRole(ADMIN_ROLE) validPolicy(policyId) returns (uint256) {
        ClaimRequest storage claim = claims[policyId];
        Policy storage policy = policies[policyId];

        require(claim.isPending, "No pending claim");
        
        claim.isPending = false;
        policy.isClaimed = true;
        policy.isActive = false;

        // ใช้ vault ในการโอนเงินให้ policy owner
        vault.approveClaim(payable(policy.owner), claim.amount);

        emit ClaimApproved(policyId, policy.owner, claim.amount);
        return claim.amount;
    }
    
    /// @notice Set a mock vault receiver for testing
    /// @param newReceiver The address that will receive funds
    function setMockVaultReceiver(address newReceiver) external onlyRole(ADMIN_ROLE) {
        mockVaultReceiver = newReceiver;
    }
    
    /// @notice Mock function to simulate fund transfer (for testing only)
    /// @param to Address to send funds to
    /// @param amount Amount to send
    function simulateVaultTransfer(address payable to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");
    }

    /// @notice Override for testing purpose - cancellation without real transfer
    function cancelPolicyWithoutTransfer(
        bytes32 policyId
    ) external onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        policy.isActive = false;
        
        emit PolicyCancelled(policyId, policy.owner, 0);
    }
}