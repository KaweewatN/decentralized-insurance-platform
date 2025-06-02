// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/PolicyBase.sol";
import "../utils/InsuranceVault.sol";

/// @title PolicyBaseMock - UPDATED TO MATCH SIMPLIFIED POLICYBASE
/// @notice Mock implementation of PolicyBase for testing (no signatures)
contract PolicyBaseMock is PolicyBase {
    struct MockPolicyData {
        string metadata;
        bool processed;
    }
    
    mapping(bytes32 => MockPolicyData) private mockPolicyData;

    // 🔧 FIX: Remove _trustedSigner parameter to match parent
    constructor(address payable _vaultAddress) 
        PolicyBase(_vaultAddress) 
    {}

    function _processPolicyData(bytes32 policyId) internal override {
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
    ) public payable returns (bytes32) {
        require(owner != address(0), "Invalid owner");
        require(premium > 0 && sumAssured > 0 && duration > 0, "Invalid parameters");
        require(msg.value == premium, "Incorrect premium");
        
        // 🔧 FIX: Updated policy ID generation to match parent
        bytes32 policyId = keccak256(abi.encodePacked(
            owner, 
            block.timestamp, 
            block.number,
            address(this)
        ));

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

        _processPolicyData(policyId);

        // Send to vault
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Vault transfer failed");

        emit PolicyPurchased(policyId, owner, premium, sumAssured, block.timestamp + duration);
        return policyId;
    }

    /// @notice File a claim without signature verification (for testing only)
    function fileClaimWithoutSignature(
        bytes32 policyId,
        uint256 amount
    ) public validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        
        require(policy.isActive, "Policy not active");
        require(amount > 0, "Invalid amount");
        require(!claims[policyId].isPending, "Claim exists");
        
        // Create claim (same structure as base contract)
        claims[policyId] = ClaimRequest({
            amount: amount,
            isPending: true
        });

        emit ClaimFiled(policyId, policy.owner, amount);
    }

    /// @notice Cancel policy without signature verification (for testing only)
    function cancelPolicyWithoutSignature(
        bytes32 policyId,
        uint256 refundAmount
    ) public onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        
        policy.isActive = false;
        vault.sendRefund(payable(policy.owner), refundAmount);

        emit PolicyCancelled(policyId, policy.owner, refundAmount);
    }

    // Test utility functions
    function getMockPolicyData(bytes32 policyId) external view returns (MockPolicyData memory) {
        return mockPolicyData[policyId];
    }

    function forceExpirePolicy(bytes32 policyId) external onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");

        policy.isActive = false;
        policy.expiry = block.timestamp - 1;
    }

    function setExpiryTimestamp(
        bytes32 policyId,
        uint256 expiryTimestamp
    ) external onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        policy.expiry = expiryTimestamp;
        
        if (expiryTimestamp <= block.timestamp && policy.isActive) {
            policy.isActive = false;
        }
    }

    function setClaimState(
        bytes32 policyId,
        bool isPending
    ) external onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        ClaimRequest storage claim = claims[policyId];
        claim.isPending = isPending;
    }

    function setPolicyState(
        bytes32 policyId,
        bool isActive,
        bool isClaimed
    ) external onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        policy.isActive = isActive;
        policy.isClaimed = isClaimed;
    }

    /// @notice Create a mock claim directly (for testing only)
    function createMockClaim(
        bytes32 policyId,
        uint256 amount,
        bool isPending
    ) external onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        claims[policyId] = ClaimRequest({
            amount: amount,
            isPending: isPending
        });
        
        Policy storage policy = policies[policyId];
        emit ClaimFiled(policyId, policy.owner, amount);
    }

    /// @notice Approve claim without additional verification (for testing only)
    function approveClaimWithoutVerification(
        bytes32 policyId
    ) external onlyRole(ADMIN_ROLE) validPolicy(policyId) returns (uint256) {
        ClaimRequest storage claim = claims[policyId];
        Policy storage policy = policies[policyId];

        require(claim.isPending, "No pending claim");

        // Same behavior as base contract
        claim.isPending = false;
        policy.isClaimed = true;
        policy.isActive = false;

        vault.approveClaim(payable(policy.owner), claim.amount);

        emit ClaimApproved(policyId, policy.owner, claim.amount);
        return claim.amount;
    }

    /// @notice Simulate vault transfer for testing
    function simulateVaultTransfer(address payable to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");
    }

    // 🔧 FIX: Remove override since renewPolicy doesn't exist in parent
    // Add PolicyRenewed event since it's missing
    event PolicyRenewed(bytes32 indexed policyId, address indexed owner, uint256 premium, uint256 newExpiry);

    function renewPolicy(
        bytes32 policyId,
        uint256 premium,
        uint256 duration
    ) external payable validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.owner == msg.sender, "Not the policy owner");
        require(msg.value == premium, "Incorrect premium");
        require(!policy.isClaimed, "Policy already claimed");
        
        // 🔧 FIX: Remove signature verification
        policy.premium = premium;
        policy.expiry = policy.expiry + duration;
        
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Vault transfer failed");
        
        emit PolicyRenewed(policyId, policy.owner, premium, policy.expiry);
    }

    /// @notice Renew policy without signature verification (for testing only)
    function renewPolicyWithoutSignature(
        bytes32 policyId,
        uint256 premium,
        uint256 duration
    ) external payable validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.owner == msg.sender, "Not the policy owner");
        require(msg.value == premium, "Incorrect premium");
        require(!policy.isClaimed, "Policy already claimed");
        
        policy.premium = premium;
        policy.expiry = policy.expiry + duration;
        
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Vault transfer failed");
        
        emit PolicyRenewed(policyId, policy.owner, premium, policy.expiry);
    }
}